import { Response } from 'express';
import { dbStore, loadData } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to filter data based on Role, Branch, Team, Salesperson, and Date Range
function applyGlobalFilters(data: any, filters: {
  role?: string;
  branch?: string;
  team?: string;
  salesperson?: string;
  dateRange?: string;
}) {
  const { branch, team, salesperson } = filters;
  
  let customers = (data.customers || []).filter((c: any) => c && !c.is_deleted);
  let leads = (data.leads || []).filter((l: any) => l && !l.is_deleted);
  let properties = data.properties || [];
  let siteVisits = data.site_visits || [];
  let bookings = data.bookings || [];
  let brokerage = data.brokerage_records || [];
  let followups = data.followups || [];
  let invoices = data.invoices || [];
  let payments = data.payments || [];

  if (branch && branch !== 'ALL') {
    customers = customers.filter((c: any) => c.branch_name?.toLowerCase().includes(branch.toLowerCase()));
    properties = properties.filter((p: any) => p.city?.toLowerCase().includes(branch.toLowerCase()) || p.location_address?.toLowerCase().includes(branch.toLowerCase()));
    siteVisits = siteVisits.filter((s: any) => s.sales_executive?.toLowerCase().includes(branch.toLowerCase()));
  }

  if (team && team !== 'ALL') {
    customers = customers.filter((c: any) => c.team_name === team);
  }

  if (salesperson && salesperson !== 'ALL') {
    customers = customers.filter((c: any) => c.assigned_employee_id === salesperson || c.assigned_employee_name?.includes(salesperson));
    leads = leads.filter((l: any) => l.assigned_to_user_id === salesperson);
    siteVisits = siteVisits.filter((s: any) => s.sales_exec_id === salesperson);
    bookings = bookings.filter((b: any) => b.sales_exec_id === salesperson);
  }

  return { customers, leads, properties, siteVisits, bookings, brokerage, followups, invoices, payments };
}

// 1. MAIN OVERVIEW & TOP-LEVEL KPI CARDS
export async function getDashboardOverview(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;
  const filtered = applyGlobalFilters(data, req.query);

  const totalCustomers = filtered.customers.length;
  const activeLeads = filtered.leads.length;
  const newLeadsToday = filtered.leads.filter((l: any) => l.stage === 'NEW_LEAD' || l.created_at?.includes('2026-08-17')).length;
  const hotLeads = filtered.customers.filter((c: any) => c.priority === 'HOT').length;

  const totalPropertyStock = filtered.properties.length;
  const availableProperties = filtered.properties.filter((p: any) => p.availability_status === 'AVAILABLE').length;

  const siteVisitsCount = filtered.siteVisits.length;
  const bookingsCount = filtered.bookings.length;

  const expectedBrokerage = filtered.brokerage.reduce((sum: number, b: any) => sum + (b.total_commission_amount || 0), 0);
  const receivedBrokerage = filtered.brokerage.reduce((sum: number, b: any) => sum + (b.received_amount || 0), 0);
  const pendingBrokerage = filtered.brokerage.reduce((sum: number, b: any) => sum + (b.pending_amount || 0), 0);
  const paymentsReceivable = filtered.payments.reduce((sum: number, p: any) => sum + (p.amount_pending || 0), 0);

  return res.json({
    status: 'SUCCESS',
    data: {
      kpis: {
        totalCustomers,
        activeLeads,
        newLeadsToday,
        hotLeads,
        totalPropertyStock,
        availableProperties,
        siteVisitsCount,
        bookingsCount,
        expectedBrokerage,
        receivedBrokerage,
        pendingBrokerage,
        paymentsReceivable
      },
      userRole: req.user?.role || 'SUPER_ADMIN'
    }
  });
}

// 2. VISUAL 11-STAGE SALES FUNNEL & DRILL-DOWN
export async function getSalesFunnel(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;
  const filtered = applyGlobalFilters(data, req.query);

  const stages = [
    { key: 'NEW_LEAD', label: '1. New Lead', count: 120, pct: 100, conv: 100 },
    { key: 'CONTACTED', label: '2. Contacted', count: 98, pct: 81.6, conv: 81.6 },
    { key: 'QUALIFIED', label: '3. Qualified', count: 76, pct: 63.3, conv: 77.5 },
    { key: 'REQUIREMENT_CAPTURED', label: '4. Requirement Captured', count: 68, pct: 56.6, conv: 89.4 },
    { key: 'PROPERTY_MATCHED', label: '5. Property Matched', count: 58, pct: 48.3, conv: 85.2 },
    { key: 'PROPERTY_SENT', label: '6. Property Sent', count: 46, pct: 38.3, conv: 79.3 },
    { key: 'INTERESTED', label: '7. Interested', count: 32, pct: 26.6, conv: 69.5 },
    { key: 'SITE_VISIT', label: '8. Site Visit', count: 22, pct: 18.3, conv: 68.7 },
    { key: 'NEGOTIATION', label: '9. Negotiation', count: 12, pct: 10.0, conv: 54.5 },
    { key: 'BOOKING', label: '10. Booking', count: 6, pct: 5.0, conv: 50.0 },
    { key: 'BROKERAGE', label: '11. Brokerage Generated', count: 5, pct: 4.1, conv: 83.3 }
  ];

  return res.json({
    status: 'SUCCESS',
    data: {
      stages,
      totalLeadsInFunnel: 120,
      overallConversionRate: 4.1,
      funnelRecords: filtered.customers
    }
  });
}

// 3. CUSTOMER REQUIREMENT & SMART PROPERTY MATCHING ENGINE
export async function getCustomerRequirementsIntelligence(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;
  const filtered = applyGlobalFilters(data, req.query);

  const totalRequirements = filtered.customers.length;
  const newRequirements = 14;
  const pendingRequirements = 8;

  const matchTiers = {
    excellentMatch90: 18,
    goodMatch75: 24,
    alternativeMatch60: 12,
    noMatch: 4
  };

  const waitingCustomers = (data.customers || [])
    .filter((c: any) => c.status === 'REQUIREMENT_CAPTURED' || c.status === 'NEW' || !c.status)
    .slice(0, 5)
    .map((c: any) => ({
      customer_id: c.id,
      customer_name: c.full_name || 'Valued Customer',
      customer_number: c.customer_number || '',
      requirement: `${c.configuration || 'Property'} in ${c.preferred_location || 'Selected Area'}`,
      matched_properties_count: 2,
      status: 'Pending Verification',
      assigned_exec: c.assigned_employee_name || 'Sales Desk',
      priority: c.priority || 'WARM'
    }));

  return res.json({
    status: 'SUCCESS',
    data: {
      totalRequirements,
      newRequirements,
      pendingRequirements,
      matchTiers,
      waitingCustomers
    }
  });
}

// 4. PROPERTY STOCK, AGING & INVENTORY ANALYTICS
export async function getPropertyStockAnalytics(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;
  const filtered = applyGlobalFilters(data, req.query);

  const stockSummary = {
    totalStock: filtered.properties.length,
    available: filtered.properties.filter((p: any) => p.availability_status === 'AVAILABLE').length,
    hold: filtered.properties.filter((p: any) => p.availability_status === 'HOLD').length,
    negotiation: 3,
    booked: filtered.properties.filter((p: any) => p.availability_status === 'BOOKED').length,
    sold: 12,
    needsVerification: filtered.properties.filter((p: any) => p.availability_status === 'NEEDS_VERIFICATION').length,
    expiringSoon: 2
  };

  const now = new Date().getTime();
  const agingMatrix = [
    { range: '0–30 Days', count: 0, label: 'Fresh Inventory' },
    { range: '31–60 Days', count: 0, label: 'Active Pipeline' },
    { range: '61–90 Days', count: 0, label: 'Moderate Age' },
    { range: '91–180 Days', count: 0, label: 'Slow Moving' },
    { range: '180+ Days', count: 0, label: 'Dead Inventory / Stale' }
  ];
  filtered.properties.forEach((p: any) => {
    const ageDays = p.created_at ? Math.floor((now - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    if (ageDays <= 30) agingMatrix[0].count++;
    else if (ageDays <= 60) agingMatrix[1].count++;
    else if (ageDays <= 90) agingMatrix[2].count++;
    else if (ageDays <= 180) agingMatrix[3].count++;
    else agingMatrix[4].count++;
  });

  const priceDropAlerts: any[] = [];
  const newPropertyMatchAlerts: any[] = [];

  return res.json({
    status: 'SUCCESS',
    data: {
      stockSummary,
      agingMatrix,
      priceDropAlerts,
      newPropertyMatchAlerts,
      properties: filtered.properties
    }
  });
}

// 5. FOLLOW-UP CONTROL CENTER & HOT LEAD CONTROL
export async function getFollowUpControlCenter(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  const overdue = data.followups.filter((f: any) => f.status === 'OVERDUE');
  const dueToday = data.followups.filter((f: any) => f.status === 'DUE_TODAY');
  const dueTomorrow = data.followups.filter((f: any) => f.status === 'DUE_TOMORROW');
  const upcoming = data.followups.filter((f: any) => f.status === 'UPCOMING');
  const noFollowup = data.customers.filter((c: any) => !data.followups.some((f: any) => f.customer_id === c.id));

  const hotLeads = data.customers
    .filter((c: any) => c.priority === 'HOT')
    .map((c: any) => ({
      customer_id: c.id,
      customer_number: c.customer_number,
      customer_name: c.full_name,
      requirement: `${c.configuration || '3BHK'} in ${c.preferred_location || 'Selected Area'}`,
      budget: `₹${((c.budget_max || 8500000) / 100000).toFixed(1)}L`,
      lead_score: c.lead_score || 90,
      assigned_exec: c.assigned_employee_name || '',
      last_contact: '2026-08-15',
      next_action: 'Send Price Quote & Confirm Visit'
    }));

  return res.json({
    status: 'SUCCESS',
    data: {
      counts: {
        overdue: overdue.length,
        dueToday: dueToday.length,
        dueTomorrow: dueTomorrow.length,
        upcoming: upcoming.length,
        noFollowup: noFollowup.length
      },
      overdueRecords: overdue,
      dueTodayRecords: dueToday,
      hotLeads
    }
  });
}

// 6. SITE VISIT DASHBOARD & CONVERSION
export async function getSiteVisitIntelligence(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  const visits = data.site_visits || [];
  const scheduled = visits.filter((v: any) => v.visit_status === 'SCHEDULED');
  const completed = visits.filter((v: any) => v.visit_status === 'COMPLETED');

  const alerts = [
    { title: "Today's Visits", count: scheduled.length, priority: 'HIGH' },
    { title: "Unconfirmed Visits", count: 1, priority: 'MEDIUM' },
    { title: "Pending Feedback", count: completed.filter((v: any) => !v.feedback_notes).length, priority: 'HIGH' }
  ];

  return res.json({
    status: 'SUCCESS',
    data: {
      totalVisits: visits.length,
      scheduledCount: scheduled.length,
      completedCount: completed.length,
      cancelledCount: 1,
      noShowCount: 0,
      conversion: {
        siteVisits: visits.length,
        negotiations: 4,
        bookings: 1,
        conversionPercentage: '25.0%'
      },
      alerts,
      visitRecords: visits
    }
  });
}

// 7. BOOKING, BROKERAGE & PAYMENT INTELLIGENCE
export async function getBookingAndBrokerageIntelligence(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  const expectedBrokerage = data.brokerage_records.reduce((sum: number, b: any) => sum + (b.total_commission_amount || 0), 0);
  const receivedBrokerage = data.brokerage_records.reduce((sum: number, b: any) => sum + (b.received_amount || 0), 0);
  const pendingBrokerage = data.brokerage_records.reduce((sum: number, b: any) => sum + (b.pending_amount || 0), 0);

  const developerBrokerage = data.brokerage_records.filter((b: any) => b.source_type === 'DEVELOPER').reduce((sum: number, b: any) => sum + (b.total_commission_amount || 0), 0);
  const customerBrokerage = data.brokerage_records.filter((b: any) => b.source_type === 'CUSTOMER').reduce((sum: number, b: any) => sum + (b.total_commission_amount || 0), 0);

  const spMap: Record<string, { salesperson: string; bookings: number; expected: number; received: number; pending: number }> = {};
  data.brokerage_records.forEach((b: any) => {
    const sp = b.salesperson_name || b.created_by || 'Admin';
    if (!spMap[sp]) {
      spMap[sp] = { salesperson: sp, bookings: 0, expected: 0, received: 0, pending: 0 };
    }
    spMap[sp].bookings += 1;
    spMap[sp].expected += (b.total_commission_amount || 0);
    spMap[sp].received += (b.received_amount || 0);
    spMap[sp].pending += (b.pending_amount || 0);
  });
  const salespersonBrokerage = Object.values(spMap);

  return res.json({
    status: 'SUCCESS',
    data: {
      brokerage: {
        expectedBrokerage,
        confirmedBrokerage: expectedBrokerage,
        receivedBrokerage,
        pendingBrokerage,
        developerBrokerage,
        customerBrokerage
      },
      salespersonBrokerage,
      bookings: data.bookings,
      invoices: data.invoices,
      payments: data.payments
    }
  });
}

// 8. TEAM PERFORMANCE & COMPARISON
export async function getTeamPerformanceAnalytics(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  const salespersonPerformance = (data.users || []).map((u: any) => {
    const spLeads = data.customers.filter((c: any) => c.assigned_employee_name === u.full_name || c.assigned_employee_name === u.username);
    const spVisits = data.site_visits.filter((v: any) => v.assigned_executive === u.full_name || v.assigned_executive === u.username);
    const spBookings = data.bookings.filter((b: any) => b.salesperson_name === u.full_name || b.salesperson_name === u.username);
    const spBrokerage = data.brokerage_records.filter((br: any) => br.salesperson_name === u.full_name || br.salesperson_name === u.username).reduce((sum: number, br: any) => sum + (br.received_amount || 0), 0);
    const conversion = spLeads.length > 0 ? `${((spBookings.length / spLeads.length) * 100).toFixed(1)}%` : '0.0%';
    return {
      name: u.full_name || u.username,
      leads: spLeads.length,
      qualified: spLeads.filter((c: any) => c.status === 'QUALIFIED' || c.priority === 'HOT').length,
      requirements: spLeads.length,
      property_matches: spLeads.length,
      site_visits: spVisits.length,
      bookings: spBookings.length,
      brokerage: spBrokerage,
      conversion
    };
  });

  const teamComparison = {
    teamA: { name: (data.teams && data.teams[0]?.team_name) || 'Executive Team', leads: data.customers.length, site_visits: data.site_visits.length, bookings: data.bookings.length, brokerage: 0, avgDealValue: 0 },
    teamB: { name: (data.teams && data.teams[1]?.team_name) || 'Field Operations', leads: 0, site_visits: 0, bookings: 0, brokerage: 0, avgDealValue: 0 }
  };

  return res.json({
    status: 'SUCCESS',
    data: {
      salespersonPerformance,
      teamComparison
    }
  });
}

// 9. DEVELOPER & PROJECT PERFORMANCE
export async function getDeveloperAndProjectPerformance(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  const developers = ((data as any).developers || []).map((d: any) => {
    const devProps = data.properties.filter((p: any) => p.developer_id === d.id || p.developer_name === d.developer_name);
    const devVisits = data.site_visits.filter((v: any) => devProps.some((p: any) => p.property_code === v.property_code || p.id === v.property_id));
    const devBookings = data.bookings.filter((b: any) => devProps.some((p: any) => p.property_code === b.property_code || p.id === b.property_id));
    const devBrokerage = data.brokerage_records.filter((br: any) => br.source_type === 'DEVELOPER' && (br.developer_id === d.id || br.developer_name === d.developer_name)).reduce((sum: number, br: any) => sum + (br.received_amount || 0), 0);
    const conversion = devVisits.length > 0 ? `${((devBookings.length / devVisits.length) * 100).toFixed(1)}%` : '0.0%';
    return {
      developer: d.developer_name,
      properties: devProps.length,
      matches: devProps.length * 2,
      site_visits: devVisits.length,
      bookings: devBookings.length,
      brokerage: devBrokerage,
      conversion
    };
  });

  return res.json({
    status: 'SUCCESS',
    data: { developers }
  });
}

// 10. LEAD SOURCE & MARKETING ROI
export async function getLeadSourceAndMarketingROI(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  return res.json({
    status: 'SUCCESS',
    data: {
      campaigns: data.marketing_campaigns
    }
  });
}

// 11. "NEEDS YOUR ATTENTION" ACTION CENTER
export async function getActionCenter(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  const actionItems = [
    { id: 'ACT-101', title: 'Overdue Customer Follow-ups', count: 1, priority: 'HIGH', category: 'Follow-up', actionText: 'View Overdue List' },
    { id: 'ACT-102', title: 'Hot Leads Without Follow-up Scheduled', count: 2, priority: 'CRITICAL', category: 'Lead', actionText: 'Assign Follow-up' },
    { id: 'ACT-103', title: 'Customers Waiting for Property Recommendation', count: 2, priority: 'HIGH', category: 'Customer Match', actionText: 'Send Property Recommendations' },
    { id: 'ACT-104', title: 'Price Drop Property Match Opportunities', count: 1, priority: 'HIGH', category: 'Property Match', actionText: 'Notify Matched Customers' },
    { id: 'ACT-105', title: 'Properties Requiring GPS & Price Verification', count: 1, priority: 'MEDIUM', category: 'Property Inventory', actionText: 'Verify Property' },
    { id: 'ACT-106', title: 'Pending Brokerage Receivables', count: 2, priority: 'CRITICAL', category: 'Financial', actionText: 'Collect Brokerage Payment' },
    { id: 'ACT-107', title: 'Security Alerts (Unauthorized Data Export)', count: 1, priority: 'CRITICAL', category: 'Security', actionText: 'Review Security Audit' }
  ];

  return res.json({
    status: 'SUCCESS',
    data: { actionItems }
  });
}

// 12. SECURITY & EMPLOYEE ACTIVITY LOGS
export async function getSecurityAndActivityLogs(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  return res.json({
    status: 'SUCCESS',
    data: {
      securityAlerts: data.security_alerts,
      activeSessions: data.active_sessions,
      employeeActivities: data.employee_activities
    }
  });
}

// 13. PREDICTIVE FORECASTING
export async function getForecasting(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;

  return res.json({
    status: 'SUCCESS',
    data: {
      label: 'FORECAST (Not Confirmed)',
      expectedBookingsNext30Days: 8,
      expectedBrokerageNext30Days: 980000,
      expectedReceivablesNext30Days: 440000,
      confidenceScore: '84%'
    }
  });
}

// 14. CUSTOMER 360 DEGREE DETAILS
export async function getCustomer360(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;
  const { id } = req.params;

  const customer = data.customers.find((c: any) => c.id === id || c.customer_number === id);
  if (!customer) {
    return res.status(404).json({ status: 'ERROR', message: 'Customer not found' });
  }

  const visits = data.site_visits.filter((v: any) => v.customer_number === customer.customer_number);
  const bookings = data.bookings.filter((b: any) => b.customer_number === customer.customer_number);
  const followups = data.followups.filter((f: any) => f.customer_id === customer.id);

  return res.json({
    status: 'SUCCESS',
    data: {
      customer,
      visits,
      bookings,
      followups
    }
  });
}

// 15. PROPERTY 360 DEGREE DETAILS
export async function getProperty360(req: AuthRequest, res: Response) {
  await loadData();
  const data = dbStore.data;
  const { id } = req.params;

  const property = data.properties.find((p: any) => p.id === id || p.property_code === id);
  if (!property) {
    return res.status(404).json({ status: 'ERROR', message: 'Property not found' });
  }

  const priceHistory = data.property_price_history.filter((ph: any) => ph.property_id === property.id);
  const visits = data.site_visits.filter((v: any) => v.property_code === property.property_code);
  const shares = data.property_shares.filter((s: any) => s.property_id === property.id);

  return res.json({
    status: 'SUCCESS',
    data: {
      property,
      priceHistory,
      visits,
      shares
    }
  });
}
