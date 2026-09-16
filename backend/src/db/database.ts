// Interface Definitions
export interface UserRecord {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  mobile: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GENERAL_MANAGER' | 'BRANCH_MANAGER' | 'SALES_MANAGER' | 'TEAM_LEAD' | 'SALES_EXEC' | 'TELECALLER' | 'BACK_OFFICE' | 'ACCOUNTS' | 'HR' | 'MARKETING' | 'PROPERTY_MANAGER' | 'FIELD_EXEC' | 'CUSTOMER_SUPPORT' | string;
  branch_id?: string;
  branch_name?: string;
  department?: string;
  team_name?: string;
  manager_name?: string;
  created_at: string;
  is_active: boolean;
  is_locked?: boolean;
  user_status?: 'ACTIVE' | 'INVITED' | 'PENDING' | 'SUSPENDED' | 'LOCKED' | 'RESIGNED' | 'TERMINATED';
  password_hash?: string;
  company_id?: string;
  is_mfa_enabled?: boolean;
}

export interface CustomerRecord {
  id: string;
  customer_number: string; // SRM-CUS-2026-000184
  full_name: string;
  mobile: string;
  alt_mobile?: string;
  alternate_mobile?: string;
  email: string;
  dob?: string;
  address?: string;
  city: string;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  property_type?: string;
  propertyType?: string;
  bhk?: string;
  bhk_preference?: string;
  configuration?: string;
  loan_required?: boolean;
  investment_purpose?: string;
  family_requirements?: string;
  preferred_projects?: string;
  purchase_timeline?: string;
  source: string;
  campaign_name?: string;
  medium?: string;
  assigned_employee_id?: string;
  assigned_employee_name?: string;
  team_lead_id?: string;
  team_leader_id?: string;
  team_lead_name?: string;
  priority: 'HOT' | 'WARM' | 'COLD' | 'MEDIUM' | any;
  status: any;
  customer_status?: string;
  quality_score: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface PropertyRecord {
  id: string;
  property_code: string; // SRM-PROP-2026-000421
  property_title: string;
  property_type: string;
  transaction_type: string;
  developer_name: string;
  project_name: string;
  tower_name: string;
  floor: number;
  unit_number: string;
  configuration: string;
  carpet_area_sqft: number;
  built_up_area_sqft: number;
  plot_area_sqft?: number;
  facing: string;
  parking_spaces: number;
  furnishing_status: string;
  possession_date: string;
  base_price: number;
  price_per_sqft: number;
  discount: number;
  final_estimated_price: number;
  final_price?: string;
  price_sqft?: string;
  property_status: 'Active' | 'Under Offer' | 'Sold' | 'Archived';
  availability_status: 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'SOLD';
  location_address: string;
  city: string;
  locality: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy_meters?: number;
  verification_status?: string;
  verified_by?: string;
  verified_at?: string;
  completeness_score?: number;
  assigned_employee_id?: string;
  assigned_employee_name?: string;
  category?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  location?: string;
  description?: string;
  images?: string[];
  image?: string;
  created_at: string;
  updated_at?: string;
  is_deleted: boolean;
}

export interface PropertyUnitRecord {
  id: string;
  unit_code: string; // SRM-UNIT-2026-000001
  property_id: string;
  project_name: string;
  tower_block: string;
  floor: number;
  unit_number: string;
  configuration: string;
  area_sqft: number;
  facing: string;
  base_price: number;
  final_price: number;
  status: 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'SOLD';
  customer_name?: string;
}

export interface PropertyPriceHistoryRecord {
  id: string;
  property_id: string;
  previous_price: number;
  new_price: number;
  changed_by: string;
  changed_at: string;
  reason: string;
}

export interface PropertyShareRecord {
  id: string;
  property_id: string;
  customer_id: string;
  employee_id: string;
  employee_name: string;
  channel: string;
  shared_at: string;
}

// MATCHING & RECOMMENDATION SCHEMAS
export interface PropertyRecommendationShareRecord {
  id: string;
  share_code: string; // SRM-REC-2026-000101
  customer_number: string;
  customer_name: string;
  employee_name: string;
  property_codes: string[];
  channel: 'WhatsApp' | 'Email' | 'Direct Link';
  view_token: string;
  sent_at: string;
  customer_viewed: boolean;
  customer_viewed_at?: string;
  customer_response?: 'INTERESTED' | 'BOOK_VISIT' | 'REJECTED' | 'PENDING';
  customer_response_notes?: string;
}

export interface SiteVisitRecord {
  id: string;
  site_visit_code?: string; // SRM-SV-2026-000501
  customer_number?: string;
  customer_name?: string;
  property_code?: string;
  property_title?: string;
  sales_executive?: string;
  sales_exec_id?: string;
  project_id?: string;
  latitude?: number;
  longitude?: number;
  is_gps_verified?: boolean;
  customer_otp?: string;
  feedback?: string;
  visit_date?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  otp_code?: string;
  is_otp_verified?: boolean;
  gps_checkin?: string;
  visit_status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | string;
  feedback_notes?: string;
  created_at?: string;
  lead_id?: string;
}

export interface BookingRecord {
  id: string;
  booking_code?: string; // SRM-BKG-2026-000201
  customer_number?: string;
  customer_name?: string;
  property_code?: string;
  unit_number?: string;
  agreement_value?: number;
  token_amount_paid?: number;
  payment_mode?: string;
  payment_ref?: string;
  sales_executive?: string;
  sales_exec_id?: string;
  booking_date?: string;
  status?: 'CONFIRMED' | 'CANCELLED' | 'APPROVED' | 'PENDING_APPROVAL' | string;
  booking_amount?: number;
  approved_by_user_id?: string;
  unit_id?: string;
  lead_id?: string;
  created_at?: string;
}

export interface BrokerageRecord {
  id: string;
  brokerage_code: string; // SRM-BRK-2026-000101
  booking_code: string;
  developer_name: string;
  commission_percentage: number;
  total_commission_amount: number;
  agent_payout_amount: number;
  company_share_amount: number;
  payout_status: 'PENDING' | 'APPROVED' | 'PAID';
  created_at: string;
}

// LEGAL AGREEMENTS SCHEMAS
export interface AgreementRecord {
  id: string;
  agreement_code: string; // SRM-AGR-CUS-2026-000301 or SRM-AGR-DEV-2026-000301
  agreement_type: 'CUSTOMER_SITE_VISIT' | 'DEVELOPER_MANDATE';
  party_name: string;
  party_mobile_email: string;
  property_code_or_project: string;
  terms_and_conditions: string[];
  commission_rate_pct?: number;
  validity_period_months: number;
  signed_status: 'DRAFT' | 'PENDING_SIGNATURE' | 'EXECUTED_SIGNED' | 'EXPIRED';
  digital_signature_hash?: string;
  signed_at?: string;
  created_at: string;
}

// BILLING & AUTO TAX INVOICE SCHEMAS
export interface InvoiceRecord {
  id: string;
  invoice_number: string; // SRM-INV-2026-000401
  invoice_category?: 'CUSTOMER' | 'DEVELOPER';
  branch_name?: string;
  invoice_type: 'DEVELOPER_COMMISSION_GST' | 'CUSTOMER_TOKEN_RECEIPT' | 'SERVICE_BILL';
  booking_code: string;
  customer_name: string;
  developer_name: string;
  property_title: string;
  unit_number: string;
  agreement_value: number;
  hsn_sac_code: string;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  total_invoice_amount: number;
  payment_status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID_SETTLED';
  gstin_developer: string;
  gstin_swaramayi: string;
  due_date: string;
  created_at: string;
}

// ROLE PERMISSION & SECURITY SCHEMAS
export interface BranchRecord {
  id: string;
  branch_code: string;
  branch_name: string;
  city: string;
  address: string;
  branch_manager_id?: string;
  branch_manager_name?: string;
  created_at: string;
}

export interface TeamRecord {
  id: string;
  team_name: string;
  branch_id?: string;
  branch_name: string;
  team_lead_id?: string;
  team_lead_name?: string;
  department?: string;
  leader_name?: string;
  monthly_target?: string;
  created_at?: string;
  members_count?: number;
}

export interface ModulePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_approve: boolean;
  can_change_price?: boolean;
  can_change_owner?: boolean;
  can_change_brokerage?: boolean;
  can_mask_mobile?: boolean;
}

export interface RolePermissionRecord {
  id: string;
  role_key: string;
  role_name: string;
  data_scope: 'ALL_DATA' | 'BRANCH_DATA' | 'TEAM_DATA' | 'ASSIGNED_DATA' | 'OWN_DATA' | string;
  permissions: ModulePermission[];
}

export interface ApprovalRequestRecord {
  id: string;
  request_code: string; // SRM-REQ-2026-000101
  request_type: 'LEAD_TRANSFER' | 'PROPERTY_PRICE_CHANGE' | 'BROKERAGE_CHANGE' | 'BOOKING_CANCELLATION' | 'DATA_EXPORT';
  record_id: string;
  requested_by_id: string;
  requested_by_name: string;
  requested_at: string;
  old_value: string;
  new_value: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by_name?: string;
  approved_at?: string;
}

export interface ActiveSessionRecord {
  id: string;
  user_id: string;
  username: string;
  role: string;
  ip_address: string;
  device_info: string;
  login_time: string;
  last_active: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface SecurityAlertRecord {
  id: string;
  user_id: string;
  username: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  reason: string;
  timestamp: string;
}

export interface AuditLogRecord {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface Schema {
  branches: BranchRecord[];
  teams: TeamRecord[];
  users: UserRecord[];
  customers: CustomerRecord[];
  properties: PropertyRecord[];
  property_units: PropertyUnitRecord[];
  property_price_history: PropertyPriceHistoryRecord[];
  property_shares: PropertyShareRecord[];
  recommendation_shares: PropertyRecommendationShareRecord[];
  site_visits: SiteVisitRecord[];
  bookings: BookingRecord[];
  brokerage_records: BrokerageRecord[];
  agreements: AgreementRecord[];
  invoices: InvoiceRecord[];
  role_permissions: RolePermissionRecord[];
  approval_requests: ApprovalRequestRecord[];
  active_sessions: ActiveSessionRecord[];
  security_alerts: SecurityAlertRecord[];
  audit_logs: AuditLogRecord[];
  payments: any[];
  marketing_campaigns: any[];
  employee_activities: any[];
  leads: any[];
  projects: any[];
  builders: any[];
  units: any[];
  commissions: any[];
  fraud_alerts: any[];
  system_settings: any;
  lead_transfers: any[];
  followups: any[];
  sequences: {
    customer_seq: number;
    property_seq: number;
    unit_seq: number;
    lead_seq: number;
    recommendation_seq: number;
    site_visit_seq: number;
    booking_seq: number;
    brokerage_seq: number;
    agreement_seq: number;
    invoice_seq: number;
    approval_seq: number;
  };
}

const initialData: Schema = {
  branches: [
    { id: 'BR-01', branch_code: 'SRM-BR-01', branch_name: 'Head Office (Kolkata)', city: 'Kolkata', address: 'Camac Street, Kolkata - 700017', branch_manager_id: 'USR-01', branch_manager_name: 'Avishek Das (Super Admin)', created_at: '2026-01-01' },
    { id: 'BR-02', branch_code: 'SRM-BR-02', branch_name: 'Kolkata Branch', city: 'Kolkata', address: 'Park Street, Kolkata - 700016', branch_manager_id: 'USR-02', branch_manager_name: 'Abinash Roy (Admin)', created_at: '2026-03-01' }
  ],
  teams: [
    { id: 'TEAM-01', team_name: 'Corporate Leadership Squad', branch_id: 'BR-01', branch_name: 'Head Office (Kolkata)', department: 'Executive Board', leader_name: 'Avishek Das (SUPER_ADMIN)', monthly_target: '50 Property Units', created_at: '2026-01-15', members_count: 1 },
    { id: 'TEAM-02', team_name: 'Kolkata Expansion Team', branch_id: 'BR-02', branch_name: 'Kolkata Branch', department: 'Sales Operations', leader_name: 'Abinash Roy (Admin)', monthly_target: '25 Property Units', created_at: '2026-03-10', members_count: 1 },
    { id: 'TEAM-03', team_name: 'General Operations Squad', branch_id: 'BR-01', branch_name: 'Head Office (Kolkata)', department: 'System Admin', leader_name: 'Avishek Das (SUPER_ADMIN)', monthly_target: '15 Property Units', created_at: '2026-04-01', members_count: 1 },
    { id: 'TEAM-04', team_name: 'Kolkata Admin & Technical Squad', branch_id: 'BR-02', branch_name: 'Kolkata Branch', department: 'System Admin', leader_name: 'Abinash Roy (Admin)', monthly_target: '20 Property Units', created_at: '2026-08-27', members_count: 1 }
  ],
  users: [
    { id: 'USR-01', username: 'Avishek Das (Super Admin)', full_name: 'Avishek Das', email: 'admin@swaramayi.com', mobile: '+91 98490 00001', role: 'SUPER_ADMIN', branch_name: 'Head Office (Kolkata)', department: 'Executive Board', team_name: 'Corporate Leadership Squad', manager_name: 'Self', is_active: true, user_status: 'ACTIVE', created_at: '2026-01-01' },
    { id: 'USR-02', username: 'punita.roy', full_name: 'Punita Roy', email: 'punita.roy@swaramayi.com', mobile: '+91 90513 22932', role: 'SALES_EXEC', branch_name: 'Kolkata Branch', department: 'Sales Management', team_name: 'Kolkata Expansion Team', manager_name: 'Avishek Das (Super Admin)', is_active: true, user_status: 'ACTIVE', created_at: '2026-01-15' },
    { id: 'USR-03', username: 'abinash.roy', full_name: 'Abinash Roy', email: 'abinash.roy@swaramayi.com', mobile: '+91 76970 90078', role: 'ADMIN', branch_name: 'Kolkata Branch', department: 'Residential Sales', team_name: 'Kolkata Admin & Technical Squad', manager_name: 'Avishek Das (Super Admin)', is_active: true, user_status: 'ACTIVE', created_at: '2026-01-15' }
  ],
  customers: [],
  properties: [
    {
      id: 'PROP-001',
      property_code: 'SRM-PROP-2026-000425',
      property_title: 'SHIBALAY',
      property_type: 'Apartment',
      transaction_type: 'Sale',
      category: 'Buy',
      developer_name: 'KRISHNA DAS',
      project_name: 'SHIBALAY',
      tower_name: 'Block A',
      floor: 3,
      unit_number: 'A-302',
      configuration: '3BHK',
      bedrooms: 3,
      bathrooms: 2,
      carpet_area_sqft: 422.5,
      built_up_area_sqft: 650,
      areaSqft: 650,
      facing: 'East',
      parking_spaces: 1,
      furnishing_status: 'Semi-Furnished',
      possession_date: 'Ready to Move',
      base_price: 2080000,
      price_per_sqft: 3200,
      final_price: '₹22,76,200',
      price_sqft: '₹4,574/Sq.Ft.',
      discount: 0,
      final_estimated_price: 2080000,
      property_status: 'Active',
      availability_status: 'AVAILABLE',
      location_address: 'Chapadali Bus Terminus Hub, Jessore Road, Barasat, North 24 Parganas, Kolkata, West Bengal - 700124',
      city: 'Kolkata',
      locality: 'BARASAT, CHAPADALI',
      location: 'BARASAT, CHAPADALI',
      description: 'Spacious 3 BHK residential apartment featuring modern amenities, excellent ventilation, and prime location connectivity in BARASAT, CHAPADALI, Kolkata.',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
      ],
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      is_deleted: false,
      created_at: '2026-01-10T10:00:00.000Z'
    },
    {
      id: 'PROP-002',
      property_code: 'SRM-PROP-2026-000426',
      property_title: 'GAJAPATI APARTMENT',
      property_type: 'Apartment',
      transaction_type: 'Sale',
      category: 'Buy',
      developer_name: 'BABLA DUTTA',
      project_name: 'GAJAPATI APARTMENT',
      tower_name: 'Block B',
      floor: 2,
      unit_number: 'B-204',
      configuration: '2BHK',
      bedrooms: 2,
      bathrooms: 2,
      carpet_area_sqft: 700.35,
      built_up_area_sqft: 771,
      areaSqft: 771,
      facing: 'North-East',
      parking_spaces: 1,
      furnishing_status: 'Semi-Furnished',
      possession_date: 'Ready to Move',
      base_price: 3515900,
      price_per_sqft: 4560,
      final_price: '₹35,15,900',
      price_sqft: '₹5,020/Sq.Ft.',
      discount: 0,
      final_estimated_price: 3515900,
      property_status: 'Active',
      availability_status: 'AVAILABLE',
      location_address: 'Jessore Road, Barasat, North 24 Parganas, Kolkata, West Bengal - 700124',
      city: 'Kolkata',
      locality: 'Barasat, Kolkata',
      location: 'Barasat, Kolkata',
      description: 'Premium 2 BHK residential apartment with modern fittings, lift, 24x7 security, and power backup in Barasat, Kolkata.',
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
      ],
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      is_deleted: false,
      created_at: '2026-02-01T10:00:00.000Z'
    },
    {
      id: 'PROP-003',
      property_code: 'SRM-PROP-2026-000427',
      property_title: 'DHRITI APARTMENT',
      property_type: 'Apartment',
      transaction_type: 'Sale',
      category: 'Buy',
      developer_name: 'NANIGOPAL DAS',
      project_name: 'DHRITI APARTMENT',
      tower_name: 'Tower 1',
      floor: 4,
      unit_number: '1-401',
      configuration: '2BHK',
      bedrooms: 2,
      bathrooms: 2,
      carpet_area_sqft: 718.25,
      built_up_area_sqft: 765,
      areaSqft: 765,
      facing: 'East',
      parking_spaces: 1,
      furnishing_status: 'Fully Furnished',
      possession_date: 'Ready to Move',
      base_price: 3621400,
      price_per_sqft: 4733,
      final_price: '₹36,21,400',
      price_sqft: '₹5,042/Sq.Ft.',
      discount: 0,
      final_estimated_price: 3621400,
      property_status: 'Active',
      availability_status: 'AVAILABLE',
      location_address: 'Jessore Road, Barasat, North 24 Parganas, Kolkata, West Bengal - 700124',
      city: 'Kolkata',
      locality: 'Barasat, Kolkata',
      location: 'Barasat, Kolkata',
      description: 'Luxury 2 BHK residence with covered parking, modular kitchen, balcony views, and close proximity to Barasat, Kolkata.',
      images: [
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
      ],
      image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
      is_deleted: false,
      created_at: '2026-03-05T10:00:00.000Z'
    }
  ],
  property_units: [],
  property_price_history: [],
  property_shares: [],
  recommendation_shares: [],
  site_visits: [],
  bookings: [],
  brokerage_records: [],
  agreements: [],
  invoices: [],
  role_permissions: [
    { id: 'RP-01', role_key: 'SUPER_ADMIN', role_name: 'SUPER ADMIN / OWNER', data_scope: 'ALL_DATA', permissions: [] },
    { id: 'RP-02', role_key: 'ADMIN', role_name: 'ADMIN', data_scope: 'ALL_DATA', permissions: [] },
    { id: 'RP-03', role_key: 'GENERAL_MANAGER', role_name: 'GENERAL MANAGER', data_scope: 'ALL_BRANCHES', permissions: [] },
    { id: 'RP-04', role_key: 'BRANCH_MANAGER', role_name: 'BRANCH MANAGER', data_scope: 'OWN_BRANCH', permissions: [] },
    { id: 'RP-05', role_key: 'SALES_MANAGER', role_name: 'SALES MANAGER', data_scope: 'OWN_TEAM', permissions: [] },
    { id: 'RP-06', role_key: 'TEAM_LEAD', role_name: 'TEAM LEADER', data_scope: 'OWN_TEAM', permissions: [] },
    { id: 'RP-07', role_key: 'SALES_EXEC', role_name: 'SALES EXECUTIVE', data_scope: 'ASSIGNED_DATA', permissions: [] },
    { id: 'RP-08', role_key: 'TELECALLER', role_name: 'TELECALLER', data_scope: 'ASSIGNED_DATA', permissions: [] },
    { id: 'RP-09', role_key: 'BACK_OFFICE', role_name: 'BACK OFFICE', data_scope: 'ALL_DATA', permissions: [] },
    { id: 'RP-10', role_key: 'ACCOUNTS', role_name: 'ACCOUNTS & FINANCE', data_scope: 'ALL_DATA', permissions: [] },
    { id: 'RP-11', role_key: 'HR', role_name: 'HUMAN RESOURCES (HR)', data_scope: 'ALL_DATA', permissions: [] },
    { id: 'RP-12', role_key: 'MARKETING', role_name: 'MARKETING SQUAD', data_scope: 'ALL_DATA', permissions: [] },
    { id: 'RP-13', role_key: 'PROPERTY_MANAGER', role_name: 'PROPERTY MANAGER', data_scope: 'ALL_DATA', permissions: [] },
    { id: 'RP-14', role_key: 'FIELD_EXEC', role_name: 'FIELD EXECUTIVE', data_scope: 'ASSIGNED_DATA', permissions: [] },
    { id: 'RP-15', role_key: 'CUSTOMER_SUPPORT', role_name: 'CUSTOMER SUPPORT', data_scope: 'ASSIGNED_DATA', permissions: [] }
  ],
  approval_requests: [
    {
      id: 'REQ-01',
      request_code: 'SRM-REQ-2026-000101',
      request_type: 'LEAD_TRANSFER',
      record_id: 'SRM-CUS-2026-000184',
      requested_by_id: 'USR-04',
      requested_by_name: 'Priya Nair (Sales Exec)',
      requested_at: '16 Aug 2026 12:00 PM',
      old_value: 'Priya Nair (Sales Exec)',
      new_value: 'Amit Kumar (Sales Exec)',
      reason: 'Customer requested secondary agent consultation for villa project in Gachibowli.',
      status: 'PENDING'
    }
  ],
  active_sessions: [
    {
      id: 'SES-01',
      user_id: 'USR-01',
      username: 'Avishek Das (Super Admin)',
      role: 'SUPER_ADMIN',
      ip_address: '127.0.0.1 (Localhost)',
      device_info: 'Chrome 127.0 / Windows 11 Enterprise',
      login_time: '16 Aug 2026 09:00 AM',
      last_active: 'Just Now',
      status: 'ACTIVE'
    }
  ],
  security_alerts: [],
  audit_logs: [],
  payments: [],
  marketing_campaigns: [],
  employee_activities: [],
  leads: [],
  projects: [],
  builders: [],
  units: [],
  commissions: [],
  fraud_alerts: [],
  system_settings: { is_lockdown_active: false },
  lead_transfers: [],
  followups: [],
  sequences: {
    customer_seq: 0,
    property_seq: 0,
    unit_seq: 0,
    lead_seq: 0,
    recommendation_seq: 0,
    site_visit_seq: 0,
    booking_seq: 0,
    brokerage_seq: 0,
    agreement_seq: 0,
    invoice_seq: 0,
    approval_seq: 0
  }
};

export class MongoStoreDatabase {
  public data: Schema;

  constructor() {
    this.data = initialData;
  }

  public load() {
    // Memory and MongoDB collection state store
  }

  public save() {
    // Memory and MongoDB collection state store
  }
}

export const dbStore = new MongoStoreDatabase();

import { syncToMongoDB, loadDataFromMongoDB } from './mongoPersistence.js';

export function loadData() {
  dbStore.load();
  loadDataFromMongoDB().then(mongoData => {
    if (mongoData) {
      if (mongoData.users && mongoData.users.length > 0) {
        const userMap = new Map<string, any>();
        initialData.users.forEach((u: any) => userMap.set(u.id, u));
        mongoData.users.forEach((u: any) => userMap.set(u.id || u.username, { ...(userMap.get(u.id || u.username) || {}), ...u }));
        dbStore.data.users = Array.from(userMap.values()) as any;
      } else {
        dbStore.data.users = initialData.users as any;
      }
      if (mongoData.teams && mongoData.teams.length > 0) dbStore.data.teams = mongoData.teams as any;
      if (mongoData.branches && mongoData.branches.length > 0) dbStore.data.branches = mongoData.branches as any;
      if (mongoData.properties && mongoData.properties.length > 0) {
        const realProps = mongoData.properties.filter((p: any) => {
          const title = String(p.property_title || p.title || '').toLowerCase();
          const pCode = String(p.property_code || p.id || '').toLowerCase();
          return !title.includes('sky villa') && 
                 !title.includes('commercial plaza') && 
                 !title.includes('greenwood plots') && 
                 !title.includes('aparna zenon') && 
                 !title.includes('financial towers') && 
                 !title.includes('prestige high') && 
                 !title.includes('silicon county') &&
                 pCode !== 'prop-04' && pCode !== 'prop-05' && pCode !== 'prop-06';
        });
        dbStore.data.properties = realProps.length > 0 ? (realProps as any) : (initialData.properties as any);
      } else if (!dbStore.data.properties || dbStore.data.properties.length === 0) {
        dbStore.data.properties = initialData.properties as any;
      }
      if (mongoData.customers && mongoData.customers.length > 0) dbStore.data.customers = mongoData.customers as any;
      if (mongoData.leads && mongoData.leads.length > 0) dbStore.data.leads = mongoData.leads as any;
      if (mongoData.agreements && mongoData.agreements.length > 0) dbStore.data.agreements = mongoData.agreements as any;
      if (mongoData.bookings && mongoData.bookings.length > 0) dbStore.data.bookings = mongoData.bookings as any;
      if (mongoData.invoices && mongoData.invoices.length > 0) dbStore.data.invoices = mongoData.invoices as any;
      if (mongoData.site_visits && mongoData.site_visits.length > 0) dbStore.data.site_visits = mongoData.site_visits as any;
      if (mongoData.matching_requests && mongoData.matching_requests.length > 0) (dbStore.data as any).matching_requests = mongoData.matching_requests as any;
      if (mongoData.developers && mongoData.developers.length > 0) (dbStore.data as any).developers = mongoData.developers as any;
      if (mongoData.rating_invites && mongoData.rating_invites.length > 0) {
        const currentInvites: any[] = (dbStore.data as any).rating_invites || [];
        const inviteMap = new Map<string, any>();
        mongoData.rating_invites.forEach((mItem: any) => {
          const k = String(mItem.id || mItem._id);
          if (k) inviteMap.set(k, mItem);
        });
        currentInvites.forEach((cItem: any) => {
          const k = String(cItem.id || cItem._id);
          if (k) {
            inviteMap.set(k, { ...(inviteMap.get(k) || {}), ...cItem });
          }
        });
        (dbStore.data as any).rating_invites = Array.from(inviteMap.values());
      }
    }
  }).catch(() => {});
}

export function saveData() {
  dbStore.save();
  syncToMongoDB(dbStore.data).catch(() => {});
}

export function generateID(type: 'SRM-CUS' | 'SRM-PROP' | 'SRM-UNIT' | 'SRM-LEAD' | 'SRM-REC' | 'SRM-SV' | 'SRM-BKG' | 'SRM-BRK' | 'SRM-AGR' | 'SRM-INV' | 'SRM-REQ' | 'SRM-FLP'): string {
  loadData();
  const year = 2026;
  let nextSeq = 1;

  if (type === 'SRM-CUS') {
    dbStore.data.sequences.customer_seq += 1;
    nextSeq = dbStore.data.sequences.customer_seq;
    saveData();
    return `SRM-CUS-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-PROP') {
    dbStore.data.sequences.property_seq += 1;
    nextSeq = dbStore.data.sequences.property_seq;
    saveData();
    return `SRM-PROP-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-UNIT') {
    dbStore.data.sequences.unit_seq += 1;
    nextSeq = dbStore.data.sequences.unit_seq;
    saveData();
    return `SRM-UNIT-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-LEAD') {
    dbStore.data.sequences.lead_seq += 1;
    nextSeq = dbStore.data.sequences.lead_seq;
    saveData();
    return `SRM-LEAD-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-FLP') {
    return `SRM-FLP-${year}-${String(Date.now()).slice(-6)}`;
  } else if (type === 'SRM-REC') {
    dbStore.data.sequences.recommendation_seq += 1;
    nextSeq = dbStore.data.sequences.recommendation_seq;
    saveData();
    return `SRM-REC-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-SV') {
    dbStore.data.sequences.site_visit_seq += 1;
    nextSeq = dbStore.data.sequences.site_visit_seq;
    saveData();
    return `SRM-SV-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-BKG') {
    dbStore.data.sequences.booking_seq += 1;
    nextSeq = dbStore.data.sequences.booking_seq;
    saveData();
    return `SRM-BKG-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-BRK') {
    dbStore.data.sequences.brokerage_seq += 1;
    nextSeq = dbStore.data.sequences.brokerage_seq;
    saveData();
    return `SRM-BRK-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-AGR') {
    dbStore.data.sequences.agreement_seq += 1;
    nextSeq = dbStore.data.sequences.agreement_seq;
    saveData();
    return `SRM-AGR-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else if (type === 'SRM-INV') {
    dbStore.data.sequences.invoice_seq += 1;
    nextSeq = dbStore.data.sequences.invoice_seq;
    saveData();
    return `SRM-INV-${year}-${String(nextSeq).padStart(6, '0')}`;
  } else {
    dbStore.data.sequences.approval_seq += 1;
    nextSeq = dbStore.data.sequences.approval_seq;
    saveData();
    return `SRM-REQ-${year}-${String(nextSeq).padStart(6, '0')}`;
  }
}

export function logAudit(userId: string | null, action: string, resource: string, details: string, ip: string = '127.0.0.1') {
  loadData();
  dbStore.data.audit_logs.unshift({
    id: String(Date.now()),
    user_id: userId || undefined,
    action,
    resource,
    details,
    ip_address: ip,
    timestamp: new Date().toISOString()
  });
  saveData();
}
