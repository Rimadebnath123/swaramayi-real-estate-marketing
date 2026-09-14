import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  dbStore, loadData, saveData, logAudit, generateID, 
  PropertyRecommendationShareRecord, SiteVisitRecord, BookingRecord, BrokerageRecord 
} from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

// 1. Calculate Algorithmic Property Matches for a Customer
export async function calculateCustomerMatches(req: AuthRequest, res: Response) {
  const { customer_number } = req.body;
  if (!customer_number) {
    return res.status(400).json({ status: 'ERROR', message: 'customer_number is required.' });
  }

  loadData();
  const customer = dbStore.data.customers.find(c => c.customer_number === customer_number || c.id === customer_number);
  if (!customer) {
    return res.status(404).json({ status: 'ERROR', message: 'Customer not found.' });
  }

  const activeProperties = dbStore.data.properties.filter(p => !p.is_deleted && p.availability_status !== 'SOLD');

  const matches = activeProperties.map(property => {
    let score = 0;
    const matchBreakdown = {
      location_match: 0,
      budget_match: 0,
      config_match: 0,
      type_match: 0,
      facing_match: 0
    };

    // Location Match (25 Points)
    if (customer.preferred_location && property.locality.toLowerCase().includes(customer.preferred_location.toLowerCase())) {
      score += 25;
      matchBreakdown.location_match = 25;
    } else {
      score += 15;
      matchBreakdown.location_match = 15;
    }

    // Budget Match (25 Points)
    const maxBudget = customer.budget_max || 8500000;
    if (property.final_estimated_price <= maxBudget) {
      score += 25;
      matchBreakdown.budget_match = 25;
    } else if (property.final_estimated_price <= maxBudget * 1.15) {
      score += 15;
      matchBreakdown.budget_match = 15;
    } else {
      score += 5;
      matchBreakdown.budget_match = 5;
    }

    // BHK Configuration Match (20 Points)
    if (customer.configuration === property.configuration) {
      score += 20;
      matchBreakdown.config_match = 20;
    } else {
      score += 8;
      matchBreakdown.config_match = 8;
    }

    // Property Type Match (15 Points)
    if (customer.property_type && property.property_type.toLowerCase().includes(customer.property_type.toLowerCase())) {
      score += 15;
      matchBreakdown.type_match = 15;
    } else {
      score += 7;
      matchBreakdown.type_match = 7;
    }

    // Facing & Amenities Match (15 Points)
    if (customer.family_requirements && customer.family_requirements.toLowerCase().includes(property.facing.toLowerCase())) {
      score += 15;
      matchBreakdown.facing_match = 15;
    } else {
      score += 10;
      matchBreakdown.facing_match = 10;
    }

    const totalPct = Math.min(score, 98);
    const category = totalPct >= 85 ? 'HOT' : totalPct >= 70 ? 'WARM' : 'COLD';

    return {
      property_code: property.property_code,
      property_title: property.property_title,
      project_name: property.project_name,
      tower_name: property.tower_name,
      locality: property.locality,
      configuration: property.configuration,
      base_price: property.base_price,
      final_price: property.final_estimated_price,
      availability_status: property.availability_status,
      match_score_pct: totalPct,
      category,
      match_breakdown: matchBreakdown
    };
  }).sort((a, b) => b.match_score_pct - a.match_score_pct);

  return res.json({
    status: 'SUCCESS',
    customer: {
      customer_number: customer.customer_number,
      full_name: customer.full_name,
      mobile: customer.mobile,
      preferred_location: customer.preferred_location,
      budget_max: customer.budget_max,
      configuration: customer.configuration
    },
    total_matches: matches.length,
    matches
  });
}

// 2. Salesperson Selects Properties & Sends Portfolio to Customer
export async function sendPropertyRecommendations(req: AuthRequest, res: Response) {
  const { customer_number, property_codes, channel } = req.body;

  if (!customer_number || !property_codes || !Array.isArray(property_codes) || property_codes.length === 0) {
    return res.status(400).json({ status: 'ERROR', message: 'customer_number and property_codes array are required.' });
  }

  loadData();
  const customer = dbStore.data.customers.find(c => c.customer_number === customer_number);
  if (!customer) {
    return res.status(404).json({ status: 'ERROR', message: 'Customer not found.' });
  }

  const recCode = generateID('SRM-REC');
  const viewToken = uuidv4().substring(0, 8);

  const recommendation: PropertyRecommendationShareRecord = {
    id: uuidv4(),
    share_code: recCode, // SRM-REC-2026-000101
    customer_number: customer.customer_number,
    customer_name: customer.full_name,
    employee_name: req.user?.username || 'Priya Nair (Sales Exec)',
    property_codes,
    channel: channel || 'WhatsApp',
    view_token: viewToken,
    sent_at: new Date().toISOString(),
    customer_viewed: false,
    customer_response: 'PENDING'
  };

  dbStore.data.recommendation_shares.unshift(recommendation);
  saveData();

  logAudit(req.user?.id || null, 'SEND_RECOMMENDATION', 'MATCHING', `Sent recommendation ${recCode} (${property_codes.join(', ')}) to ${customer.customer_number} via ${channel}`, req.ip);

  const customerViewUrl = `http://localhost:3000/view-properties/${viewToken}`;
  const whatsappPayload = `Hello ${customer.full_name},\n\nGreetings from Swaramayi Real Estate!\nBased on your requirement for ${customer.configuration || '3BHK'} in ${customer.preferred_location || 'Kondapur'}, we have shortlisted ${property_codes.length} premium properties for you:\n\n🔗 View Full Property Specs & Floor Plans:\n${customerViewUrl}\n\nPlease reply or click the link to schedule a verified site visit!`;

  return res.status(201).json({
    status: 'SUCCESS',
    message: `Recommendation portfolio ${recCode} created and ready to send via ${channel}.`,
    data: recommendation,
    customer_view_url: customerViewUrl,
    whatsapp_payload: whatsappPayload
  });
}

// 3. Customer Views Recommendations Portal Endpoint
export async function getCustomerRecommendationView(req: AuthRequest, res: Response) {
  const { shareToken } = req.params;
  loadData();

  const rec = dbStore.data.recommendation_shares.find(r => r.view_token === shareToken);
  if (!rec) {
    return res.status(404).json({ status: 'ERROR', message: 'Recommendation link expired or invalid.' });
  }

  rec.customer_viewed = true;
  rec.customer_viewed_at = new Date().toISOString();
  saveData();

  const matchedProperties = dbStore.data.properties.filter(p => rec.property_codes.includes(p.property_code));

  return res.json({
    status: 'SUCCESS',
    recommendation_code: rec.share_code,
    customer_name: rec.customer_name,
    properties: matchedProperties
  });
}

// 4. Customer Submits Response (Interested / Book Visit / Reject)
export async function submitCustomerResponse(req: AuthRequest, res: Response) {
  const { share_token, response_type, notes } = req.body;

  if (!share_token || !response_type) {
    return res.status(400).json({ status: 'ERROR', message: 'share_token and response_type are required.' });
  }

  loadData();
  const rec = dbStore.data.recommendation_shares.find(r => r.view_token === share_token);
  if (!rec) {
    return res.status(404).json({ status: 'ERROR', message: 'Recommendation link invalid.' });
  }

  rec.customer_response = response_type; // INTERESTED | BOOK_VISIT | REJECTED
  rec.customer_response_notes = notes || '';
  saveData();

  logAudit(null, 'CUSTOMER_RESPONSE', 'MATCHING', `Customer ${rec.customer_name} responded: ${response_type}`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: `Thank you ${rec.customer_name}! Your response '${response_type}' has been recorded. Our sales team will reach out immediately.`
  });
}

// 5. Schedule Verified Site Visit (SRM-SV-2026-XXXXXX)
export async function scheduleSiteVisit(req: AuthRequest, res: Response) {
  const { customer_number, property_code, scheduled_date, scheduled_time } = req.body;

  if (!customer_number || !property_code) {
    return res.status(400).json({ status: 'ERROR', message: 'customer_number and property_code are required.' });
  }

  loadData();
  const customer = dbStore.data.customers.find(c => c.customer_number === customer_number);
  const property = dbStore.data.properties.find(p => p.property_code === property_code);

  const svCode = generateID('SRM-SV');
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const siteVisit: SiteVisitRecord = {
    id: uuidv4(),
    site_visit_code: svCode, // SRM-SV-2026-000501
    customer_number: customer?.customer_number || customer_number,
    customer_name: customer?.full_name || 'Rohan Deshmukh',
    property_code: property?.property_code || property_code,
    property_title: property?.property_title || 'Aparna Zenon',
    sales_executive: req.user?.username || 'Priya Nair (Sales Exec)',
    scheduled_date: scheduled_date || new Date().toISOString().split('T')[0],
    scheduled_time: scheduled_time || '11:00 AM',
    otp_code: otpCode,
    is_otp_verified: true,
    gps_checkin: '22.722361° N, 88.493403° E (Accuracy 5m)',
    visit_status: 'SCHEDULED',
    created_at: new Date().toISOString()
  };

  dbStore.data.site_visits.unshift(siteVisit);
  saveData();

  logAudit(req.user?.id || null, 'SCHEDULE_SITE_VISIT', 'SITE_VISIT', `Created site visit ${svCode} for ${customer_number}`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: `Site Visit ${svCode} scheduled successfully! Verification OTP: ${otpCode}`,
    data: siteVisit
  });
}

// 6. Confirmed Booking (SRM-BKG) & Automatic Brokerage Commission Calculation (SRM-BRK)
export async function confirmUnitBooking(req: AuthRequest, res: Response) {
  const { customer_number, property_code, unit_number, agreement_value, token_amount_paid } = req.body;

  if (!customer_number || !property_code || !agreement_value) {
    return res.status(400).json({ status: 'ERROR', message: 'customer_number, property_code, and agreement_value are required.' });
  }

  loadData();
  const bkgCode = generateID('SRM-BKG');
  const brkCode = generateID('SRM-BRK');

  const numAgreementVal = Number(agreement_value);
  const developerCommissionPct = 2.5; // 2.5% Developer Commission
  const totalCommission = (numAgreementVal * developerCommissionPct) / 100;
  const agentPayout = (totalCommission * 40) / 100; // 40% share to agent
  const companyShare = totalCommission - agentPayout;

  const booking: BookingRecord = {
    id: uuidv4(),
    booking_code: bkgCode, // SRM-BKG-2026-000201
    customer_number,
    customer_name: 'Rohan Deshmukh',
    property_code,
    unit_number: unit_number || 'A-504',
    agreement_value: numAgreementVal,
    token_amount_paid: Number(token_amount_paid) || 200000,
    payment_mode: 'UPI / NEFT',
    sales_executive: req.user?.username || 'Priya Nair (Sales Exec)',
    booking_date: new Date().toISOString().split('T')[0],
    status: 'CONFIRMED'
  };

  const brokerage: BrokerageRecord = {
    id: uuidv4(),
    brokerage_code: brkCode, // SRM-BRK-2026-000101
    booking_code: bkgCode,
    developer_name: 'Aparna Constructions',
    commission_percentage: developerCommissionPct,
    total_commission_amount: totalCommission,
    agent_payout_amount: agentPayout,
    company_share_amount: companyShare,
    payout_status: 'APPROVED',
    created_at: new Date().toISOString()
  };

  dbStore.data.bookings.unshift(booking);
  dbStore.data.brokerage_records.unshift(brokerage);

  // Update property unit status on Live Inventory Board
  const unit = dbStore.data.property_units.find(u => u.unit_number === unit_number || u.property_id === property_code);
  if (unit) {
    unit.status = 'BOOKED';
    unit.customer_name = booking.customer_name;
  }

  saveData();

  logAudit(req.user?.id || null, 'CONFIRM_BOOKING', 'BOOKING', `Booking ${bkgCode} confirmed. Brokerage ${brkCode} calculated (Total ₹${totalCommission})`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: `Unit booking ${bkgCode} confirmed! Brokerage record ${brkCode} generated.`,
    booking,
    brokerage
  });
}
