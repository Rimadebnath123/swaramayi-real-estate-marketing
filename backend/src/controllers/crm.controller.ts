import { Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { dbStore, loadData, saveData, logAudit, generateID } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

function maskPhone(phone: string): string {
  if (!phone || phone.length <= 5) return '***';
  return phone.substring(0, 4) + '*** **' + phone.substring(phone.length - 3);
}

function maskEmail(email: string): string {
  if (!email) return '***';
  const parts = email.split('@');
  if (parts.length < 2) return '***';
  return parts[0].substring(0, 3) + '***@' + parts[1];
}

// 1. Get Customers Master List
export async function getCustomers(req: AuthRequest, res: Response) {
  await loadData();
  const user = req.user!;
  let customers = dbStore.data.customers.filter(c => !c.is_deleted);

  if (user.role === 'SALES_EXECUTIVE') {
    customers = customers.filter(c => c.assigned_employee_id === user.id);
  }

  const enriched = customers.map(c => {
    const assignedUser = dbStore.data.users.find(u => u.id === c.assigned_employee_id);
    const linkedLeads = dbStore.data.leads.filter(l => l.customer_id === c.id);
    return {
      ...c,
      assigned_employee_name: assignedUser ? assignedUser.full_name : 'Unassigned',
      leads_count: linkedLeads.length,
      linked_leads: linkedLeads
    };
  });

  return res.json({
    status: 'SUCCESS',
    data: enriched
  });
}

// 2. Duplicate Detection Algorithm
export async function checkDuplicateCustomer(req: AuthRequest, res: Response) {
  const { mobile, alternate_mobile, email, full_name } = req.body;
  await loadData();

  if (!mobile && !email && !full_name) {
    return res.status(400).json({ status: 'ERROR', message: 'mobile, email, or full_name is required for duplicate check.' });
  }

  const cleanMobile = mobile ? mobile.replace(/\D/g, '') : '';
  const cleanAltMobile = alternate_mobile ? alternate_mobile.replace(/\D/g, '') : '';

  let matchReason = '';
  const match = dbStore.data.customers.find(c => {
    if (cleanMobile && c.mobile && c.mobile.replace(/\D/g, '') === cleanMobile) {
      matchReason = 'MATCHING_MOBILE';
      return true;
    }
    if (cleanAltMobile && c.alternate_mobile && c.alternate_mobile.replace(/\D/g, '') === cleanAltMobile) {
      matchReason = 'MATCHING_ALTERNATE_MOBILE';
      return true;
    }
    if (email && c.email && c.email.toLowerCase() === email.toLowerCase()) {
      matchReason = 'MATCHING_EMAIL';
      return true;
    }
    if (full_name && c.full_name && c.full_name.toLowerCase() === full_name.toLowerCase()) {
      matchReason = 'SIMILAR_FULL_NAME';
      return true;
    }
    return false;
  });

  if (match) {
    const owner = dbStore.data.users.find(u => u.id === match.assigned_employee_id);
    const linkedLeads = dbStore.data.leads.filter(l => l.customer_id === match.id);

    return res.json({
      status: 'DUPLICATE_FOUND',
      warning: 'Possible Existing Customer Found',
      match_reason: matchReason,
      existing_customer: {
        customer_id: match.id,
        customer_number: match.customer_number,
        full_name: match.full_name,
        existing_owner: owner ? owner.full_name : 'Unassigned',
        customer_status: match.customer_status,
        linked_leads_count: linkedLeads.length
      }
    });
  }

  return res.json({
    status: 'NO_DUPLICATE',
    message: 'No existing duplicate customer detected.'
  });
}

// 3. Create Customer Master Record (Comprehensive Requirement Options)
export async function createCustomer(req: AuthRequest, res: Response) {
  const { 
    full_name, mobile, alternate_mobile, email, address, city, dob,
    preferred_location, property_type, configuration, budget_min, budget_max, 
    purchase_timeline, loan_required, investment_purpose, family_requirements, preferred_projects, notes,
    lead_source, sub_source, referral_source, assigned_employee_id, team_leader_id, priority: formPriority
  } = req.body;

  if (!full_name || !mobile) {
    return res.status(400).json({ status: 'ERROR', message: 'full_name and mobile are required.' });
  }

  await loadData();

  const cleanMobile = mobile.replace(/\D/g, '');
  const existing = dbStore.data.customers.find(c => c.mobile && c.mobile.replace(/\D/g, '') === cleanMobile);

  if (existing) {
    logAudit(req.user?.id || null, 'DUPLICATE_CUSTOMER_BLOCKED', 'CUSTOMER', `Blocked duplicate customer creation for mobile: ${mobile}`, req.ip);

    dbStore.data.fraud_alerts.unshift({
      id: uuidv4(),
      user_id: req.user?.id || null,
      alert_type: 'DUPLICATE_CUSTOMER_SUBMISSION',
      severity: 'MEDIUM',
      description: `Attempted creation of duplicate customer for mobile ${mobile}`,
      status: 'ACTIVE',
      timestamp: new Date().toISOString()
    });
    saveData();

    return res.status(409).json({
      status: 'ERROR',
      error_code: 'DUPLICATE_CUSTOMER',
      message: `A customer record with mobile number ${mobile} already exists in Customer Master (${existing.customer_number}).`,
      existing_customer_number: existing.customer_number
    });
  }

  const customerNumber = generateID('SRM-CUS');
  const leadNumber = generateID('SRM-LEAD');

  // Customer Priority & Risk Scoring (0-100)
  let score = 50;
  if (budget_max && budget_max >= 10000000) score += 20;
  if (purchase_timeline && purchase_timeline.includes('< 30 Days')) score += 15;
  if (lead_source === 'Direct Referral' || lead_source === 'Google Search') score += 15;

  let priority: 'HOT' | 'WARM' | 'MEDIUM' | 'COLD' = formPriority || 'WARM';
  if (!formPriority) {
    if (score >= 80) priority = 'HOT';
    else if (score >= 60) priority = 'WARM';
    else if (score >= 40) priority = 'MEDIUM';
    else priority = 'COLD';
  }

  const newCustId = uuidv4();
  const newCustomer = {
    id: newCustId,
    customer_number: customerNumber, // SRM-CUS-2026-000184
    full_name,
    mobile,
    alternate_mobile: alternate_mobile || null,
    email: email || null,
    address: address || null,
    city: city || 'Hyderabad',
    dob: dob || null,
    preferred_location: preferred_location || null,
    property_type: property_type || 'Flat / Apartment',
    configuration: configuration || '3BHK',
    budget_min: budget_min || 0,
    budget_max: budget_max || 0,
    purchase_timeline: purchase_timeline || 'Immediate (< 30 Days)',
    loan_required: Boolean(loan_required),
    investment_purpose: investment_purpose || 'Self / End Use',
    family_requirements: family_requirements || null,
    preferred_projects: preferred_projects || null,
    notes: notes || null,
    lead_source: lead_source || 'Meta Ads',
    sub_source: sub_source || null,
    referral_source: referral_source || null,
    assigned_employee_id: assigned_employee_id || req.user?.id || null,
    team_leader_id: team_leader_id || null,
    customer_status: 'NEW',
    source: lead_source || 'Meta Ads',
    status: 'NEW',
    quality_score: score,
    lead_score: score,
    priority,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: req.user?.id || undefined,
    is_deleted: false
  };

  // Auto-create initial Lead record linked to Customer
  const newLead = {
    id: uuidv4(),
    lead_number: leadNumber, // SRM-LEAD-2026-001245
    customer_id: newCustId,
    source: lead_source || 'Meta Ads',
    property_requirement: `${configuration || '3BHK'} in ${preferred_location || 'Kondapur'}`,
    budget: budget_max || 0,
    assigned_employee_id: assigned_employee_id || req.user?.id || null,
    lead_status: 'New',
    lead_score: score,
    priority,
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    next_followup: new Date(Date.now() + 24 * 3600000).toISOString()
  };

  dbStore.data.customers.unshift(newCustomer);
  dbStore.data.leads.unshift(newLead);
  saveData();

  logAudit(req.user?.id || null, 'CREATE_CUSTOMER_MASTER', 'CUSTOMER', `Customer Master created: ${customerNumber} with Lead ${leadNumber}`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: 'Customer Master record created successfully.',
    data: {
      customer_id: newCustId,
      customer_number: customerNumber,
      lead_number: leadNumber,
      full_name,
      priority,
      lead_score: score
    }
  });
}

// 3.5. Update Customer Record
export async function updateCustomer(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const updateData = req.body;
  await loadData();

  const index = dbStore.data.customers.findIndex(c => c.id === id || c.customer_number === id);
  if (index === -1) {
    return res.status(404).json({ status: 'ERROR', message: 'Customer not found.' });
  }

  dbStore.data.customers[index] = {
    ...dbStore.data.customers[index],
    ...updateData,
    updated_at: new Date().toISOString()
  };

  saveData();
  logAudit(req.user?.id || null, 'UPDATE_CUSTOMER', 'CUSTOMER', `Customer updated: ${dbStore.data.customers[index].customer_number}`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: 'Customer updated successfully.',
    data: dbStore.data.customers[index]
  });
}

// 3.6. Delete Customer Record
export async function deleteCustomer(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await loadData();

  const customer = dbStore.data.customers.find(c => c.id === id || c.customer_number === id);
  if (!customer) {
    return res.status(404).json({ status: 'ERROR', message: 'Customer not found.' });
  }

  customer.is_deleted = true;
  customer.updated_at = new Date().toISOString();

  dbStore.data.customers = dbStore.data.customers.filter(c => c.id !== id && c.customer_number !== id);

  saveData();
  logAudit(req.user?.id || null, 'DELETE_CUSTOMER', 'CUSTOMER', `Customer deleted: ${customer.customer_number}`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: 'Customer deleted successfully.',
    deleted_id: id
  });
}

// 4. Complete Customer 360° Profile Dataset (18 Streams)
export async function getCustomer360(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await loadData();

  const customer = dbStore.data.customers.find(c => c.id === id || c.customer_number === id);
  if (!customer) {
    return res.status(404).json({ status: 'ERROR', message: 'Customer not found.' });
  }

  const assignedUser = dbStore.data.users.find(u => u.id === customer.assigned_employee_id);
  const teamLead = dbStore.data.users.find(u => u.id === customer.team_leader_id);

  const linkedLeads = dbStore.data.leads.filter(l => l.customer_id === customer.id);
  const siteVisits = dbStore.data.site_visits.filter(v => v.lead_id === customer.id || linkedLeads.some(l => l.id === v.lead_id));
  const bookings = dbStore.data.bookings.filter(b => b.lead_id === customer.id || linkedLeads.some(l => l.id === b.lead_id));
  const commissions = dbStore.data.commissions.filter(c => bookings.some(b => b.id === c.booking_id));
  const followups = dbStore.data.followups.filter(f => f.customer_id === customer.id);
  const transfers = dbStore.data.lead_transfers.filter(t => t.customer_id === customer.id);

  return res.json({
    status: 'SUCCESS',
    data: {
      profile: {
        ...customer,
        assigned_employee_name: assignedUser ? assignedUser.full_name : 'Unassigned',
        team_leader_name: teamLead ? teamLead.full_name : 'N/A'
      },
      streams: {
        all_leads: linkedLeads,
        site_visits: siteVisits,
        bookings,
        commissions,
        followups,
        transfers,
        audit_history: dbStore.data.audit_logs.slice(0, 10)
      }
    }
  });
}

// 5. Submit Lead Transfer Request
export async function submitTransferRequest(req: AuthRequest, res: Response) {
  const { lead_id, requested_owner_id, reason } = req.body;
  if (!lead_id || !reason) {
    return res.status(400).json({ status: 'ERROR', message: 'lead_id and reason are required.' });
  }

  await loadData();
  const lead = dbStore.data.leads.find(l => l.id === lead_id || l.lead_number === lead_id);
  if (!lead) {
    return res.status(404).json({ status: 'ERROR', message: 'Lead record not found.' });
  }

  const currentOwner = dbStore.data.users.find(u => u.id === lead.assigned_employee_id);
  const reqOwner = dbStore.data.users.find(u => u.id === requested_owner_id);

  const transfer = {
    id: uuidv4(),
    lead_id: lead.lead_number,
    customer_id: lead.customer_id,
    requested_by: req.user?.id || 'Unknown',
    current_owner: currentOwner ? currentOwner.full_name : 'Unassigned',
    requested_owner: reqOwner ? reqOwner.full_name : 'Requested Executive',
    reason,
    status: 'PENDING' as const,
    created_at: new Date().toISOString()
  };

  dbStore.data.lead_transfers.unshift(transfer);
  saveData();

  logAudit(req.user?.id || null, 'LEAD_TRANSFER_REQUEST', 'CRM', `Transfer request submitted for lead ${lead.lead_number}`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: 'Lead transfer request submitted. Pending manager approval.',
    data: transfer
  });
}

// 6. Approve or Reject Lead Transfer Request
export async function handleTransferApproval(req: AuthRequest, res: Response) {
  const { transfer_id, action } = req.body;
  if (!transfer_id || !action) {
    return res.status(400).json({ status: 'ERROR', message: 'transfer_id and action are required.' });
  }

  await loadData();
  const transfer = dbStore.data.lead_transfers.find(t => t.id === transfer_id);
  if (!transfer) {
    return res.status(404).json({ status: 'ERROR', message: 'Transfer request not found.' });
  }

  if (action === 'APPROVE') {
    transfer.status = 'APPROVED';
    const lead = dbStore.data.leads.find(l => l.lead_number === transfer.lead_id);
    const reqUser = dbStore.data.users.find(u => u.full_name === transfer.requested_owner);
    if (lead && reqUser) {
      lead.assigned_employee_id = reqUser.id;
      lead.assigned_at = new Date().toISOString();
    }
  } else {
    transfer.status = 'REJECTED';
  }

  saveData();

  logAudit(req.user?.id || null, `LEAD_TRANSFER_${action}`, 'CRM', `Transfer request ${transfer_id} ${action}D`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: `Lead transfer request ${action.toLowerCase()}d successfully.`
  });
}

// 7. Global Smart Search
export async function smartSearch(req: AuthRequest, res: Response) {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ status: 'ERROR', message: 'Query parameter q is required.' });
  }

  await loadData();
  const queryStr = q.toLowerCase();

  const matchingCustomers = dbStore.data.customers.filter(c => 
    c.customer_number.toLowerCase().includes(queryStr) ||
    c.full_name.toLowerCase().includes(queryStr) ||
    (c.mobile && c.mobile.includes(queryStr))
  );

  const matchingLeads = dbStore.data.leads.filter(l => 
    l.lead_number.toLowerCase().includes(queryStr) ||
    l.source.toLowerCase().includes(queryStr)
  );

  return res.json({
    status: 'SUCCESS',
    query: q,
    data: {
      customers: matchingCustomers,
      leads: matchingLeads
    }
  });
}

import { 
  syncToMongoDB, loadDataFromMongoDB, PropertyModel, DeveloperModel, 
  CustomerModel, LeadModel, AgreementModel, CostSheetModel, 
  InvoiceModel, SiteVisitModel 
} from '../db/mongoPersistence.js';

export async function getMongoDBSync(req: AuthRequest, res: Response) {
  await loadData();
  const mongoData = await loadDataFromMongoDB();
  return res.json({
    status: 'SUCCESS',
    data: mongoData || dbStore.data
  });
}

export async function syncMongoDB(req: AuthRequest, res: Response) {
  const payload = req.body;
  if (payload) {
    if (Array.isArray(payload.leads)) dbStore.data.leads = payload.leads;
    if (Array.isArray(payload.properties)) dbStore.data.properties = payload.properties;
    if (Array.isArray(payload.customers)) dbStore.data.customers = payload.customers;
    if (Array.isArray(payload.agreements)) dbStore.data.agreements = payload.agreements;
    if (Array.isArray(payload.users)) dbStore.data.users = payload.users;
    if (Array.isArray(payload.teams)) dbStore.data.teams = payload.teams;
    if (Array.isArray(payload.branches)) dbStore.data.branches = payload.branches;
    if (Array.isArray(payload.invoices)) dbStore.data.invoices = payload.invoices;
    if (Array.isArray(payload.bookings)) dbStore.data.bookings = payload.bookings;
    if (Array.isArray(payload.site_visits)) dbStore.data.site_visits = payload.site_visits;
    if (Array.isArray(payload.cost_sheets)) (dbStore.data as any).cost_sheets = payload.cost_sheets;
    if (Array.isArray(payload.matching_requests)) (dbStore.data as any).matching_requests = payload.matching_requests;
    if (Array.isArray(payload.pva_agreements)) (dbStore.data as any).pva_agreements = payload.pva_agreements;
    if (Array.isArray(payload.sourcing_requests)) (dbStore.data as any).sourcing_requests = payload.sourcing_requests;
    if (Array.isArray(payload.developers)) (dbStore.data as any).developers = payload.developers;
    if (Array.isArray(payload.rating_invites)) (dbStore.data as any).rating_invites = payload.rating_invites;
    saveData();
    await syncToMongoDB(payload);
  }
  return res.json({
    status: 'SUCCESS',
    message: 'Data successfully synced with MongoDB Atlas Cluster & Database Store',
    synced_at: new Date().toISOString()
  });
}

function extractItemIdentifiers(item: any): { ids: string[]; cleanTitle: string } {
  const idsSet = new Set<string>();
  if (!item) return { ids: [], cleanTitle: '' };

  const fields = [
    item.id, item._id, item.property_code, item.code, item.project_id, item.propertyId, item.projectId,
    item.lead_number, item.customer_number, item.booking_code, item.agreement_code, item.invoice_number,
    item.costSheetId, item.visitId, item.visitScheduleId, item.visitPlanId, item.record_id, item.itemId
  ];

  fields.forEach(f => {
    if (f !== undefined && f !== null) {
      const s = String(f).trim();
      if (s) idsSet.add(s);
    }
  });

  const rawTitle = String(
    item.record_title || item.title || item.projectTitle || item.propertyTitle || item.name || item.full_name || ''
  ).trim();

  let cleanTitle = rawTitle;
  const match = cleanTitle.match(/^([^(]+)/);
  if (match && match[1]) {
    cleanTitle = match[1].trim();
  }

  return {
    ids: Array.from(idsSet),
    cleanTitle
  };
}

export async function purgeSingleItemFromDB(item: any) {
  if (!item) return;
  const { ids, cleanTitle } = extractItemIdentifiers(item);
  const cat = String(item.category || item.record_category || '').toLowerCase();

  const titleRegex = cleanTitle.length >= 3 ? new RegExp(cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

  const orConditions: any[] = [];
  ids.forEach(id => {
    orConditions.push({ id });
    orConditions.push({ _id: id });
    orConditions.push({ property_code: id });
    orConditions.push({ code: id });
    orConditions.push({ project_id: id });
    orConditions.push({ lead_number: id });
    orConditions.push({ customer_number: id });
    orConditions.push({ booking_code: id });
    orConditions.push({ agreement_code: id });
    orConditions.push({ invoice_number: id });
    orConditions.push({ costSheetId: id });
    orConditions.push({ visitId: id });
    orConditions.push({ visitScheduleId: id });
    orConditions.push({ visitPlanId: id });
  });

  if (titleRegex) {
    orConditions.push({ title: titleRegex });
    orConditions.push({ name: titleRegex });
    orConditions.push({ full_name: titleRegex });
  }

  if (orConditions.length === 0) return;

  const query = { $or: orConditions };

  try {
    // 1. Permanently delete from PropertyModel
    if (cat.includes('project') || cat.includes('property') || !cat) {
      await PropertyModel.deleteMany(query);

      // Permanently remove matching projects from DeveloperModel documents
      await DeveloperModel.updateMany({}, {
        $pull: {
          projects: {
            $or: [
              ...ids.map(id => ({ id })),
              ...ids.map(id => ({ property_code: id })),
              ...ids.map(id => ({ code: id })),
              ...ids.map(id => ({ project_id: id })),
              ...(titleRegex ? [{ title: titleRegex }] : [])
            ]
          }
        }
      });

      if (Array.isArray((dbStore.data as any).properties)) {
        (dbStore.data as any).properties = (dbStore.data as any).properties.filter((p: any) => {
          const pIds = extractItemIdentifiers(p).ids;
          const pTitle = extractItemIdentifiers(p).cleanTitle.toLowerCase();
          const matchId = pIds.some(id => ids.includes(id));
          const matchTitle = cleanTitle && pTitle && (pTitle.includes(cleanTitle.toLowerCase()) || cleanTitle.toLowerCase().includes(pTitle));
          return !matchId && !matchTitle;
        });
      }

      if (Array.isArray((dbStore.data as any).developers)) {
        (dbStore.data as any).developers = (dbStore.data as any).developers.map((d: any) => ({
          ...d,
          projects: Array.isArray(d.projects)
            ? d.projects.filter((proj: any) => {
                const projIds = extractItemIdentifiers(proj).ids;
                const projTitle = extractItemIdentifiers(proj).cleanTitle.toLowerCase();
                const matchId = projIds.some(id => ids.includes(id));
                const matchTitle = cleanTitle && projTitle && (projTitle.includes(cleanTitle.toLowerCase()) || cleanTitle.toLowerCase().includes(projTitle));
                return !matchId && !matchTitle;
              })
            : []
        }));
      }
    }

    if (cat.includes('lead')) {
      await LeadModel.deleteMany(query);
      if (Array.isArray(dbStore.data.leads)) {
        dbStore.data.leads = dbStore.data.leads.filter((l: any) => !extractItemIdentifiers(l).ids.some(id => ids.includes(id)));
      }
    }

    if (cat.includes('customer')) {
      await CustomerModel.deleteMany(query);
      if (Array.isArray(dbStore.data.customers)) {
        dbStore.data.customers = dbStore.data.customers.filter((c: any) => !extractItemIdentifiers(c).ids.some(id => ids.includes(id)));
      }
    }

    if (cat.includes('agreement')) {
      await AgreementModel.deleteMany(query);
      if (Array.isArray(dbStore.data.agreements)) {
        dbStore.data.agreements = dbStore.data.agreements.filter((a: any) => !extractItemIdentifiers(a).ids.some(id => ids.includes(id)));
      }
    }

    if (cat.includes('cost sheet') || cat.includes('costsheet')) {
      await CostSheetModel.deleteMany(query);
      if (Array.isArray((dbStore.data as any).cost_sheets)) {
        (dbStore.data as any).cost_sheets = (dbStore.data as any).cost_sheets.filter((cs: any) => !extractItemIdentifiers(cs).ids.some(id => ids.includes(id)));
      }
    }

    if (cat.includes('billing') || cat.includes('invoice')) {
      await InvoiceModel.deleteMany(query);
      if (Array.isArray(dbStore.data.invoices)) {
        dbStore.data.invoices = dbStore.data.invoices.filter((inv: any) => !extractItemIdentifiers(inv).ids.some(id => ids.includes(id)));
      }
    }

    if (cat.includes('visit')) {
      await SiteVisitModel.deleteMany(query);
      if (Array.isArray(dbStore.data.site_visits)) {
        dbStore.data.site_visits = dbStore.data.site_visits.filter((v: any) => !extractItemIdentifiers(v).ids.some(id => ids.includes(id)));
      }
    }

    saveData();
  } catch (err: any) {
    console.error(`Error purging item from MongoDB Atlas:`, err.message);
  }
}

export async function purgeRecycledItem(req: AuthRequest, res: Response) {
  const { item } = req.body;
  if (!item) {
    return res.status(400).json({ status: 'ERROR', message: 'Item payload is required for purging.' });
  }

  await loadData();
  await purgeSingleItemFromDB(item);
  await syncToMongoDB(dbStore.data);

  return res.json({
    status: 'SUCCESS',
    message: 'Item permanently purged from MongoDB Atlas & CRM Database'
  });
}

export async function purgeAllRecycledItems(req: AuthRequest, res: Response) {
  const { items } = req.body;
  await loadData();

  if (Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      await purgeSingleItemFromDB(item);
    }
  }

  await syncToMongoDB(dbStore.data);

  return res.json({
    status: 'SUCCESS',
    message: 'All recycled items permanently purged from MongoDB Atlas & CRM Database'
  });
}

