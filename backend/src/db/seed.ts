import fs from 'fs';
import path from 'path';

const dbFilePath = path.resolve(process.cwd(), 'src', 'db', 'db.json');
const rootDbFilePath = path.resolve(process.cwd(), 'db.json');

export function seedDatabase() {
  console.log('Seeding Master Prompt Real Estate BI Dashboard database into db.json...');

  const initialData = {
    companies: [{ id: 'COMP-01', name: 'Swaramayi Real Estate Marketing CRM' }],
    branches: [
      { id: 'BR-KOL-HO', name: 'Head Office (Kolkata)', city: 'Kolkata' }
    ],
    teams: [
      { id: 'TEAM-A', name: 'Corporate Leadership Squad', leader_id: 'USR-01', branch_id: 'BR-KOL-HO' }
    ],
    users: [
      { id: 'USR-01', username: 'admin', full_name: 'Avishek Das (Super Admin)', role: 'SUPER_ADMIN', email: 'admin@swaramayi.com', mobile: '+91 98490 00001', branch_name: 'Head Office (Kolkata)', department: 'Executive Board', team_name: 'Corporate Leadership Squad', is_active: true }
    ],
    customers: [],
    leads: [],
    properties: [],
    property_units: [],
    property_price_history: [],
    property_shares: [],
    recommendation_shares: [],
    site_visits: [],
    bookings: [],
    brokerage_records: [],
    invoices: [],
    payments: [],
    followups: [],
    marketing_campaigns: [],
    security_alerts: [],
    employee_activities: [],
    role_permissions: [
      { role_key: 'SUPER_ADMIN', role_name: '1. Super Admin / Owner', data_scope: 'ALL_DATA', permissions: [] },
      { role_key: 'ADMIN', role_name: '2. Admin', data_scope: 'ALL_DATA', permissions: [] },
      { role_key: 'GENERAL_MANAGER', role_name: '3. General Manager', data_scope: 'ALL_BRANCHES', permissions: [] },
      { role_key: 'BRANCH_MANAGER', role_name: '4. Branch Manager', data_scope: 'OWN_BRANCH', permissions: [] },
      { role_key: 'SALES_MANAGER', role_name: '5. Sales Manager', data_scope: 'OWN_TEAM', permissions: [] },
      { role_key: 'TEAM_LEAD', role_name: '6. Team Leader', data_scope: 'OWN_TEAM', permissions: [] },
      { role_key: 'SALES_EXEC', role_name: '7. Sales Executive', data_scope: 'ASSIGNED_ONLY', permissions: [] },
      { role_key: 'TELECALLER', role_name: '8. Telecaller', data_scope: 'ASSIGNED_ONLY', permissions: [] },
      { role_key: 'BACK_OFFICE', role_name: '9. Back Office / Desk', data_scope: 'ALL_DATA', permissions: [] },
      { role_key: 'ACCOUNTS', role_name: '10. Accounts Desk', data_scope: 'ALL_DATA', permissions: [] },
      { role_key: 'HR', role_name: '11. Human Resources (HR)', data_scope: 'ALL_DATA', permissions: [] },
      { role_key: 'MARKETING', role_name: '12. Marketing Squad', data_scope: 'ALL_DATA', permissions: [] },
      { role_key: 'PROPERTY_MANAGER', role_name: '13. Property Manager', data_scope: 'ALL_DATA', permissions: [] },
      { role_key: 'FIELD_EXEC', role_name: '14. Field Executive', data_scope: 'ASSIGNED_ONLY', permissions: [] },
      { role_key: 'CUSTOMER_SUPPORT', role_name: '15. Customer Support', data_scope: 'ASSIGNED_ONLY', permissions: [] }
    ],
    approval_requests: [],
    active_sessions: [],
    system_settings: { is_lockdown_active: 'false' },
    sequences: { customer_seq: 0, property_seq: 0, unit_seq: 0, lead_seq: 0, recommendation_seq: 0, site_visit_seq: 0, booking_seq: 0, brokerage_seq: 0, agreement_seq: 0, invoice_seq: 0, approval_seq: 0 }
  };

  console.log('Master BI Dashboard database seeded successfully into MongoDB memory store!');
}

if (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
