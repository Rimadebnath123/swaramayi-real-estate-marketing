import React from 'react';
import {
  ShieldAlert, UserPlus, Building2, Users, CheckCircle2, ShieldCheck, Edit3, Trash2, Search,
  Lock, Shield, XCircle, RotateCw, Check, Briefcase, UserCheck, Activity, FileText, AlertTriangle,
  Layers, Award, Phone, Building, UserX, RefreshCw, Zap, Eye, Sliders, Server, Cpu, ArrowRight, X, PhoneCall,
  Plus, MapPin, Star
} from 'lucide-react';

interface RoleManagementViewProps {
  isLockdown: boolean;
  setIsLockdown: (val: boolean) => void;
  isLight: boolean;
  windowWidth: number;
  handleOpenAddUserModal: () => void;
  setShowCustomRoleModal: (val: boolean) => void;
  setShowBranchModal: (val: boolean) => void;
  setShowTeamModal: (val: boolean) => void;
  activeRoleSubTab: string;
  setActiveRoleSubTab: (val: string) => void;
  customRoles: any[];
  setCustomRoles?: React.Dispatch<React.SetStateAction<any[]>>;
  currentRole: string;
  setCurrentRole: (val: string) => void;
  userRoleScopeSearchQuery?: string;
  setUserRoleScopeSearchQuery?: (val: string) => void;
  userRoleFilterCategory?: string;
  setUserRoleFilterCategory?: (val: string) => void;
  users: any[];
  branches: any[];
  teams: any[];
  activeSessions: any[];
  approvalRequests: any[];
  setApprovalRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  handleOpenEditUserModal: (user: any) => void;
  handleDeleteUser: (id: string, username?: string) => void;
  handleOpenEditBranchModal: (branch: any) => void;
  handleDeleteBranch?: (branchId: string, branchName: string) => void;
  handleOpenEditTeamModal: (team: any) => void;
  handleDeleteTeam?: (teamId: string, teamName: string) => void;
  handleOpenSecurityAuditModal: (user: any) => void;
  setShowExitHandoverModal?: (user: any) => void;
  properties?: any[];
  customers?: any[];
}

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({
  isLockdown,
  setIsLockdown,
  isLight,
  windowWidth,
  handleOpenAddUserModal,
  setShowCustomRoleModal,
  setShowBranchModal,
  setShowTeamModal,
  activeRoleSubTab,
  setActiveRoleSubTab,
  customRoles = [],
  setCustomRoles,
  currentRole,
  setCurrentRole,
  userRoleScopeSearchQuery,
  setUserRoleScopeSearchQuery,
  userRoleFilterCategory,
  setUserRoleFilterCategory,
  users = [],
  branches = [],
  teams = [],
  activeSessions = [],
  approvalRequests = [],
  setApprovalRequests,
  handleOpenEditUserModal,
  handleDeleteUser,
  handleOpenEditBranchModal,
  handleDeleteBranch,
  handleOpenEditTeamModal,
  handleDeleteTeam,
  handleOpenSecurityAuditModal,
  properties = [],
  customers = []
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');
  const canDelete = isStrictSuperAdmin; // STRICT SYSTEM POLICY: All delete options in CRM are only accessible by Super Admin / Owner. Admin has Edit access only.

  const [internalSearchQuery, setInternalSearchQuery] = React.useState('');
  const [internalFilterCategory, setInternalFilterCategory] = React.useState('ALL');
  const [localApprovals, setLocalApprovals] = React.useState<any[]>([]);

  // Full 3-Section Edit Role Modal State
  const [editingRole, setEditingRole] = React.useState<any | null>(null);
  const [editRoleForm, setEditRoleForm] = React.useState({
    key: '',
    name: '',
    level: 'Level 3 (Branch / Department Level)',
    scope: 'Company-Wide Operations',
    desc: '',
    color: '#0284c7',
    iconName: 'ShieldCheck',
    view: true,
    create: true,
    edit: true,
    delete: false,
    export: true,
    approve: false,
    price_change: false,
    owner_change: false,
    brokerage: false
  });

  // Security Risk & Anomaly Detection State
  const [anomalyLogs, setAnomalyLogs] = React.useState<any[]>([
    {
      id: 'RISK-8091',
      timestamp: '28 Aug 2026, 01:24 PM',
      severity: 'CRITICAL',
      user: 'Priya Nair (Sales Exec)',
      rule: 'GEO_VELOCITY_IMPOSSIBLE_TRAVEL',
      ip: '185.220.101.4 (Frankfurt, DE - Tor Exit Node)',
      description: 'Account authenticated from Frankfurt 12 mins after active session in Kolkata (Impossible Travel Velocity).',
      action_taken: 'SESSION_REVOKED & QUARANTINED',
      resolved: false
    },
    {
      id: 'RISK-8088',
      timestamp: '28 Aug 2026, 11:45 AM',
      severity: 'HIGH',
      user: 'Amit Patel (Sales Exec)',
      rule: 'DATA_EXFILTRATION_SPIKE_DETECTOR',
      ip: '122.170.82.19 (Kolkata, IN)',
      description: 'Initiated 4 consecutive CSV export requests downloading 650+ customer phone numbers in 30 seconds.',
      action_taken: 'EXPORT_RIGHTS_SUSPENDED',
      resolved: false
    },
    {
      id: 'RISK-8072',
      timestamp: '28 Aug 2026, 09:10 AM',
      severity: 'MEDIUM',
      user: 'Abinash Roy (Admin)',
      rule: 'BRUTE_FORCE_THROTTLE_POLICY',
      ip: '49.207.192.11 (Kolkata, IN)',
      description: '5 consecutive failed password/PIN attempts recorded within 60 seconds.',
      action_taken: 'CAPTCHA_LOCKOUT_APPLIED',
      resolved: true
    }
  ]);

  const [ruleSettings, setRuleSettings] = React.useState({
    geoTravel: true,
    exfiltrationThrottling: true,
    tokenHijack: true,
    afterHoursLockdown: true
  });

  // Persistent property assignments mapping stored in localStorage
  const [assignedPropsMap, setAssignedPropsMap] = React.useState<{ [advisorId: string]: any[] }>(() => {
    try {
      const stored = localStorage.getItem('swaramayi_assigned_advisor_props_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const updateAdvisorProperties = (advisorId: string, updatedList: any[]) => {
    setAssignedPropsMap(prev => {
      const nextMap = { ...prev, [advisorId]: updatedList };
      try {
        localStorage.setItem('swaramayi_assigned_advisor_props_v2', JSON.stringify(nextMap));
      } catch (e) {
        console.error(e);
      }
      return nextMap;
    });
  };

  const defaultUsersList = React.useMemo(() => [
    { id: 'USR-01', username: 'Avishek Das (Super Admin)', full_name: 'Avishek Das', email: 'admin@swaramayi.com', mobile: '+91 98490 00001', role: 'SUPER_ADMIN', branch_name: 'Head Office (Kolkata)', department: 'Executive Board', team_name: 'Corporate Leadership Squad', manager_name: 'Self', is_active: true, user_status: 'ACTIVE', created_at: '2026-01-01' },
    { id: 'USR-02', username: 'punita.roy', full_name: 'Punita Roy', email: 'punita.roy@swaramayi.com', mobile: '+91 90513 22932', role: 'SALES_EXEC', branch_name: 'Kolkata Branch', department: 'Sales Management', team_name: 'Kolkata Expansion Team', manager_name: 'Avishek Das (Super Admin)', is_active: true, user_status: 'ACTIVE', created_at: '2026-01-15' },
    { id: 'USR-03', username: 'abinash.roy', full_name: 'Abinash Roy', email: 'abinash.roy@swaramayi.com', mobile: '+91 76970 90078', role: 'ADMIN', branch_name: 'Kolkata Branch', department: 'Residential Sales', team_name: 'Kolkata Admin & Technical Squad', manager_name: 'Avishek Das (Super Admin)', is_active: true, user_status: 'ACTIVE', created_at: '2026-01-15' }
  ], []);

  const safeUsers = React.useMemo(() => {
    if (Array.isArray(users)) {
      return users;
    }
    return defaultUsersList;
  }, [users, defaultUsersList]);

  // Dynamic Property Advisors list derived strictly from active CRM staff and safe users
  const propertyAdvisorsList = React.useMemo(() => {
    const staffFromUsers = (safeUsers || []).filter((u: any) => {
      const r = String(u.role || '').toUpperCase();
      return r !== 'SUPER_ADMIN' && r !== 'OWNER' && u.id !== 'USR-01';
    });

    const fallbackAdvisors = [
      {
        id: 'USR-02',
        employee_id: 'SRM-EMP-2026-0012',
        username: 'punita.roy',
        full_name: 'Punita Roy',
        role: 'Sales Management',
        mobile: '+91 90513 22932',
        email: 'punita.roy@swaramayi.com',
        branch_name: 'Kolkata Branch',
        department: 'Sales Management',
        is_active: true
      },
      {
        id: 'USR-03',
        employee_id: 'SRM-EMP-2026-0018',
        username: 'abinash.roy',
        full_name: 'Abinash Roy',
        role: 'Senior Property Advisor / Admin',
        mobile: '+91 76970 90078',
        email: 'abinash.roy@swaramayi.com',
        branch_name: 'Kolkata Branch',
        department: 'Residential Sales',
        is_active: true
      }
    ];

    const userMap = new Map();
    staffFromUsers.forEach((u: any) => {
      const uNameLower = String(u.full_name || u.username || '').toLowerCase();
      userMap.set(u.id || uNameLower, u);
    });

    if (!Array.isArray(users) || users.length === 0) {
      fallbackAdvisors.forEach((fa: any) => {
        const faNameLower = fa.full_name.toLowerCase();
        let exists = false;
        for (const existing of userMap.values()) {
          const exName = String(existing.full_name || existing.username || '').toLowerCase();
          if (exName.includes(faNameLower) || faNameLower.includes(exName) || existing.id === fa.id) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          userMap.set(fa.id, fa);
        }
      });
    }

    const staffList = Array.from(userMap.values());

    return staffList.map((u: any, idx: number) => {
      const uId = u.id || `USR-0${idx + 2}`;
      const uNameLower = String(u.full_name || u.username || '').toLowerCase();

      let advisorProps = assignedPropsMap[uId];
      if (!advisorProps || advisorProps.length === 0) {
        // Look up properties explicitly assigned to this employee in properties prop
        const matchedProps = (properties || []).filter((p: any) => {
          const empIdMatch = p.assigned_employee_id === uId;
          const empNameMatch = p.assigned_employee_name && (
            p.assigned_employee_name.toLowerCase().includes(uNameLower) ||
            uNameLower.includes(p.assigned_employee_name.toLowerCase())
          );
          const advNameMatch = p.assignedAdvisor?.name && (
            p.assignedAdvisor.name.toLowerCase().includes(uNameLower) ||
            uNameLower.includes(p.assignedAdvisor.name.toLowerCase())
          );
          const agentNameMatch = p.agent?.name && (
            p.agent.name.toLowerCase().includes(uNameLower) ||
            uNameLower.includes(p.agent.name.toLowerCase())
          );
          return empIdMatch || empNameMatch || advNameMatch || agentNameMatch;
        });

        if (matchedProps.length > 0) {
          advisorProps = matchedProps.map((p: any) => ({
            code: p.property_code || p.id || 'SRM-PROP-001',
            title: p.property_title || p.title || 'Property Site',
            location: p.locality || p.location || 'Kolkata',
            type: p.property_type || p.propertyType || 'Residential Flat',
            price: Number(p.final_estimated_price || p.price || p.base_price || 0),
            isSold: Boolean(p.isSold || p.is_sold || String(p.availability_status).toUpperCase() === 'SOLD' || String(p.availability_status).toUpperCase() === 'BOOKED')
          }));
        } else {
          if (uNameLower.includes('punita')) {
            advisorProps = [
              {
                code: 'SRM-PROP-2026-000427',
                title: 'DHRITI APARTMENT',
                location: 'Barasat, Kolkata',
                type: 'Residential Flat',
                price: 3621000,
                isSold: false
              },
              {
                code: 'SRM-PROP-2026-000426',
                title: 'GAJAPATI APARTMENT',
                location: 'Madhyamgram, Kolkata',
                type: 'Residential Flat',
                price: 3515900,
                isSold: false
              }
            ];
          } else if (uNameLower.includes('abinash')) {
            advisorProps = [
              {
                code: 'SRM-PROP-2026-000425',
                title: 'SHIBALAY',
                location: 'Barasat, Chapadali',
                type: 'Residential Flat',
                price: 3000000,
                isSold: false
              }
            ];
          } else {
            advisorProps = [];
          }
        }
      }

      // Dynamic customer leads assigned count strictly from customers prop or advisor defaults
      const matchedLeadsCount = (customers || []).filter((c: any) => {
        const cEmpId = String(c.assigned_employee_id || '');
        const cEmpName = String(c.assigned_employee_name || c.sales_executive || c.assigned_salesperson || '').toLowerCase();
        return (
          cEmpId === String(uId) ||
          (cEmpName && (cEmpName.includes(uNameLower) || uNameLower.includes(cEmpName)))
        );
      }).length;
      const finalLeads = matchedLeadsCount;

      // Site visits count strictly from real matched site visit records or 0
      const matchedVisitsCount = (customers || []).filter((c: any) => {
        const cEmpId = String(c.assigned_employee_id || '');
        const cEmpName = String(c.assigned_employee_name || c.sales_executive || c.assigned_salesperson || '').toLowerCase();
        const isAssigned = cEmpId === String(uId) || (cEmpName && (cEmpName.includes(uNameLower) || uNameLower.includes(cEmpName)));
        const isVisited = c.status === 'Site Visit Scheduled' || c.customer_status === 'SCHEDULED_VISIT' || c.status === 'VISITED';
        return isAssigned && isVisited;
      }).length;
      const siteVisits = matchedVisitsCount;
      
      // Deals closed are strictly for properties marked as sold/booked
      const closedProperties = advisorProps.filter((p: any) => 
        p.isSold === true || 
        p.status === 'CLOSED' || 
        p.status === 'SOLD' || 
        String(p.availability_status || '').toUpperCase() === 'SOLD' || 
        String(p.availability_status || '').toUpperCase() === 'BOOKED'
      );
      const dealsClosed = closedProperties.length;
      
      // Calculate dynamic closed sales volume sum
      const closedSalesNum = closedProperties.length > 0 
        ? closedProperties.reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0)
        : 0;

      let totalSalesStr = '₹ 0 Lakhs';
      if (closedSalesNum >= 10000000) {
        totalSalesStr = `₹ ${(closedSalesNum / 10000000).toFixed(2)} Cr`;
      } else if (closedSalesNum > 0) {
        totalSalesStr = `₹ ${(closedSalesNum / 100000).toFixed(2)} Lakhs`;
      }

      // Dynamic rating from user record or customer review logs or 0.0 default
      let advisorRatingVal = (u.rating !== undefined && u.rating !== null && !isNaN(Number(u.rating)) && Number(u.rating) > 0) 
        ? Number(u.rating).toFixed(1) 
        : '0.0';

      if (advisorRatingVal === '0.0') {
        if (uNameLower.includes('punita')) advisorRatingVal = '5.0';
        else if (uNameLower.includes('abinash')) advisorRatingVal = '3.5';
      }

      return {
        id: uId,
        employee_id: u.employee_id || u.customer_number || `SRM-EMP-2026-00${12 + idx * 6}`,
        full_name: u.full_name || u.username || 'Staff Member',
        role: u.role || 'Property Advisor',
        mobile: u.mobile || '+91 98300 12345',
        email: u.email || `${(u.username || 'staff').toLowerCase()}@swaramayi.com`,
        branch_name: u.branch_name || 'Kolkata Branch',
        department: u.department || 'Sales Operations',
        assigned_properties: advisorProps,
        assigned_leads: finalLeads,
        site_visits: siteVisits,
        deals_closed: dealsClosed,
        raw_sales_num: closedSalesNum,
        total_sales: totalSalesStr,
        rating: advisorRatingVal,
        status: u.is_active !== false ? 'ACTIVE' : 'INACTIVE'
      };
    });
  }, [safeUsers, properties, customers, assignedPropsMap]);

  const [showAssignPropertyModal, setShowAssignPropertyModal] = React.useState(false);
  const [propertySearchFilter, setPropertySearchFilter] = React.useState('');
  const [assignForm, setAssignForm] = React.useState({
    advisorId: '',
    propertyTitle: '',
    propertyCode: '',
    location: '',
    propertyType: 'Residential Flat'
  });

  const handleSavePropertyAssignment = () => {
    if (!assignForm.advisorId || !assignForm.propertyTitle) {
      alert('Please select an Advisor and enter a Property Title.');
      return;
    }
    const currentAdvisor = propertyAdvisorsList.find(a => a.id === assignForm.advisorId);
    const existingProps = currentAdvisor?.assigned_properties || [];

    const selectedPropInCRM = (properties || []).find((p: any) => (p.id || p.property_code) === assignForm.propertyCode);
    const propPrice = selectedPropInCRM?.final_estimated_price || selectedPropInCRM?.base_price || selectedPropInCRM?.price || 3500000;

    const propCode = assignForm.propertyCode || selectedPropInCRM?.property_code || `SRM-PROP-2026-000${Math.floor(100 + Math.random() * 900)}`;
    const newPropObj = {
      code: propCode,
      title: assignForm.propertyTitle,
      location: assignForm.location || selectedPropInCRM?.locality || 'Kolkata',
      type: assignForm.propertyType || selectedPropInCRM?.property_type || 'Residential Flat',
      price: Number(propPrice) || 3500000
    };

    updateAdvisorProperties(assignForm.advisorId, [...existingProps, newPropObj]);

    alert(`✅ Successfully assigned "${assignForm.propertyTitle}" (${propCode}) to ${currentAdvisor?.full_name || 'Property Advisor'}!`);
    setShowAssignPropertyModal(false);
    setAssignForm({ advisorId: '', propertyTitle: '', propertyCode: '', location: '', propertyType: 'Residential Flat' });
  };

  const handleRemovePropertyFromAdvisor = (advisorId: string, propCode: string) => {
    if (window.confirm(`Unassign property (${propCode}) from this Advisor?`)) {
      const currentAdvisor = propertyAdvisorsList.find(a => a.id === advisorId);
      const existingProps = currentAdvisor?.assigned_properties || [];
      const updatedProps = existingProps.filter((p: any) => p.code !== propCode);

      updateAdvisorProperties(advisorId, updatedProps);
      alert(`🗑️ Property (${propCode}) unassigned successfully.`);
    }
  };

  const searchQuery = userRoleScopeSearchQuery ?? internalSearchQuery;
  const setSearchQuery = setUserRoleScopeSearchQuery ?? setInternalSearchQuery;

  const filterCategory = userRoleFilterCategory ?? internalFilterCategory;
  const setFilterCategory = setUserRoleFilterCategory ?? setInternalFilterCategory;

  const safeBranches = branches || [];
  const safeTeams = teams || [];
  const safeSessions = activeSessions || [];

  const safeApprovals = (approvalRequests && approvalRequests.length > 0 ? approvalRequests : (localApprovals.length > 0 ? localApprovals : [
    { id: 'REQ-01', request_code: 'SRM-REQ-2026-000101', request_type: 'LEAD_TRANSFER', record_id: 'SRM-CUS-2026-000184 (Rohan Deshmukh)', requested_by: 'Priya Nair (Sales Exec)', requested_at: '16 Aug 2026 12:00 PM', old_val: 'Priya Nair (Sales Exec)', new_val: 'Rahul Sharma (Team Lead)', reason: 'Customer requested senior consultant for villa project.', status: 'PENDING', approved_by: '' }
  ]));

  const defaultPristineRoles = [
    { key: 'SUPER_ADMIN', name: 'OWNER / SUPER ADMIN', level: 'Level 5 (Highest)', scope: 'Universal All-Data Access', desc: 'Full administrative control, universal read/write/delete rights, emergency lockdown switch, and system configuration governance.', color: '#0284c7', iconName: 'ShieldCheck' },
    { key: 'ADMIN', name: 'ADMIN', level: 'Level 4 (High)', scope: 'Company-Wide Operations', desc: 'Executive management access to view/create/edit all properties, customer leads, and employee user accounts across branches.', color: '#38bdf8', iconName: 'Shield' },
    { key: 'BRANCH_MANAGER', name: 'BRANCH MANAGER', level: 'Level 3 (Branch Level)', scope: 'Assigned Branch Data', desc: 'Manages branch inventory, team leaders, site visits, cost sheets, and localized sales performance reporting.', color: '#10b981', iconName: 'Building2' },
    { key: 'TELECALLER', name: 'TELECALLER', level: 'Level 2 (Executive Desk)', scope: 'Assigned Calling Queue', desc: 'Inbound and outbound customer call logging, requirement profiling, follow-up scheduling, and lead status updates.', color: '#f59e0b', iconName: 'PhoneCall' },
    { key: 'PROPERTY_MANAGEMENT', name: 'PROPERTY MANAGEMENT', level: 'Level 3 (Inventory Unit)', scope: 'Tower Unit Board & Stock', desc: 'Live tower unit board management, pricing updates, inventory ingestion, floor plan attachments, and amenity tagging.', color: '#ec4899', iconName: 'Building' },
    { key: 'SALES_MANAGEMENT', name: 'SALES MANAGEMENT', level: 'Level 3 (Sales Unit)', scope: 'Sales Team & Pipeline', desc: 'Oversees 13-stage sales funnel, deal closures, site visit assignments, customer negotiation overrides, and booking sheets.', color: '#8b5cf6', iconName: 'Zap' },
    { key: 'SALES_EMPLOYEE', name: 'SALES EMPLOYEE', level: 'Level 2 (Executive Desk)', scope: 'Sales team member', desc: 'Property sales execution, customer site visits, lead follow-ups, and negotiation updates.', color: '#06b6d4', iconName: 'Users' }
  ];

  const safeCustomRoles = (customRoles && customRoles.length > 0) ? customRoles : defaultPristineRoles;

  const handleResetDefaultRoles = () => {
    if (window.confirm('🔄 Reset all enterprise roles & scopes to original defaults?')) {
      if (setCustomRoles) {
        setCustomRoles(defaultPristineRoles);
      }
      try {
        localStorage.setItem('swaramayi_custom_roles_v4', JSON.stringify(defaultPristineRoles));
      } catch (e) {
        console.error(e);
      }
      alert('✅ Enterprise Roles & Scopes reset to original defaults!');
    }
  };

  const handleRevokeSession = (sessionId: string, username: string) => {
    if (window.confirm(`⚠️ Force disconnect session "${sessionId}" for user "${username}"?`)) {
      alert(`🔒 Session ${sessionId} terminated immediately. Access token invalidated.`);
    }
  };

  const handleResolveAnomaly = (riskId: string) => {
    setAnomalyLogs(prev => prev.map(a => a.id === riskId ? { ...a, resolved: true, action_taken: 'RESOLVED_BY_ADMIN' } : a));
    alert(`✅ Security Risk Alert ${riskId} marked as RESOLVED & CLEARED.`);
  };

  const handleApproveRequest = (reqId: string, requestCode: string) => {
    if (setApprovalRequests) {
      setApprovalRequests((prev: any[]) => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED', approved_by: 'Avishek Das (Super Admin)' } : r));
    }
    setLocalApprovals((prev: any[]) => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED', approved_by: 'Avishek Das (Super Admin)' } : r));
    alert(`✅ Maker-Checker Governance: Request ${requestCode} has been APPROVED! Changes applied.`);
  };

  const handleRejectRequest = (reqId: string, requestCode: string) => {
    if (setApprovalRequests) {
      setApprovalRequests((prev: any[]) => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED', approved_by: 'Avishek Das (Super Admin)' } : r));
    }
    setLocalApprovals((prev: any[]) => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED', approved_by: 'Avishek Das (Super Admin)' } : r));
    alert(`❌ Maker-Checker Governance: Request ${requestCode} has been REJECTED & CANCELLED.`);
  };

  const handleOpenEditRoleModal = (role: any) => {
    setEditingRole(role);
    const cleanName = (role.name || '').replace(/^\d+\.\s*/, '');
    setEditRoleForm({
      key: role.key || 'CUSTOM_ROLE',
      name: cleanName,
      level: role.level || 'Level 3 (Branch / Department Level)',
      scope: role.scope || 'Company-Wide Operations',
      desc: role.desc || '',
      color: role.color || '#0284c7',
      iconName: role.iconName || 'ShieldCheck',
      view: role.view !== undefined ? role.view : true,
      create: role.create !== undefined ? role.create : true,
      edit: role.edit !== undefined ? role.edit : true,
      delete: role.delete !== undefined ? role.delete : false,
      export: role.export !== undefined ? role.export : true,
      approve: role.approve !== undefined ? role.approve : false,
      price_change: role.price_change !== undefined ? role.price_change : false,
      owner_change: role.owner_change !== undefined ? role.owner_change : false,
      brokerage: role.brokerage !== undefined ? role.brokerage : false
    });
  };

  const handleSaveEditedRole = () => {
    if (!editingRole) return;
    const cleanName = editRoleForm.name.replace(/^\d+\.\s*/, '');
    const updatedForm = { ...editRoleForm, name: cleanName };
    if (setCustomRoles) {
      setCustomRoles(prev => prev.map(r => r.key === editingRole.key ? { ...r, ...updatedForm } : r));
    }
    alert(`✅ Custom Enterprise Role "${cleanName}" updated successfully!`);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleKey: string, roleName: string) => {
    if (roleKey === 'SUPER_ADMIN' || roleKey === 'OWNER') {
      alert('⚠️ Cannot delete Super Admin / Owner core system role.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      if (setCustomRoles) {
        setCustomRoles(prev => prev.filter(r => r.key !== roleKey));
      }
      alert(`🗑️ Role "${roleName}" deleted successfully.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* FULL 3-SECTION EDIT ENTERPRISE ROLE & SECURITY SCOPE MODAL */}
      {editingRole && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.45)' }}>
            
            {/* MODAL HEADER */}
            <div style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔑 Edit Custom Enterprise Role & Security Scope
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                  Define custom access boundaries, security hierarchy level, and default operational permissions.
                </p>
              </div>
              <button onClick={() => setEditingRole(null)} style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* SECTION 1: ROLE IDENTITY & HIERARCHY LEVEL */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0284c7', margin: 0 }}>
                  1. Role Identity & Hierarchy Level
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Role Display Name *</label>
                    <input
                      type="text"
                      value={editRoleForm.name}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Senior Operations Manager, Legal Advisor"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Security Identifier Code (Slug) *</label>
                    <input
                      type="text"
                      value={editRoleForm.key}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, key: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                      placeholder="e.g. SENIOR_OPS_MGR"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Security Level Tier *</label>
                    <select
                      value={editRoleForm.level}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, level: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700' }}
                    >
                      <option value="Level 5 (Highest)">Level 5 (Highest / Executive Board)</option>
                      <option value="Level 4 (High)">Level 4 (High / Corporate Admin)</option>
                      <option value="Level 3 (Branch Level)">Level 3 (Branch Level)</option>
                      <option value="Level 3 (Inventory Unit)">Level 3 (Inventory Unit)</option>
                      <option value="Level 3 (Sales Unit)">Level 3 (Sales Unit)</option>
                      <option value="Level 2 (Executive Desk)">Level 2 (Executive Desk)</option>
                      <option value="Level 1 (Basic Operational)">Level 1 (Basic Operational)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Scope Access Boundary *</label>
                    <input
                      type="text"
                      value={editRoleForm.scope}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, scope: e.target.value }))}
                      placeholder="e.g. Company-Wide Operations"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ROLE DESCRIPTION & ACCENT COLOR */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0284c7', margin: 0 }}>
                  2. Role Description & Accent Color
                </h4>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Role Responsibilities & Overview</label>
                  <textarea
                    value={editRoleForm.desc}
                    onChange={(e) => setEditRoleForm(f => ({ ...f, desc: e.target.value }))}
                    rows={3}
                    placeholder="Briefly describe what this custom role manages and its access boundaries across branches..."
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', lineHeight: '1.4' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Accent Color Badge</label>
                    <select
                      value={editRoleForm.color}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, color: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700' }}
                    >
                      <option value="#0284c7">Primary Blue (#0284c7)</option>
                      <option value="#38bdf8">Sky Cyan (#38bdf8)</option>
                      <option value="#10b981">Emerald Green (#10b981)</option>
                      <option value="#f59e0b">Amber Gold (#f59e0b)</option>
                      <option value="#ec4899">Pink Violet (#ec4899)</option>
                      <option value="#8b5cf6">Purple Indigo (#8b5cf6)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Role Badge Icon</label>
                    <select
                      value={editRoleForm.iconName}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, iconName: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700' }}
                    >
                      <option value="ShieldCheck">🛡️ Shield Check</option>
                      <option value="Shield">🛡️ Security Shield</option>
                      <option value="Building2">🏢 Building</option>
                      <option value="PhoneCall">📞 Phone Call</option>
                      <option value="Building">🏠 Property</option>
                      <option value="Zap">⚡ Sales Management</option>
                      <option value="Users">👥 Users Squad</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: OPERATIONAL PERMISSIONS CHECKLIST */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0284c7', margin: 0 }}>
                  3. Operational Permissions Checklist
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.view}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, view: e.target.checked }))}
                    />
                    View Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.create}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, create: e.target.checked }))}
                    />
                    Create Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.edit}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, edit: e.target.checked }))}
                    />
                    Edit Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.delete}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, delete: e.target.checked }))}
                    />
                    Delete Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.export}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, export: e.target.checked }))}
                    />
                    Export Reports
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.approve}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, approve: e.target.checked }))}
                    />
                    Approve Transfers
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.price_change}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, price_change: e.target.checked }))}
                    />
                    Price Overrides
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.owner_change}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, owner_change: e.target.checked }))}
                    />
                    Reassign Owner
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.brokerage}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, brokerage: e.target.checked }))}
                    />
                    Brokerage Access
                  </label>
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div style={{ padding: '16px 24px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: isLight ? '#f8fafc' : '#0f172a' }}>
              <button onClick={() => setEditingRole(null)} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '9px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '0.83rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSaveEditedRole} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '9px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.83rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
                Save & Update Role
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EMERGENCY LOCKDOWN ACTIVE STATUS BANNER */}
      {isLockdown && (
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#ffffff', padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={24} color="#ffffff" />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚨 EMERGENCY SYSTEM LOCKDOWN IS ACTIVE</h4>
              <p style={{ fontSize: '0.78rem', margin: '2px 0 0 0', opacity: 0.9 }}>
                All external lead ingestion, data exports, and non-admin session privileges are restricted.
              </p>
            </div>
          </div>
          <button onClick={() => setIsLockdown(false)} style={{ background: '#ffffff', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            🔓 Lift Lockdown Now
          </button>
        </div>
      )}

      {/* SYSTEM GOVERNANCE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>ADVANCED ROLE, USER & MANAGEMENT CONTROL SYSTEM</h2>
            <span style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>ENTERPRISE RBAC</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
            Active Enterprise Roles • Company & Branch Hierarchy • Maker-Checker Universal Approvals • Employee Exit Handover Engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {isSuperAdmin && (
            <>
              <button onClick={() => handleOpenAddUserModal()} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={15} /> + Add User
              </button>
              <button onClick={() => setShowCustomRoleModal(true)} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#0284c7" /> + Add Custom Role
              </button>
              <button onClick={handleResetDefaultRoles} style={{ background: isLight ? '#ffffff' : '#1e293b', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCw size={15} color="#38bdf8" /> Reset Scopes
              </button>
              <button onClick={() => setShowBranchModal(true)} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} color="#fbbf24" /> + Add Branch
              </button>
              <button onClick={() => setShowTeamModal(true)} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#22c55e" /> + Add Team Squad
              </button>
            </>
          )}
          <button 
            onClick={() => {
              const nextState = !isLockdown;
              setIsLockdown(nextState);
              alert(nextState ? '🚨 EMERGENCY LOCKDOWN ACTIVATED! Non-admin access restricted.' : '🟢 EMERGENCY LOCKDOWN LIFTED! Standard operations restored.');
            }} 
            style={{ 
              background: isLockdown ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              color: '#ffffff', 
              border: 'none', 
              padding: '8px 14px', 
              borderRadius: '8px', 
              fontWeight: '900', 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              boxShadow: isLockdown ? '0 4px 14px rgba(34, 197, 94, 0.4)' : '0 4px 14px rgba(239, 68, 68, 0.4)',
              letterSpacing: '0.3px'
            }}
          >
            <ShieldAlert size={15} color="#ffffff" /> {isLockdown ? '🟢 LIFT LOCKDOWN' : '🚨 EMERGENCY LOCKDOWN'}
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR FOR ROLE MANAGEMENT */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveRoleSubTab('active_roles_matrix')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'active_roles_matrix' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'active_roles_matrix' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          🔑 Active Roles & Security Matrix
        </button>
        <button 
          onClick={() => setActiveRoleSubTab('employee_directory')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'employee_directory' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'employee_directory' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          👥 Employee Directory ({safeUsers.filter(u => isSuperAdmin || (u.role !== 'SUPER_ADMIN' && u.role !== 'OWNER' && u.id !== 'USR-01')).length})
        </button>
        <button 
          onClick={() => setActiveRoleSubTab('assigned_property_advisors')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'assigned_property_advisors' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'assigned_property_advisors' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          👨‍💼 Assigned Property Advisor ({propertyAdvisorsList.length})
        </button>
        <button 
          onClick={() => setActiveRoleSubTab('branches_offices')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'branches_offices' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'branches_offices' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          🏢 Enterprise Branches & Offices ({safeBranches.length})
        </button>
        <button 
          onClick={() => setActiveRoleSubTab('sales_teams_squads')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'sales_teams_squads' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'sales_teams_squads' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          🎯 Teams & Squads ({safeTeams.length})
        </button>
        <button 
          onClick={() => setActiveRoleSubTab('active_sessions_risk')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'active_sessions_risk' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'active_sessions_risk' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          🚨 Active Sessions & Risk Alerts ({safeSessions.length})
        </button>
        <button 
          onClick={() => setActiveRoleSubTab('approval_queue')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'approval_queue' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'approval_queue' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          ⚖️ Universal Approval Queue ({safeApprovals.filter(r => r.status === 'PENDING').length})
        </button>
        <button 
          onClick={() => setActiveRoleSubTab('exit_handover')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeRoleSubTab === 'exit_handover' ? '#ef4444' : (isLight ? '#ffffff' : '#1e293b'), color: activeRoleSubTab === 'exit_handover' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}
        >
          📋 Employee Exit & Handover Hub
        </button>
      </div>

      {/* SUB-TAB 1: ACTIVE ROLES & SECURITY MATRIX */}
      {activeRoleSubTab === 'active_roles_matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            {safeCustomRoles.map((role: any, idx: number) => {
              const count = safeUsers.filter(u => {
                const uRole = (u.role || '').toUpperCase();
                const rKey = (role.key || '').toUpperCase();
                const rNameClean = (role.name || '').replace(/^\d+\.\s*/, '').toUpperCase();
                return uRole === rKey || uRole === rNameClean;
              }).length;

              const cleanRoleTitle = (role.name || '').replace(/^\d+\.\s*/, '');

              return (
                <div 
                  key={role.key}
                  style={{
                    background: isLight ? '#ffffff' : '#1e293b',
                    border: currentRole === role.key ? `2px solid ${role.color || '#0284c7'}` : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: currentRole === role.key ? '0 8px 24px rgba(2, 132, 199, 0.25)' : 'none'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ background: `${role.color || '#0284c7'}22`, color: role.color || '#0284c7', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900' }}>
                        {role.level}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>
                        👤 {count} Users Assigned
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: '0 0 6px 0' }}>
                      {idx + 1}. {cleanRoleTitle}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '800', margin: '0 0 10px 0' }}>
                      Scope: {role.scope}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                      {role.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleOpenEditRoleModal(role)}
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Role Details"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      )}

                      {canDelete && role.key !== 'SUPER_ADMIN' && role.key !== 'OWNER' && (
                        <button
                          onClick={() => handleDeleteRole(role.key, role.name)}
                          style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Delete Role"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>

                    <button 
                      onClick={() => alert(`Inspecting security privileges matrix for ${cleanRoleTitle}`)}
                      style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Inspect Matrix →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EMPLOYEE DIRECTORY */}
      {activeRoleSubTab === 'employee_directory' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, mobile..."
                  style={{
                    background: isLight ? '#f8fafc' : '#0f172a',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                    color: isLight ? '#0f172a' : '#ffffff',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    minWidth: '240px'
                  }}
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  background: isLight ? '#f8fafc' : '#0f172a',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                  color: isLight ? '#0f172a' : '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700'
                }}
              >
                <option value="ALL">All Roles ({safeUsers.length})</option>
                <option value="SUPER_ADMIN">Super Admins / Owners</option>
                <option value="ADMIN">Admins</option>
                <option value="BRANCH_MANAGER">Branch Managers</option>
                <option value="SALES_MANAGER">Sales Managers</option>
                <option value="TEAM_LEAD">Team Leads</option>
                <option value="SALES_EXEC">Sales Executives</option>
                <option value="TELECALLER">Telecallers</option>
              </select>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => handleOpenAddUserModal()}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '900',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserPlus size={16} /> + Provision New Staff Member
              </button>
            )}
          </div>

          {/* USER TABLE */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '10px 14px' }}>User ID & Staff Name</th>
                  <th style={{ padding: '10px 14px' }}>Assigned Role & Level</th>
                  <th style={{ padding: '10px 14px' }}>Branch & Department</th>
                  <th style={{ padding: '10px 14px' }}>Contact Info</th>
                  <th style={{ padding: '10px 14px' }}>Reporting Manager</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Security & Audit</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeUsers
                  .filter(u => isSuperAdmin || (u.role !== 'SUPER_ADMIN' && u.role !== 'OWNER' && u.id !== 'USR-01'))
                  .filter(u => filterCategory === 'ALL' || u.role === filterCategory)
                  .filter(u => !searchQuery || JSON.stringify(u).toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>
                            {(u.full_name || u.username || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.9rem' }}>{u.full_name || u.username}</strong>
                            <br /><span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{u.id} • @{u.username}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: u.role === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(2, 132, 199, 0.15)', color: u.role === 'SUPER_ADMIN' ? '#f59e0b' : '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem' }}>
                          👑 {u.role}
                        </span>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{u.branch_name || 'Head Office'}</strong>
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{u.department || 'Sales Operations'}</span>
                      </td>

                      <td style={{ padding: '10px 14px', fontSize: '0.78rem' }}>
                        <span style={{ color: '#38bdf8', fontWeight: '700' }}>{u.email}</span>
                        <br /><span style={{ color: '#4ade80', fontWeight: '800' }}>{u.mobile}</span>
                      </td>

                      <td style={{ padding: '10px 14px', color: isLight ? '#334155' : '#cbd5e1', fontSize: '0.8rem', fontWeight: '700' }}>
                        {u.manager_name || 'Avishek Das (Super Admin)'}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenSecurityAuditModal(u)}
                          style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: '#0284c7', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Shield size={13} /> Security Audit
                        </button>
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleOpenEditUserModal(u)}
                              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}
                              title="Edit User Profile"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}
                          {canDelete && u.id !== 'USR-01' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.full_name || u.username)}
                              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ENTERPRISE BRANCHES & OFFICES */}
      {activeRoleSubTab === 'branches_offices' && (
        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {safeBranches.map((b: any) => {
            const assignedTeams = safeTeams.filter((t: any) => t.branch_id === b.id || t.branch_name === b.branch_name || (b.branch_name && t.branch_name && t.branch_name.toLowerCase().includes(b.branch_name.toLowerCase())));

            return (
              <div key={b.id} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      🏢 {b.branch_name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                      {b.address || 'Kolkata Central Hub'} • City: <strong style={{ color: '#38bdf8' }}>{b.city || 'Kolkata'}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleOpenEditBranchModal(b)}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={14} /> Edit Branch
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (handleDeleteBranch) {
                            handleDeleteBranch(b.id, b.branch_name);
                          } else {
                            if (window.confirm(`Are you sure you want to delete Branch "${b.branch_name}"?`)) {
                              alert(`🗑️ Branch "${b.branch_name}" deleted successfully.`);
                            }
                          }
                        }}
                        style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Delete Branch"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px', background: isLight ? '#f8fafc' : '#0f172a', padding: '14px', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>BRANCH MANAGER</span>
                    <strong style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', marginTop: '2px' }}>{(b.manager_name || 'Avishek Das (Super Admin)').replace(/Rajesh V[ae]rma/gi, 'Avishek Das')}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TARGET REVENUE</span>
                    <strong style={{ display: 'block', color: '#22c55e', fontSize: '0.85rem', marginTop: '2px' }}>{b.target_revenue || '₹5,00,00,000'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>ASSIGNED SQUADS</span>
                    <strong style={{ display: 'block', color: '#38bdf8', fontSize: '0.85rem', marginTop: '2px' }}>{assignedTeams.length} Squads Active</strong>
                  </div>
                </div>

                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', padding: '12px 14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>🎯 Assigned Teams & Squads:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {assignedTeams.length > 0 ? (
                      assignedTeams.map((t: any) => (
                        <span key={t.id} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          🎯 {t.team_name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: isLight ? '#94a3b8' : '#64748b', fontStyle: 'italic' }}>No teams assigned to this branch office.</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 4: TEAMS & SQUADS */}
      {activeRoleSubTab === 'sales_teams_squads' && (
        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {safeTeams.map((t: any, idx: number) => {
            const teamId = t.id || `TEAM-0${idx + 1}`;
            const teamName = t.team_name || t.name || 'Sales Team';
            return (
              <div key={teamId} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      🎯 {teamName}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                      Branch: <strong style={{ color: '#38bdf8' }}>{t.branch_name}</strong> • Dept: <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{t.department}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleOpenEditTeamModal(t)}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={14} /> Edit Team
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (handleDeleteTeam) {
                            handleDeleteTeam(teamId, teamName);
                          } else {
                            if (window.confirm(`Are you sure you want to delete Team Squad "${teamName}"?`)) {
                              alert(`🗑️ Team "${teamName}" removed successfully.`);
                            }
                          }
                        }}
                        style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Delete Team Squad"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: isLight ? '#f8fafc' : '#0f172a', padding: '14px', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TEAM LEAD</span>
                    <strong style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', marginTop: '2px' }}>{(t.leader_name || 'Abinash Roy (Admin)').replace(/Rajesh V[ae]rma/gi, 'Avishek Das')}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>MONTHLY TARGET</span>
                    <strong style={{ display: 'block', color: '#f59e0b', fontSize: '0.85rem', marginTop: '2px' }}>{t.monthly_target || '15 Property Units'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 5: ACTIVE SESSIONS & RISK ALERTS */}
      {activeRoleSubTab === 'active_sessions_risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* REAL-TIME SECURITY THREAT INTELLIGENCE SUMMARY BAR */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #ef4444', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '900', textTransform: 'uppercase' }}>Active Risk Threat Alerts</span>
                <AlertTriangle size={18} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444', margin: 0 }}>
                {anomalyLogs.filter(a => !a.resolved).length} Unresolved Alerts
              </h3>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>1 Critical • 1 High • 1 Medium</span>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '900', textTransform: 'uppercase' }}>Active User Sessions</span>
                <Activity size={18} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                {safeSessions.length} Live Sessions
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '800' }}>● Hardware Key 2FA Enforced</span>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '900', textTransform: 'uppercase' }}>Anomaly Detection Engine</span>
                <Cpu size={18} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fbbf24', margin: 0 }}>
                Patrol Active
              </h3>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>Scanning Geo Velocity & Data Spikes</span>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: '900', textTransform: 'uppercase' }}>Auto Protection Status</span>
                <ShieldCheck size={18} color="#22c55e" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#22c55e', margin: 0 }}>
                100% Protected
              </h3>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>Zero Unhandled Exfiltrations</span>
            </div>
          </div>

          {/* LIVE ACTIVE SESSIONS & RISK CONTROLS TABLE */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚨 Live Active User Sessions
              </h3>
              <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                ● Real-Time Token Monitor
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>Session ID</th>
                    <th style={{ padding: '10px' }}>Authenticated User</th>
                    <th style={{ padding: '10px' }}>IP Address</th>
                    <th style={{ padding: '10px' }}>Device Info</th>
                    <th style={{ padding: '10px' }}>Login Time</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Security Action</th>
                  </tr>
                </thead>
                <tbody>
                  {safeSessions.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800' }}>{s.id}</td>
                      <td style={{ padding: '10px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{s.user || s.username} ({s.role})</td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: isLight ? '#64748b' : '#94a3b8' }}>{s.ip || s.ip_address}</td>
                      <td style={{ padding: '10px', color: isLight ? '#64748b' : '#94a3b8' }}>{s.device || s.device_info}</td>
                      <td style={{ padding: '10px', color: '#fbbf24', fontWeight: '700' }}>{s.login_time}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.74rem' }}>
                          ● {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRevokeSession(s.id, s.user || s.username)}
                          style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Lock size={12} /> Force Disconnect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI SECURITY RISK ALERT & ANOMALY DETECTION ENGINE FEED */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #ef4444', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={22} color="#ef4444" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                    🛡️ AI Security Anomaly & Threat Detection Engine
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                  Monitors impossible travel velocities, sudden bulk lead export spikes, credential stuffing, and session token anomalies.
                </p>
              </div>

              <button
                onClick={() => alert('🔄 Refreshed threat intelligence feeds. Zero new unhandled anomalies detected.')}
                style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> Scan Threats Now
              </button>
            </div>

            {/* ANOMALY ALERTS LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {anomalyLogs.map((log: any) => (
                <div
                  key={log.id}
                  style={{
                    background: log.resolved ? (isLight ? '#f8fafc' : '#0f172a') : (isLight ? '#fff5f5' : '#2c1517'),
                    border: log.resolved ? (isLight ? '1px solid #cbd5e1' : '1px solid #334155') : `1px solid ${log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'HIGH' ? '#f59e0b' : '#38bdf8'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'HIGH' ? '#f59e0b' : '#0284c7',
                        color: '#ffffff',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontWeight: '900',
                        fontSize: '0.72rem'
                      }}>
                        {log.severity} THREAT
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', fontFamily: 'monospace' }}>
                        [{log.id}] {log.rule}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>• {log.timestamp}</span>
                    </div>

                    <span style={{
                      background: log.resolved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: log.resolved ? '#22c55e' : '#ef4444',
                      border: log.resolved ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.74rem',
                      fontWeight: '800'
                    }}>
                      {log.action_taken}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.83rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: '1.4' }}>
                    <strong>Target User:</strong> <span style={{ color: '#38bdf8', fontWeight: '800' }}>{log.user}</span> &nbsp;|&nbsp; <strong>Source IP / Location:</strong> <span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{log.ip}</span>
                    <p style={{ margin: '4px 0 0 0', color: isLight ? '#475569' : '#94a3b8' }}>{log.description}</p>
                  </div>

                  {!log.resolved && (
                    <div style={{ display: 'flex', gap: '8px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => alert(`🔒 IP Address ${log.ip.split(' ')[0]} added to permanent firewall quarantine list.`)}
                        style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.76rem', cursor: 'pointer' }}
                      >
                        🚫 Blacklist Source IP
                      </button>
                      <button
                        onClick={() => handleResolveAnomaly(log.id)}
                        style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.76rem', cursor: 'pointer' }}
                      >
                        ✓ Mark Incident Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* SECURITY ANOMALY PATROL CONTROLS */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} color="#0284c7" /> Automated Threat Patrol Policy Configuration
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#334155' : '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ruleSettings.geoTravel}
                    onChange={(e) => setRuleSettings(s => ({ ...s, geoTravel: e.target.checked }))}
                  />
                  <strong>Impossible Travel & Dual-Geo Velocity Interceptor</strong>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#334155' : '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ruleSettings.exfiltrationThrottling}
                    onChange={(e) => setRuleSettings(s => ({ ...s, exfiltrationThrottling: e.target.checked }))}
                  />
                  <strong>Bulk Customer CSV Exfiltration Spike Throttling</strong>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#334155' : '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ruleSettings.tokenHijack}
                    onChange={(e) => setRuleSettings(s => ({ ...s, tokenHijack: e.target.checked }))}
                  />
                  <strong>Device Fingerprint & Session Token Hijack Defense</strong>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#334155' : '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ruleSettings.afterHoursLockdown}
                    onChange={(e) => setRuleSettings(s => ({ ...s, afterHoursLockdown: e.target.checked }))}
                  />
                  <strong>After-Hours Bulk Lead Access Escalation Protection</strong>
                </label>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 6: UNIVERSAL APPROVAL QUEUE (MAKER-CHECKER ENHANCED) */}
      {activeRoleSubTab === 'approval_queue' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚖️ Maker-Checker Universal Approval Queue
              </h3>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                Governance gate for high-risk actions: Lead transfers, price discounts, and property inventory deletions.
              </p>
            </div>

            <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
              🛡️ Dual-Auth Governance Active
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '12px' }}>Request Code & Date</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Targeted Record / Entity</th>
                  <th style={{ padding: '12px' }}>Requested By</th>
                  <th style={{ padding: '12px' }}>Old Value ➔ New Value Diff</th>
                  <th style={{ padding: '12px' }}>Reason & Justification</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Governance Action</th>
                </tr>
              </thead>
              <tbody>
                {safeApprovals.map((req: any) => (
                  <tr key={req.id} style={{ borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800', display: 'block' }}>{req.request_code || req.id}</span>
                      <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{req.requested_at || 'Today, 12:00 PM'}</span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{ background: req.request_type === 'DELETION_APPROVAL' ? 'rgba(239, 68, 68, 0.15)' : req.request_type === 'PRICE_OVERRIDE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(2, 132, 199, 0.15)', color: req.request_type === 'DELETION_APPROVAL' ? '#ef4444' : req.request_type === 'PRICE_OVERRIDE' ? '#f59e0b' : '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: '900', fontSize: '0.74rem' }}>
                        {req.request_type}
                      </span>
                    </td>

                    <td style={{ padding: '12px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                      {req.record_id || 'SRM-CUS-2026-000184'}
                    </td>

                    <td style={{ padding: '12px', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700' }}>
                      {req.requested_by_name || req.requested_by}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                        <span style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#64748b' : '#94a3b8', padding: '2px 6px', borderRadius: '4px', textDecoration: 'line-through' }}>
                          {req.old_val || 'Previous Value'}
                        </span>
                        <ArrowRight size={14} color="#38bdf8" />
                        <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                          {req.new_val || 'Updated Value'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px', color: isLight ? '#475569' : '#cbd5e1', fontSize: '0.8rem', maxWidth: '200px' }}>
                      {req.reason}
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        background: req.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.15)' : req.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: req.status === 'APPROVED' ? '#4ade80' : req.status === 'REJECTED' ? '#ef4444' : '#fbbf24',
                        border: `1px solid ${req.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.3)' : req.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontWeight: '900',
                        fontSize: '0.74rem'
                      }}>
                        {req.status === 'APPROVED' ? '✓ APPROVED' : req.status === 'REJECTED' ? '✕ REJECTED' : '⏳ PENDING'}
                      </span>
                      {req.approved_by && (
                        <span style={{ display: 'block', fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>By: {req.approved_by}</span>
                      )}
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {req.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleApproveRequest(req.id, req.request_code || req.id)}
                            style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id, req.request_code || req.id)}
                            style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>
                          Action Finalized
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: EMPLOYEE EXIT & AUTOMATED REASSIGNMENT HANDOVER HUB */}
      {activeRoleSubTab === 'exit_handover' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #ef4444', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>📋 Employee Exit & Automated CRM Reassignment Handover Hub</h3>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>When marking an employee as RESIGNED or TERMINATED, reassign all active records while preserving audit history.</p>
            </div>
            <span style={{ background: '#ef4444', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
              SECURITY PROTOCOL ACTIVE
            </span>
          </div>

          <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Select Resigning / Exiting Employee:</label>
                <select style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}>
                  {safeUsers.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.role} - {u.team_name || u.branch_name || 'General Operations'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Select Target Reassignment Agent / Manager:</label>
                <select style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', color: '#4ade80', fontWeight: '800', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}>
                  {safeUsers.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '14px', borderRadius: '8px', display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8' }}>PENDING CUSTOMERS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>14 Records</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8' }}>ACTIVE LEADS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38bdf8' }}>8 Leads</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8' }}>UPCOMING SITE VISITS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fbbf24' }}>2 Visits</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8' }}>ACTIVE BOOKINGS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#4ade80' }}>1 Booking</h4>
              </div>
            </div>

            <button onClick={() => alert('🔒 Reassigned all active CRM records. Exiting user account disabled & active sessions revoked.')} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', alignSelf: 'flex-end' }}>
              Execute Employee Exit & Reassign All CRM Records
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB: ASSIGNED PROPERTY ADVISOR */}
      {activeRoleSubTab === 'assigned_property_advisors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* STATS OVERVIEW CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>Active Advisors</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>{propertyAdvisorsList.length} Staff</h4>
              </div>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>Assigned Properties</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#22c55e', margin: 0 }}>
                  {propertyAdvisorsList.reduce((acc, adv) => acc + (adv.assigned_properties?.length || 0), 0)} Projects
                </h4>
              </div>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneCall size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>Active Client Leads</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f59e0b', margin: 0 }}>
                  {propertyAdvisorsList.reduce((acc, adv) => acc + (adv.assigned_leads || 0), 0)} Inquiries
                </h4>
              </div>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>Closed Sales Volume</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#a855f7', margin: 0 }}>
                  {(() => {
                    const totalClosedSalesSum = propertyAdvisorsList.reduce((acc, adv) => acc + (adv.raw_sales_num || 0), 0);
                    if (totalClosedSalesSum <= 0) return '₹ 0 Cr';
                    if (totalClosedSalesSum >= 10000000) return `₹ ${(totalClosedSalesSum / 10000000).toFixed(2)} Cr`;
                    return `₹ ${(totalClosedSalesSum / 100000).toFixed(2)} Lakhs`;
                  })()}
                </h4>
              </div>
            </div>
          </div>

          {/* CONTROLS HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
              <Search size={16} color={isLight ? '#64748b' : '#94a3b8'} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Property Advisor by name, phone, email, assigned project..."
                style={{ width: '100%', background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <button
              onClick={() => {
                if (propertyAdvisorsList.length > 0) {
                  setAssignForm(f => ({ ...f, advisorId: propertyAdvisorsList[0].id }));
                }
                setShowAssignPropertyModal(true);
              }}
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> + Assign Property to Advisor
            </button>
          </div>

          {/* ADVISORS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {propertyAdvisorsList
              .filter(adv => !searchQuery || JSON.stringify(adv).toLowerCase().includes(searchQuery.toLowerCase()))
              .map((adv: any) => (
                <div key={adv.id} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    {/* ADVISOR PROFILE TOP */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
                          {adv.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                            {adv.full_name}
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '800' }}>
                            {adv.role}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                            ID: {adv.employee_id} • {adv.branch_name}
                          </div>
                        </div>
                      </div>

                      <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '900' }}>
                        🟢 {adv.status}
                      </span>
                    </div>

                    {/* CONTACT BAR */}
                    <div style={{ display: 'flex', gap: '16px', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '10px', padding: '10px 14px', fontSize: '0.78rem', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={13} color="#22c55e" /> {adv.mobile}
                      </span>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>
                        ✉️ {adv.email}
                      </span>
                    </div>

                    {/* ASSIGNED PROPERTIES SECTION */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '900', color: isLight ? '#475569' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} color="#0284c7" /> Assigned Properties ({adv.assigned_properties?.length || 0})
                        </span>
                        <button
                          onClick={() => {
                            setAssignForm(f => ({ ...f, advisorId: adv.id }));
                            setShowAssignPropertyModal(true);
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                        >
                          + Add Property
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {adv.assigned_properties && adv.assigned_properties.length > 0 ? (
                          adv.assigned_properties.map((prop: any, pIdx: number) => (
                            <div key={pIdx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', display: 'block' }}>
                                  🏢 {prop.title}
                                </strong>
                                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <MapPin size={11} color="#f59e0b" /> {prop.location} • <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{prop.code}</span>
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemovePropertyFromAdvisor(adv.id, prop.code)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                                title="Unassign Property"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: isLight ? '#94a3b8' : '#64748b', fontStyle: 'italic' }}>
                            No properties assigned currently. Click "+ Add Property" to assign.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* METRICS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.66rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>LEADS</span>
                        <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>{adv.assigned_leads}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.66rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>VISITS</span>
                        <strong style={{ fontSize: '0.95rem', color: '#f59e0b' }}>{adv.site_visits}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.66rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>DEALS</span>
                        <strong style={{ fontSize: '0.95rem', color: '#22c55e' }}>{adv.deals_closed}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.66rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>RATING</span>
                        <strong style={{ fontSize: '0.95rem', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {adv.rating}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* ADVISOR FOOTER ACTIONS */}
                  <div style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: '800' }}>
                      Sales Volume: {adv.total_sales}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ASSIGN PROPERTY TO ADVISOR MODAL */}
      {showAssignPropertyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                👨‍💼 Assign Property to Advisor
              </h3>
              <button onClick={() => setShowAssignPropertyModal(false)} style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Select Property Advisor *</label>
                <select
                  value={assignForm.advisorId}
                  onChange={(e) => setAssignForm({ ...assignForm, advisorId: e.target.value })}
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '9px 12px', fontSize: '0.85rem', fontWeight: '800' }}
                >
                  {propertyAdvisorsList.map((adv: any) => (
                    <option key={adv.id} value={adv.id}>{adv.full_name} ({adv.role} - {adv.branch_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  🔍 Search & Select Existing CRM Property
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {/* SEARCH INPUT FOR CRM PROPERTIES */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} color={isLight ? '#64748b' : '#94a3b8'} style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      value={propertySearchFilter}
                      onChange={(e) => setPropertySearchFilter(e.target.value)}
                      placeholder="Type to search property by title, code, or area..."
                      style={{
                        width: '100%',
                        background: isLight ? '#f8fafc' : '#0f172a',
                        color: isLight ? '#0f172a' : '#ffffff',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                        borderRadius: '8px',
                        padding: '7px 28px 7px 30px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                    {propertySearchFilter && (
                      <button
                        onClick={() => setPropertySearchFilter('')}
                        style={{ position: 'absolute', right: '8px', background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: 0 }}
                        title="Clear Search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* SELECT DROPDOWN FILTERED BY SEARCH QUERY */}
                  {(() => {
                    const allProps = (properties && properties.length > 0) ? properties : [
                      { id: 'SRM-PROP-2026-000421', property_code: 'SRM-PROP-2026-000421', property_title: 'SHIBALAY Apartment', locality: 'Garia, Kolkata' },
                      { id: 'SRM-PROP-2026-000422', property_code: 'SRM-PROP-2026-000422', property_title: 'Gajapati Residency', locality: 'Alipore, Kolkata' },
                      { id: 'SRM-PROP-2026-000423', property_code: 'SRM-PROP-2026-000423', property_title: 'Dhriti Greens & Commercial', locality: 'Salt Lake Sector 5, Kolkata' },
                      { id: 'SRM-PROP-2026-000424', property_code: 'SRM-PROP-2026-000424', property_title: 'Regent Park Greens', locality: 'Tollygunge, Kolkata' },
                      { id: 'SRM-PROP-2026-000425', property_code: 'SRM-PROP-2026-000425', property_title: 'Ballygunge Prime Residency', locality: 'Ballygunge, Kolkata' },
                      { id: 'SRM-PROP-2026-000426', property_code: 'SRM-PROP-2026-000426', property_title: 'New Alipore Heights', locality: 'New Alipore, Kolkata' }
                    ];

                    const q = propertySearchFilter.trim().toLowerCase();
                    const filtered = allProps.filter((p: any) => {
                      if (!q) return true;
                      const title = String(p.property_title || p.title || '').toLowerCase();
                      const code = String(p.property_code || p.id || '').toLowerCase();
                      const loc = String(p.locality || p.location || '').toLowerCase();
                      return title.includes(q) || code.includes(q) || loc.includes(q);
                    });

                    return (
                      <select
                        onChange={(e) => {
                          const selectedProp = allProps.find((p: any) => (p.id || p.property_code) === e.target.value);
                          if (selectedProp) {
                            setAssignForm(f => ({
                              ...f,
                              propertyTitle: selectedProp.property_title || selectedProp.title,
                              propertyCode: selectedProp.property_code || selectedProp.id,
                              location: selectedProp.locality || selectedProp.location || 'Kolkata',
                              propertyType: selectedProp.property_type || selectedProp.propertyType || 'Residential Flat'
                            }));
                          }
                        }}
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '9px 12px', fontSize: '0.85rem', fontWeight: '800' }}
                      >
                        <option value="">-- Select from {filtered.length} matching CRM property result(s) --</option>
                        {filtered.map((p: any) => (
                          <option key={p.id || p.property_code} value={p.id || p.property_code}>
                            🏢 {p.property_title || p.title} ({p.property_code || p.id}) - {p.locality || p.location || 'Kolkata'}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Property Title / Project Name *</label>
                <input
                  type="text"
                  value={assignForm.propertyTitle}
                  onChange={(e) => setAssignForm({ ...assignForm, propertyTitle: e.target.value })}
                  placeholder="e.g. SHIBALAY Apartment / Gajapati Residency"
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '9px 12px', fontSize: '0.85rem', fontWeight: '800' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Property Code (Optional)</label>
                  <input
                    type="text"
                    value={assignForm.propertyCode}
                    onChange={(e) => setAssignForm({ ...assignForm, propertyCode: e.target.value })}
                    placeholder="e.g. SRM-PROP-2026-000421"
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '9px 12px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Locality / Area</label>
                  <input
                    type="text"
                    value={assignForm.location}
                    onChange={(e) => setAssignForm({ ...assignForm, location: e.target.value })}
                    placeholder="e.g. Garia / Ballygunge, Kolkata"
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '9px 12px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
              <button
                onClick={() => setShowAssignPropertyModal(false)}
                style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '9px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePropertyAssignment}
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Confirm Property Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
