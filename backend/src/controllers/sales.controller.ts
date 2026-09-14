import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbStore, loadData, saveData, logAudit } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function siteVisitCheckin(req: AuthRequest, res: Response) {
  const { site_visit_id, lead_id, project_id, latitude, longitude, customer_otp, notes } = req.body;

  if (!latitude || !longitude || !customer_otp) {
    return res.status(400).json({ status: 'ERROR', message: 'latitude, longitude, and customer_otp are required.' });
  }

  if (customer_otp.length !== 6) {
    return res.status(400).json({ status: 'ERROR', message: 'Invalid 6-digit OTP code.' });
  }

  loadData();

  let projectGeo = { geo_latitude: 22.722361, geo_longitude: 88.493403, geo_fence_radius_meters: 300 };
  if (project_id) {
    const proj = dbStore.data.projects.find(p => p.id === project_id);
    if (proj) {
      projectGeo = {
        geo_latitude: proj.geo_latitude || 22.722361,
        geo_longitude: proj.geo_longitude || 88.493403,
        geo_fence_radius_meters: proj.geo_fence_radius_meters || 300
      };
    }
  }

  const distanceMeters = getDistanceMeters(latitude, longitude, projectGeo.geo_latitude, projectGeo.geo_longitude);
  const isGpsVerified = distanceMeters <= projectGeo.geo_fence_radius_meters;

  if (!isGpsVerified) {
    dbStore.data.fraud_alerts.unshift({
      id: uuidv4(),
      user_id: req.user?.id || null,
      alert_type: 'GPS_SPOOFING_SUSPECTED',
      severity: 'HIGH',
      description: `Site visit check-in attempted outside geofence boundary. Distance: ${Math.round(distanceMeters)}m`,
      status: 'ACTIVE',
      timestamp: new Date().toISOString()
    });
  }

  const visitId = site_visit_id || uuidv4();
  dbStore.data.site_visits.unshift({
    id: visitId,
    lead_id: lead_id || uuidv4(),
    sales_exec_id: req.user?.id || undefined,
    project_id: project_id || uuidv4(),
    latitude,
    longitude,
    is_gps_verified: isGpsVerified,
    customer_otp,
    feedback: notes || null,
    visit_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  });

  if (lead_id) {
    const lead = dbStore.data.leads.find(l => l.id === lead_id);
    if (lead) {
      lead.status = 'SITE_VISIT_COMPLETED';
      lead.updated_at = new Date().toISOString();
    }
  }

  saveData();

  logAudit(req.user?.id || null, 'SITE_VISIT_CHECKIN', 'SALES', `Check-in recorded. Verified: ${isGpsVerified}, Distance: ${distanceMeters.toFixed(1)}m`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: isGpsVerified ? 'GPS check-in verified successfully within site boundary.' : 'Check-in recorded, but distance exceeds geofence boundary.',
    data: {
      site_visit_id: visitId,
      is_gps_verified: isGpsVerified,
      distance_from_site_meters: parseFloat(distanceMeters.toFixed(1)),
      timestamp: new Date().toISOString()
    }
  });
}

export async function createBooking(req: AuthRequest, res: Response) {
  const { lead_id, unit_id, booking_amount, payment_mode, payment_ref } = req.body;

  if (!lead_id || !unit_id || !booking_amount) {
    return res.status(400).json({ status: 'ERROR', message: 'lead_id, unit_id, and booking_amount are required.' });
  }

  loadData();
  const unit = dbStore.data.units.find(u => u.id === unit_id);
  if (!unit) {
    return res.status(404).json({ status: 'ERROR', message: 'Unit not found.' });
  }

  const bookingId = uuidv4();
  dbStore.data.bookings.unshift({
    id: bookingId,
    lead_id,
    unit_id,
    sales_exec_id: req.user?.id || undefined,
    booking_amount,
    payment_mode: payment_mode || 'BANK_TRANSFER',
    payment_ref: payment_ref || `PAY-${Date.now()}`,
    status: 'PENDING_APPROVAL',
    created_at: new Date().toISOString()
  });

  const lead = dbStore.data.leads.find(l => l.id === lead_id);
  if (lead) {
    lead.status = 'BOOKING_INITIATED';
    lead.updated_at = new Date().toISOString();
  }

  saveData();

  logAudit(req.user?.id || null, 'CREATE_BOOKING', 'SALES', `Booking initiated: ${bookingId} for unit ${unit.unit_number}`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: 'Booking record created. Pending manager approval.',
    data: {
      booking_id: bookingId,
      status: 'PENDING_APPROVAL'
    }
  });
}

export async function approveBooking(req: AuthRequest, res: Response) {
  const { id } = req.params;
  loadData();

  const booking = dbStore.data.bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ status: 'ERROR', message: 'Booking not found.' });
  }

  booking.status = 'APPROVED';
  booking.approved_by_user_id = req.user?.id || undefined;

  const unit = dbStore.data.units.find(u => u.id === booking.unit_id);
  if (unit) unit.status = 'BOOKED';

  const lead = dbStore.data.leads.find(l => l.id === booking.lead_id);
  if (lead) {
    lead.status = 'WON';
    lead.updated_at = new Date().toISOString();
  }

  const project = unit ? dbStore.data.projects.find(p => p.id === unit.project_id) : null;
  const builder = project ? dbStore.data.builders.find(b => b.id === project.builder_id) : null;

  const commissionPct = builder ? builder.commission_percentage : 3.0;
  const unitPrice = unit ? unit.price : 10000000;
  const totalCommission = (unitPrice * commissionPct) / 100;

  const agentSplit = totalCommission * 0.30;
  const tlSplit = totalCommission * 0.10;
  const branchSplit = totalCommission * 0.15;
  const companySplit = totalCommission * 0.45;

  const commissionId = uuidv4();
  dbStore.data.commissions.unshift({
    id: commissionId,
    booking_id: id,
    total_commission_amount: totalCommission,
    agent_split_amount: agentSplit,
    team_lead_split_amount: tlSplit,
    branch_split_amount: branchSplit,
    company_split_amount: companySplit,
    status: 'DRAFT',
    created_at: new Date().toISOString()
  });

  saveData();

  logAudit(req.user?.id || null, 'APPROVE_BOOKING', 'SALES', `Booking ${id} approved and commission split generated`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: 'Booking approved. Unit status updated to BOOKED and commission split generated.',
    data: {
      booking_id: id,
      unit_status: 'BOOKED',
      commission: {
        total_commission_amount: totalCommission,
        agent_split: agentSplit,
        team_lead_split: tlSplit,
        company_split: companySplit
      }
    }
  });
}
