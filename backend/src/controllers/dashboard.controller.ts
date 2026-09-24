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

  const waitingCustomers = [
    {
      customer_id: 'CUST-04',
      customer_name: 'Sunita Rao',
      customer_number: 'SRM-CUS-2026-000187',
      requirement: '3BHK Flat in Kondapur, ₹80–95L',
      matched_properties_count: 5,
      status: 'Not Yet Sent',
      assigned_exec: 'Amit Patel',
      priority: 'WARM'
    },
    {
      customer_id: 'CUST-05',
      customer_name: 'Vikram Chatterji',
      customer_number: 'SRM-CUS-2026-000188',
      requirement: '4BHK Villa in Rajarhat, ₹1.5–2.0 Cr',
      matched_properties_count: 3,
      status: 'Pending Verification',
      assigned_exec: 'Priya Nair',
      priority: 'HOT'
    }
  ];

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

  const agingMatrix = [
    { range: '0–30 Days', count: 18, label: 'Fresh Inventory' },
    { range: '31–60 Days', count: 12, label: 'Active Pipeline' },
    { range: '61–90 Days', count: 8, label: 'Moderate Age' },
    { range: '91–180 Days', count: 5, label: 'Slow Moving' },
    { range: '180+ Days', count: 3, label: 'Dead Inventory / Stale' }
  ];

  const priceDropAlerts = [
    {
      property_code: 'SRM-PROP-2026-000421',
      title: 'Aparna Zenon Premium 3BHK Residence',
      previous_price: 8600000,
      new_price: 8400000,
      matched_customers_count: 6,
      reason: 'Monsoon Offer Discount'
    }
  ];

  const newPropertyMatchAlerts = [
    {
      property_code: 'SRM-PROP-2026-000422',
      title: 'Financial Towers Sky Suite',
      locality: 'Financial District',
      potential_matches: 8,
      hot_matches: 3
    }
  ];

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
      requirement: `${c.configuration || '3BHK'} in ${c.preferred_location || 'Kondapur'}`,
      budget: `₹${((c.budget_max || 8500000) / 100000).toFixed(1)}L`,
      lead_score: c.lead_score || 90,
      assigned_exec: c.assigned_employee_name || 'Priya Nair',
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

  const salespersonBrokerage = [
    { salesperson: 'Amit Patel', bookings: 1, expected: 180000, received: 60000, pending: 120000 },
    { salesperson: 'Priya Nair', bookings: 2, expected: 320000, received: 160000, pending: 160000 }
  ];

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

  const salespersonPerformance = [
    { name: 'Priya Nair', leads: 42, qualified: 32, requirements: 28, property_matches: 24, site_visits: 8, bookings: 2, brokerage: 320000, conversion: '4.8%' },
    { name: 'Amit Patel', leads: 38, qualified: 28, requirements: 24, property_matches: 20, site_visits: 6, bookings: 1, brokerage: 180000, conversion: '2.6%' },
    { name: 'Srinivas Rao', leads: 25, qualified: 18, requirements: 15, property_matches: 12, site_visits: 4, bookings: 1, brokerage: 150000, conversion: '4.0%' }
  ];

  const teamComparison = {
    teamA: { name: 'Sales Team Alpha (Kondapur)', leads: 85, site_visits: 18, bookings: 4, brokerage: 640000, avgDealValue: 8500000 },
    teamB: { name: 'Sales Team Bravo (Gachibowli)', leads: 65, site_visits: 12, bookings: 2, brokerage: 330000, avgDealValue: 6200000 }
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

  const developers = [
    { developer: 'Aparna Constructions', properties: 12, matches: 45, site_visits: 14, bookings: 3, brokerage: 480000, conversion: '6.6%' },
    { developer: 'My Home Group', properties: 8, matches: 32, site_visits: 9, bookings: 2, brokerage: 416000, conversion: '6.2%' },
    { developer: 'Prestige Group', properties: 6, matches: 28, site_visits: 8, bookings: 1, brokerage: 180000, conversion: '3.5%' },
    { developer: 'Jayabheri Group', properties: 4, matches: 15, site_visits: 3, bookings: 0, brokerage: 0, conversion: '0.0%' }
  ];

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
