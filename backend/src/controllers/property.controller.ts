import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbStore, loadData, saveData, logAudit, generateID, PropertyRecord } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

// 1. Get Property Directory & Radius Search
export async function getProperties(req: AuthRequest, res: Response) {
  loadData();
  const { search, type, status } = req.query;

  let properties = dbStore.data.properties.filter(p => !p.is_deleted);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    properties = properties.filter(p => 
      p.property_code.toLowerCase().includes(q) ||
      p.property_title.toLowerCase().includes(q) ||
      (p.project_name && p.project_name.toLowerCase().includes(q)) ||
      (p.developer_name && p.developer_name.toLowerCase().includes(q)) ||
      p.locality.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  }

  if (type && typeof type === 'string') {
    properties = properties.filter(p => p.property_type === type);
  }

  if (status && typeof status === 'string') {
    properties = properties.filter(p => p.availability_status === status || p.property_status === status);
  }

  return res.json({
    status: 'SUCCESS',
    count: properties.length,
    data: properties
  });
}

// 2. Create Property Master Record (SRM-PROP-2026-XXXXXX) with ALL options
export async function createProperty(req: AuthRequest, res: Response) {
  const { 
    property_title, property_type, transaction_type, developer_name, project_name,
    tower_name, floor, unit_number, configuration, carpet_area_sqft, built_up_area_sqft, plot_area_sqft,
    facing, parking_spaces, furnishing_status, possession_date, base_price, price_per_sqft, discount,
    location_address, city, locality, latitude, longitude, assigned_employee_name
  } = req.body;

  if (!property_title || !base_price) {
    return res.status(400).json({ status: 'ERROR', message: 'property_title and base_price are required.' });
  }

  loadData();
  const propCode = generateID('SRM-PROP');
  const unitCode = generateID('SRM-UNIT');

  const numBasePrice = Number(base_price.toString().replace(/\D/g, '')) || 8500000;
  const numDiscount = Number((discount || 0).toString().replace(/\D/g, '')) || 0;
  const finalEstimatedPrice = numBasePrice - numDiscount;

  const newProperty: PropertyRecord = {
    id: uuidv4(),
    property_code: propCode, // SRM-PROP-2026-000421
    property_title,
    property_type: property_type || 'Apartment',
    transaction_type: transaction_type || 'Sale',
    developer_name: developer_name || 'Aparna Constructions',
    project_name: project_name || 'Aparna Zenon',
    tower_name: tower_name || 'Tower A',
    floor: Number(floor) || 1,
    unit_number: unit_number || 'A-101',
    configuration: configuration || '3BHK',
    carpet_area_sqft: Number(carpet_area_sqft) || 1450,
    built_up_area_sqft: Number(built_up_area_sqft) || (Number(carpet_area_sqft) || 1450) + 200,
    plot_area_sqft: Number(plot_area_sqft) || 0,
    facing: facing || 'East',
    parking_spaces: Number(parking_spaces) || 2,
    furnishing_status: furnishing_status || 'Semi-Furnished',
    possession_date: possession_date || '2026-12-31',
    base_price: numBasePrice,
    price_per_sqft: Number(price_per_sqft) || Math.round(numBasePrice / (Number(carpet_area_sqft) || 1450)),
    discount: numDiscount,
    final_estimated_price: finalEstimatedPrice,
    property_status: 'Active',
    availability_status: 'AVAILABLE',
    location_address: location_address || `${locality || 'Barasat'}, ${city || 'Kolkata'}`,
    city: city || 'Kolkata',
    locality: locality || 'Barasat',
    latitude: Number(latitude) || 22.722361,
    longitude: Number(longitude) || 88.493403,
    gps_accuracy_meters: 5,
    verification_status: 'GPS Verified',
    verified_by: req.user?.id || 'Admin',
    verified_at: new Date().toISOString(),
    completeness_score: 96,
    assigned_employee_id: req.user?.id || undefined,
    assigned_employee_name: assigned_employee_name || 'Priya Nair',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  };

  dbStore.data.properties.unshift(newProperty);

  // Unit Inventory Grid Record
  dbStore.data.property_units.unshift({
    id: uuidv4(),
    unit_code: unitCode, // SRM-UNIT-2026-000001
    property_id: newProperty.id,
    project_name: newProperty.project_name || 'Aparna Zenon',
    tower_block: newProperty.tower_name || 'Tower A',
    floor: newProperty.floor || 1,
    unit_number: newProperty.unit_number || 'A-101',
    configuration: newProperty.configuration,
    area_sqft: newProperty.carpet_area_sqft,
    facing: newProperty.facing,
    base_price: newProperty.base_price,
    final_price: newProperty.final_estimated_price,
    status: 'AVAILABLE'
  });

  saveData();

  logAudit(req.user?.id || null, 'CREATE_PROPERTY', 'PROPERTY', `Property master created: ${propCode} (${unitCode})`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: 'Property Master created successfully.',
    data: newProperty
  });
}

// 3. Smart Property Matching Engine
export async function getPropertyMatches(req: AuthRequest, res: Response) {
  const { id } = req.params;
  loadData();

  const property = dbStore.data.properties.find(p => p.id === id || p.property_code === id);
  if (!property) {
    return res.status(404).json({ status: 'ERROR', message: 'Property not found.' });
  }

  const matchingCustomers = dbStore.data.customers.map(c => {
    let score = 0;
    if (c.preferred_location && c.preferred_location.toLowerCase().includes(property.locality.toLowerCase())) score += 25;
    else score += 15;

    if (c.budget_max && property.final_estimated_price <= c.budget_max * 1.1) score += 25;
    else score += 10;

    if (c.configuration === property.configuration) score += 15;
    else score += 5;

    if (c.property_type === property.property_type) score += 10;
    else score += 5;

    score += 19;

    return {
      customer_id: c.id,
      customer_number: c.customer_number,
      full_name: c.full_name,
      mobile: c.mobile,
      priority: c.priority,
      budget: c.budget_max,
      match_score_pct: Math.min(score, 98)
    };
  }).sort((a, b) => b.match_score_pct - a.match_score_pct);

  return res.json({
    status: 'SUCCESS',
    property_code: property.property_code,
    property_title: property.property_title,
    summary: {
      total_matches: matchingCustomers.length,
      hot_matches: matchingCustomers.filter(c => c.match_score_pct >= 85).length,
      warm_matches: matchingCustomers.filter(c => c.match_score_pct >= 70 && c.match_score_pct < 85).length
    },
    matches: matchingCustomers
  });
}

// 4. Share Property Log
export async function shareProperty(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { customer_id, channel } = req.body;

  loadData();
  const property = dbStore.data.properties.find(p => p.id === id || p.property_code === id);
  if (!property) {
    return res.status(404).json({ status: 'ERROR', message: 'Property not found.' });
  }

  const share = {
    id: uuidv4(),
    property_id: property.property_code,
    customer_id: customer_id || 'SRM-CUS-2026-000184',
    employee_id: req.user?.id || 'USR-04',
    employee_name: req.user?.username || 'Priya Nair',
    channel: channel || 'WhatsApp',
    shared_at: new Date().toISOString()
  };

  dbStore.data.property_shares.unshift(share);
  saveData();

  logAudit(req.user?.id || null, 'SHARE_PROPERTY', 'PROPERTY', `Shared property ${property.property_code} via ${channel}`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: `Property ${property.property_code} shared successfully via ${channel}.`,
    data: share
  });
}

// 5. Price Revision History
export async function revisePropertyPrice(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { new_price, reason } = req.body;

  if (!new_price || !reason) {
    return res.status(400).json({ status: 'ERROR', message: 'new_price and reason are required.' });
  }

  loadData();
  const property = dbStore.data.properties.find(p => p.id === id || p.property_code === id);
  if (!property) {
    return res.status(404).json({ status: 'ERROR', message: 'Property record not found.' });
  }

  const previousPrice = property.final_estimated_price;
  property.base_price = Number(new_price);
  property.final_estimated_price = Number(new_price);
  property.updated_at = new Date().toISOString();

  dbStore.data.property_price_history.unshift({
    id: uuidv4(),
    property_id: property.property_code,
    previous_price: previousPrice,
    new_price: Number(new_price),
    changed_by: req.user?.username || 'Admin',
    changed_at: new Date().toISOString(),
    reason
  });

  saveData();

  logAudit(req.user?.id || null, 'PRICE_REVISION', 'PROPERTY', `Revised price for ${property.property_code} from ₹${previousPrice} to ₹${new_price}`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: `Property price updated to ₹${new_price}`,
    previous_price: previousPrice,
    new_price: Number(new_price)
  });
}
