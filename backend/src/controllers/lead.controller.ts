import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbStore, loadData, saveData, logAudit, generateID } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper: Calculate lead score & priority
function calculateLeadScoreAndPriority(leadData: any) {
  let score = 50;
  const budget = Number(leadData.budget_max || leadData.budget_min || 0);

  if (budget >= 10000000) score += 25; // 1 Cr+
  else if (budget >= 7000000) score += 15; // 70L+

  if (['Facebook', 'Google Ads', 'Website', 'Referral', 'Developer'].includes(leadData.source)) score += 10;
  if (leadData.loan_required) score += 5;
  if (leadData.possession_preference && leadData.possession_preference.includes('Immediate')) score += 10;

  let priority: 'HOT' | 'WARM' | 'COLD' = 'WARM';
  if (score >= 80) priority = 'HOT';
  else if (score >= 60) priority = 'WARM';
  else priority = 'COLD';

  return { score, priority };
}

// 1. Get Leads (Supporting Central Inbox 11 Tabs)
export async function getLeads(req: AuthRequest, res: Response) {
  loadData();
  const user = req.user!;
  const { tab = 'all', search = '', source = '', priority = '', status = '', sales_exec_id = '' } = req.query;

  let leads = dbStore.data.leads || [];

  // Filter by user role data scope
  if (user.role === 'SALES_EXEC' || user.role === 'TELECALLER' || user.role === 'FIELD_EXEC') {
    leads = leads.filter(l => l.assigned_employee_id === user.id);
  } else if (sales_exec_id) {
    leads = leads.filter(l => l.assigned_employee_id === sales_exec_id);
  }

  // Filter by Tab
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (tab === 'unassigned') {
    leads = leads.filter(l => !l.assigned_employee_id);
  } else if (tab === 'my_leads') {
    leads = leads.filter(l => l.assigned_employee_id === user.id);
  } else if (tab === 'today_followups') {
    leads = leads.filter(l => l.next_followup && l.next_followup.startsWith(todayStr) && l.lead_status !== 'LOST' && l.lead_status !== 'CONVERTED');
  } else if (tab === 'overdue_followups') {
    leads = leads.filter(l => l.next_followup && new Date(l.next_followup) < now && !l.next_followup.startsWith(todayStr) && l.lead_status !== 'LOST' && l.lead_status !== 'CONVERTED');
  } else if (tab === 'nurture') {
    leads = leads.filter(l => l.lead_status === 'NURTURE' || l.lead_status === 'RECYCLE');
  } else if (tab === 'interested') {
    leads = leads.filter(l => ['INTERESTED', 'REQUIREMENT_COLLECTED'].includes(l.lead_status));
  } else if (tab === 'matching') {
    leads = leads.filter(l => ['MATCHING_PENDING', 'MATCHING_DONE'].includes(l.lead_status));
  } else if (tab === 'visit') {
    leads = leads.filter(l => ['VISIT_PLANNED', 'VISIT_COMPLETED'].includes(l.lead_status));
  } else if (tab === 'converted') {
    leads = leads.filter(l => ['CONVERTED', 'BOOKING_PROCESS'].includes(l.lead_status));
  } else if (tab === 'lost_closed') {
    leads = leads.filter(l => ['LOST', 'CANCELLED', 'NOT_INTERESTED'].includes(l.lead_status));
  }

  // Filter by Source, Priority, Status
  if (source) leads = leads.filter(l => l.source === source);
  if (priority) leads = leads.filter(l => l.priority === priority);
  if (status) leads = leads.filter(l => l.lead_status === status);

  // Universal Search
  if (search) {
    const q = String(search).toLowerCase().trim();
    leads = leads.filter(l =>
      (l.lead_number && l.lead_number.toLowerCase().includes(q)) ||
      (l.customer_name && l.customer_name.toLowerCase().includes(q)) ||
      (l.mobile && l.mobile.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.customer_number && l.customer_number.toLowerCase().includes(q)) ||
      (l.preferred_location && l.preferred_location.toLowerCase().includes(q))
    );
  }

  // Enrich leads with Customer details & Sales Executive Name
  const enriched = leads.map(l => {
    const cust = dbStore.data.customers.find(c => c.id === l.customer_id || c.customer_number === l.customer_id);
    const assignedUser = dbStore.data.users.find(u => u.id === l.assigned_employee_id);
    return {
      ...l,
      customer_name: l.customer_name || cust?.full_name || 'Prospect Customer',
      mobile: l.mobile || cust?.mobile || 'N/A',
      email: l.email || cust?.email || 'N/A',
      customer_number: cust?.customer_number || null,
      assigned_employee_name: assignedUser ? assignedUser.full_name : 'Unassigned'
    };
  });

  return res.json({
    status: 'SUCCESS',
    data: enriched,
    total_count: enriched.length,
    counts: {
      all: dbStore.data.leads.length,
      unassigned: dbStore.data.leads.filter(l => !l.assigned_employee_id).length,
      my_leads: dbStore.data.leads.filter(l => l.assigned_employee_id === user.id).length,
      today_followups: dbStore.data.leads.filter(l => l.next_followup && l.next_followup.startsWith(todayStr)).length,
      overdue_followups: dbStore.data.leads.filter(l => l.next_followup && new Date(l.next_followup) < now && !l.next_followup.startsWith(todayStr)).length
    }
  });
}

// 2. Check Duplicate Lead
export async function checkDuplicateLead(req: AuthRequest, res: Response) {
  const { mobile, alternate_mobile, whatsapp_number, email } = req.body;
  loadData();

  const cleanMobile = mobile ? mobile.replace(/\D/g, '') : '';
  const cleanAltMobile = alternate_mobile ? alternate_mobile.replace(/\D/g, '') : '';
  const cleanWa = whatsapp_number ? whatsapp_number.replace(/\D/g, '') : '';

  const existingLead = dbStore.data.leads.find(l => {
    if (cleanMobile && l.mobile && l.mobile.replace(/\D/g, '') === cleanMobile) return true;
    if (cleanAltMobile && l.alternate_mobile && l.alternate_mobile.replace(/\D/g, '') === cleanAltMobile) return true;
    if (cleanWa && l.whatsapp_number && l.whatsapp_number.replace(/\D/g, '') === cleanWa) return true;
    if (email && l.email && l.email.toLowerCase() === email.toLowerCase()) return true;
    return false;
  });

  if (existingLead) {
    const owner = dbStore.data.users.find(u => u.id === existingLead.assigned_employee_id);
    return res.json({
      status: 'DUPLICATE_FOUND',
      message: 'Possible Duplicate Lead Detected in Database',
      existing_lead: {
        lead_id: existingLead.id,
        lead_number: existingLead.lead_number,
        customer_name: existingLead.customer_name,
        mobile: existingLead.mobile,
        assigned_to: owner ? owner.full_name : 'Unassigned',
        status: existingLead.lead_status,
        created_at: existingLead.created_at
      }
    });
  }

  return res.json({
    status: 'NO_DUPLICATE',
    message: 'No duplicate lead found.'
  });
}

// 3. Create New Lead
export async function createLead(req: AuthRequest, res: Response) {
  const {
    source, customer_name, mobile, alternate_mobile, whatsapp_number, email,
    preferred_location, preferred_project, property_type, bhk, budget_min, budget_max,
    purpose, possession_preference, loan_required, occupation, priority: manualPriority,
    campaign, source_details, assigned_employee_id, remarks
  } = req.body;

  if (!customer_name || !mobile) {
    return res.status(400).json({ status: 'ERROR', message: 'customer_name and mobile are required.' });
  }

  loadData();

  const leadNumber = generateID('SRM-LEAD'); // SRM-LEAD-2026-001246
  const customerNumber = generateID('SRM-CUS');

  const { score, priority } = calculateLeadScoreAndPriority(req.body);
  const leadPriority = manualPriority || priority;

  const newCustId = uuidv4();
  const newLeadId = uuidv4();

  // Create linked Customer Master
  const newCustomer = {
    id: newCustId,
    customer_number: customerNumber,
    full_name: customer_name,
    mobile,
    alt_mobile: alternate_mobile || null,
    alternate_mobile: alternate_mobile || null,
    whatsapp_number: whatsapp_number || mobile,
    email: email || '',
    city: req.body.city || 'Kolkata',
    preferred_location: preferred_location || '',
    property_type: property_type || 'Flat / Apartment',
    configuration: bhk || '3BHK',
    budget_min: Number(budget_min) || 0,
    budget_max: Number(budget_max) || 0,
    loan_required: Boolean(loan_required),
    investment_purpose: purpose || 'Self Use',
    purchase_timeline: possession_preference || 'Immediate (< 30 Days)',
    source: source || 'Facebook',
    assigned_employee_id: assigned_employee_id || req.user?.id || 'USR-07',
    customer_status: 'NEW',
    status: 'NEW',
    priority: leadPriority,
    quality_score: score,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  };

  const newLead = {
    id: newLeadId,
    lead_number: leadNumber,
    customer_id: newCustId,
    customer_number: customerNumber,
    customer_name,
    mobile,
    alternate_mobile: alternate_mobile || null,
    whatsapp_number: whatsapp_number || mobile,
    email: email || '',
    source: source || 'Facebook',
    campaign: campaign || 'Summer Campaign 2026',
    source_details: source_details || null,
    preferred_location: preferred_location || '',
    preferred_project: preferred_project || '',
    property_type: property_type || 'Flat / Apartment',
    bhk: bhk || '3BHK',
    budget_min: Number(budget_min) || 0,
    budget_max: Number(budget_max) || 8000000,
    purpose: purpose || 'Self Use',
    possession_preference: possession_preference || 'Immediate (< 30 Days)',
    loan_required: Boolean(loan_required),
    occupation: occupation || 'IT Professional',
    priority: leadPriority,
    lead_status: 'NEW',
    call_disposition: 'NEW_LEAD_CREATED',
    next_action: 'CONTACT_CUSTOMER',
    next_followup: new Date(Date.now() + 24 * 3600000).toISOString(),
    assigned_employee_id: assigned_employee_id || req.user?.id || 'USR-07',
    assigned_by: req.user?.id || 'USR-01',
    created_by: req.user?.id || 'USR-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    quality_score: score,
    remarks: remarks || 'New lead captured into central database.'
  };

  dbStore.data.customers.unshift(newCustomer);
  dbStore.data.leads.unshift(newLead);

  logAudit(req.user?.id || null, 'CREATE_LEAD', 'LEAD', `Created Lead ${leadNumber} for ${customer_name}`, req.ip);
  saveData();

  return res.status(201).json({
    status: 'SUCCESS',
    message: 'Lead created successfully in central database.',
    data: newLead
  });
}

// 4. Log Call Disposition & Next Action
export async function logCallDisposition(req: AuthRequest, res: Response) {
  const {
    lead_id, call_type = 'Outgoing', duration_seconds = 60,
    disposition, next_action, next_followup_date, next_followup_time,
    reason, remarks, updated_status
  } = req.body;

  if (!lead_id || !disposition || !next_action) {
    return res.status(400).json({ status: 'ERROR', message: 'lead_id, disposition, and next_action are required.' });
  }

  loadData();

  const lead = dbStore.data.leads.find(l => l.id === lead_id || l.lead_number === lead_id);
  if (!lead) {
    return res.status(404).json({ status: 'ERROR', message: 'Lead not found.' });
  }

  // Mandatory follow-up date/time rule for follow-up dispositions
  const followUpRequiredDispositions = [
    'CALL_BACK_LATER', 'CUSTOMER_BUSY', 'CUSTOMER_DRIVING', 'CUSTOMER_IN_MEETING',
    'CALL_TOMORROW', 'CALL_NEXT_WEEK', 'FAMILY_DISCUSSION', 'PRICE_DISCUSSION',
    'PROPERTY_SEARCH_LATER', 'WAITING_FOR_SALARY', 'WAITING_FOR_LOAN', 'WAITING_FOR_DOCUMENTS',
    'NO_ANSWER', 'CONNECTED_INTERESTED'
  ];

  const requiresFollowUp = followUpRequiredDispositions.includes(disposition) || next_action === 'Call Again' || next_action === 'Follow Up Later';

  if (requiresFollowUp && (!next_followup_date || !next_followup_time)) {
    return res.status(400).json({
      status: 'ERROR',
      message: `Disposition '${disposition}' requires Next Follow-Up Date and Time.`
    });
  }

  let nextFollowupIso = lead.next_followup;
  if (next_followup_date && next_followup_time) {
    nextFollowupIso = `${next_followup_date}T${next_followup_time}:00`;
  }

  // Determine updated status
  let newStatus = updated_status || lead.lead_status;
  if (disposition === 'NOT_INTERESTED' || disposition === 'Wrong Number' || disposition === 'Invalid Number') {
    newStatus = 'NOT_INTERESTED';
  } else if (disposition === 'INTERESTED' || disposition === 'Need More Info') {
    newStatus = 'INTERESTED';
  } else if (requiresFollowUp && newStatus === 'NEW') {
    newStatus = 'CONTACTING';
  }

  lead.call_disposition = disposition;
  lead.next_action = next_action;
  lead.next_followup = nextFollowupIso;
  lead.lead_status = newStatus;
  lead.updated_at = new Date().toISOString();

  // Create Activity Log Entry
  const activity = {
    id: uuidv4(),
    lead_id: lead.lead_number,
    customer_id: lead.customer_id,
    type: 'CALL_LOGGED',
    call_type,
    duration_seconds,
    disposition,
    next_action,
    next_followup_date,
    next_followup_time,
    reason: reason || remarks || '',
    remarks: remarks || '',
    performed_by_id: req.user?.id || 'USR-07',
    performed_by_name: req.user?.username || 'Sales Executive',
    timestamp: new Date().toISOString()
  };

  dbStore.data.employee_activities.unshift(activity);

  // If follow-up required, record follow-up task
  if (requiresFollowUp) {
    const followupTask = {
      id: uuidv4(),
      followup_code: generateID('SRM-FLP'),
      lead_id: lead.lead_number,
      customer_id: lead.customer_id,
      customer_name: lead.customer_name,
      mobile: lead.mobile,
      assigned_to: lead.assigned_employee_id,
      due_date: next_followup_date,
      due_time: next_followup_time,
      reason: reason || `Callback requested via ${disposition}`,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    dbStore.data.followups.unshift(followupTask);
  }

  logAudit(req.user?.id || null, 'CALL_DISPOSITION_LOGGED', 'LEAD', `Logged call disposition ${disposition} for Lead ${lead.lead_number}`, req.ip);
  saveData();

  return res.json({
    status: 'SUCCESS',
    message: 'Call disposition and next action logged successfully.',
    data: {
      lead_id: lead.lead_number,
      lead_status: lead.lead_status,
      disposition,
      next_action,
      next_followup: nextFollowupIso
    }
  });
}

// 5. Get Lead Journey 360° Trace
export async function getLeadJourney360(req: AuthRequest, res: Response) {
  const { id } = req.params;
  loadData();

  const lead = dbStore.data.leads.find(l => l.id === id || l.lead_number === id);
  if (!lead) {
    return res.status(404).json({ status: 'ERROR', message: 'Lead not found.' });
  }

  const customer = dbStore.data.customers.find(c => c.id === lead.customer_id || c.customer_number === lead.customer_id);
  const matchRequests = dbStore.data.recommendation_shares.filter(r => r.customer_number === customer?.customer_number || r.customer_number === lead.customer_id);
  const siteVisits = dbStore.data.site_visits.filter(v => v.lead_id === lead.lead_number || v.customer_number === customer?.customer_number);
  const bookings = dbStore.data.bookings.filter(b => b.lead_id === lead.lead_number || b.customer_number === customer?.customer_number);
  const agreements = dbStore.data.agreements.filter(a => a.party_name === lead.customer_name || a.party_mobile_email?.includes(lead.mobile));
  const invoices = dbStore.data.invoices.filter(i => i.customer_name === lead.customer_name);
  const activities = dbStore.data.employee_activities.filter(a => a.lead_id === lead.lead_number);

  return res.json({
    status: 'SUCCESS',
    data: {
      lead,
      customer,
      journey_timeline: {
        lead_id: lead.lead_number,
        customer_id: customer?.customer_number || 'N/A',
        match_requests: matchRequests,
        site_visits: siteVisits,
        agreements,
        bookings,
        invoices,
        activities
      }
    }
  });
}

// 6. Lead Transfer
export async function transferLead(req: AuthRequest, res: Response) {
  const { lead_id, new_assigned_employee_id, reason } = req.body;
  if (!lead_id || !new_assigned_employee_id || !reason) {
    return res.status(400).json({ status: 'ERROR', message: 'lead_id, new_assigned_employee_id, and reason are required.' });
  }

  loadData();

  const lead = dbStore.data.leads.find(l => l.id === lead_id || l.lead_number === lead_id);
  if (!lead) {
    return res.status(404).json({ status: 'ERROR', message: 'Lead not found.' });
  }

  const oldOwner = dbStore.data.users.find(u => u.id === lead.assigned_employee_id);
  const newOwner = dbStore.data.users.find(u => u.id === new_assigned_employee_id);

  lead.assigned_employee_id = new_assigned_employee_id;
  lead.updated_at = new Date().toISOString();

  const transferLog = {
    id: uuidv4(),
    lead_id: lead.lead_number,
    old_owner: oldOwner ? oldOwner.full_name : 'Unassigned',
    new_owner: newOwner ? newOwner.full_name : 'New Executive',
    transferred_by: req.user?.username || 'Admin',
    transferred_at: new Date().toISOString(),
    reason
  };

  dbStore.data.lead_transfers.unshift(transferLog);
  logAudit(req.user?.id || null, 'LEAD_TRANSFERRED', 'LEAD', `Transferred Lead ${lead.lead_number} to ${newOwner?.full_name}`, req.ip);
  saveData();

  return res.json({
    status: 'SUCCESS',
    message: `Lead ${lead.lead_number} successfully transferred to ${newOwner?.full_name}.`,
    data: transferLog
  });
}

// 7. Lead Source Performance Report
export async function getLeadSourceReport(req: AuthRequest, res: Response) {
  loadData();
  const leads = dbStore.data.leads || [];

  const sources = ['Facebook', 'Instagram', 'Google Ads', 'Website', 'WhatsApp', 'Phone Call', 'Walk-in', 'Referral', 'Developer', 'Existing Customer', 'Broker Reference', 'Other'];

  const report = sources.map(src => {
    const srcLeads = leads.filter(l => l.source === src);
    const total = srcLeads.length;
    const interested = srcLeads.filter(l => ['INTERESTED', 'MATCHING_PENDING', 'MATCHING_DONE', 'COST_SHEET_SENT', 'VISIT_PLANNED', 'VISIT_COMPLETED', 'CONVERTED'].includes(l.lead_status)).length;
    const visits = srcLeads.filter(l => ['VISIT_PLANNED', 'VISIT_COMPLETED', 'CONVERTED'].includes(l.lead_status)).length;
    const bookings = srcLeads.filter(l => l.lead_status === 'CONVERTED' || l.lead_status === 'BOOKING_PROCESS').length;
    const conversionPct = total > 0 ? Math.round((bookings / total) * 100) : 0;

    return {
      source: src,
      total_leads: total,
      interested,
      visits,
      bookings,
      conversion_pct: conversionPct
    };
  });

  return res.json({
    status: 'SUCCESS',
    data: report
  });
}

// 8. Sales Person Performance Report
export async function getSalesPersonPerformanceReport(req: AuthRequest, res: Response) {
  loadData();
  const leads = dbStore.data.leads || [];
  const salesUsers = dbStore.data.users.filter(u => ['SALES_EXEC', 'TELECALLER', 'TEAM_LEAD', 'FIELD_EXEC', 'SALES_MANAGER'].includes(u.role));

  const report = salesUsers.map(u => {
    const myLeads = leads.filter(l => l.assigned_employee_id === u.id);
    const total = myLeads.length;
    const contacted = myLeads.filter(l => l.lead_status !== 'NEW').length;
    const interested = myLeads.filter(l => ['INTERESTED', 'MATCHING_PENDING', 'MATCHING_DONE', 'COST_SHEET_SENT', 'VISIT_PLANNED', 'VISIT_COMPLETED', 'CONVERTED'].includes(l.lead_status)).length;
    const visits = myLeads.filter(l => ['VISIT_PLANNED', 'VISIT_COMPLETED', 'CONVERTED'].includes(l.lead_status)).length;
    const bookings = myLeads.filter(l => l.lead_status === 'CONVERTED').length;
    const conversionPct = total > 0 ? Math.round((bookings / total) * 100) : 0;

    return {
      user_id: u.id,
      name: u.full_name,
      role: u.role,
      assigned_leads: total,
      contacted,
      interested,
      visits,
      bookings,
      conversion_pct: conversionPct
    };
  });

  return res.json({
    status: 'SUCCESS',
    data: report
  });
}

// 10. Bulk Upload Leads (CSV / JSON)
export async function bulkUploadLeads(req: AuthRequest, res: Response) {
  const { leads, skipDuplicates = true, defaultSource, defaultAssignedEmployeeId } = req.body;

  const leadArray = Array.isArray(leads) ? leads : (Array.isArray(req.body) ? req.body : []);

  if (!leadArray || leadArray.length === 0) {
    return res.status(400).json({ status: 'ERROR', message: 'No leads provided in payload. `leads` array is required.' });
  }

  loadData();

  const createdLeads: any[] = [];
  const skippedDuplicates: any[] = [];
  const errors: any[] = [];

  for (let index = 0; index < leadArray.length; index++) {
    const item = leadArray[index];
    const customer_name = item.customer_name || item['Customer Name'] || item['Full Name'] || item.name;
    const rawMobile = item.mobile || item['Mobile'] || item['Phone'] || item['Contact Number'];
    const mobile = rawMobile ? String(rawMobile).trim() : '';

    if (!customer_name || !mobile) {
      errors.push({
        row: index + 1,
        data: item,
        reason: 'Missing mandatory customer_name or mobile'
      });
      continue;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    const altMobile = item.alternate_mobile || item['Alternate Mobile'] || item['Alt Mobile'] || null;
    const cleanAltMobile = altMobile ? String(altMobile).replace(/\D/g, '') : '';
    const email = item.email || item['Email'] || item['Email Address'] || '';

    // Check duplicate
    const existingLead = dbStore.data.leads.find(l => {
      if (cleanMobile && l.mobile && l.mobile.replace(/\D/g, '') === cleanMobile) return true;
      if (cleanAltMobile && l.alternate_mobile && l.alternate_mobile.replace(/\D/g, '') === cleanAltMobile) return true;
      if (email && l.email && l.email.toLowerCase() === email.toLowerCase()) return true;
      return false;
    });

    if (existingLead && skipDuplicates) {
      skippedDuplicates.push({
        row: index + 1,
        customer_name,
        mobile,
        existing_lead_number: existingLead.lead_number,
        existing_lead_id: existingLead.id
      });
      continue;
    }

    const source = item.source || item['Source'] || defaultSource || 'CSV Import';
    const preferred_location = item.preferred_location || item['Preferred Location'] || item['Location'] || 'Hyderabad';
    const preferred_project = item.preferred_project || item['Preferred Project'] || item['Project'] || 'General Enquiry';
    const property_type = item.property_type || item['Property Type'] || 'Flat / Apartment';
    const bhk = item.bhk || item['BHK'] || item['Configuration'] || '3BHK';
    const budget_min = Number(item.budget_min || item['Budget Min'] || item['Min Budget'] || 0);
    const budget_max = Number(item.budget_max || item['Budget Max'] || item['Max Budget'] || 8000000);
    const purpose = item.purpose || item['Purpose'] || item['Investment Purpose'] || 'Self Use';
    const possession_preference = item.possession_preference || item['Possession Preference'] || item['Timeline'] || 'Immediate (< 30 Days)';
    const loan_required = Boolean(item.loan_required || item['Loan Required'] || false);
    const occupation = item.occupation || item['Occupation'] || 'Professional';
    const assigned_employee_id = item.assigned_employee_id || item['Assigned Employee ID'] || defaultAssignedEmployeeId || req.user?.id || 'USR-07';
    const campaign = item.campaign || item['Campaign'] || 'Bulk CSV Import 2026';
    const remarks = item.remarks || item['Remarks'] || 'Imported via Bulk Upload System';

    const leadNumber = generateID('SRM-LEAD');
    const customerNumber = generateID('SRM-CUS');

    const leadPayload = {
      ...item,
      source,
      budget_min,
      budget_max,
      loan_required,
      possession_preference
    };
    const { score, priority } = calculateLeadScoreAndPriority(leadPayload);
    const leadPriority = item.priority || item['Priority'] || priority;

    const newCustId = uuidv4();
    const newLeadId = uuidv4();

    const newCustomer = {
      id: newCustId,
      customer_number: customerNumber,
      full_name: customer_name,
      mobile,
      alt_mobile: altMobile,
      alternate_mobile: altMobile,
      whatsapp_number: item.whatsapp_number || item['WhatsApp Number'] || mobile,
      email: email,
      city: item.city || item['City'] || 'Hyderabad',
      preferred_location,
      property_type,
      configuration: bhk,
      budget_min,
      budget_max,
      loan_required,
      investment_purpose: purpose,
      purchase_timeline: possession_preference,
      source,
      assigned_employee_id,
      customer_status: 'NEW',
      status: 'NEW',
      priority: leadPriority,
      quality_score: score,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false
    };

    const newLead = {
      id: newLeadId,
      lead_number: leadNumber,
      customer_id: newCustId,
      customer_number: customerNumber,
      customer_name,
      mobile,
      alternate_mobile: altMobile,
      whatsapp_number: item.whatsapp_number || item['WhatsApp Number'] || mobile,
      email,
      source,
      campaign,
      source_details: item.source_details || null,
      preferred_location,
      preferred_project,
      property_type,
      bhk,
      budget_min,
      budget_max,
      purpose,
      possession_preference,
      loan_required,
      occupation,
      priority: leadPriority,
      lead_status: 'NEW',
      call_disposition: 'NEW_LEAD_CREATED',
      next_action: 'CONTACT_CUSTOMER',
      next_followup: new Date(Date.now() + 24 * 3600000).toISOString(),
      assigned_employee_id,
      assigned_by: req.user?.id || 'USR-01',
      created_by: req.user?.id || 'USR-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      quality_score: score,
      remarks
    };

    dbStore.data.customers.unshift(newCustomer);
    dbStore.data.leads.unshift(newLead);
    createdLeads.push(newLead);
  }

  logAudit(req.user?.id || null, 'CREATE_BULK_LEADS', 'LEAD', `Bulk imported ${createdLeads.length} leads. Skipped ${skippedDuplicates.length} duplicates. Errors ${errors.length}.`, req.ip);
  saveData();

  try {
    const { syncToMongoDB } = await import('../db/mongoPersistence.js');
    await syncToMongoDB(dbStore.data);
  } catch (err) {
    console.warn('Bulk import MongoDB sync notice:', err);
  }

  return res.status(201).json({
    status: 'SUCCESS',
    message: `Successfully processed ${leadArray.length} records. Created: ${createdLeads.length}, Skipped Duplicates: ${skippedDuplicates.length}, Errors: ${errors.length}.`,
    created_count: createdLeads.length,
    skipped_duplicates_count: skippedDuplicates.length,
    errors_count: errors.length,
    skipped_duplicates: skippedDuplicates,
    errors,
    data: createdLeads
  });
}

