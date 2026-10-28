import React from 'react';
import {
  ShieldAlert, UserPlus, Building2, Users, CheckCircle2, ShieldCheck, Edit3, Trash2, Search,
  Lock, Shield, XCircle, RotateCw, Check, Briefcase, UserCheck, Activity, FileText, AlertTriangle,
  Layers, Award, Phone, Building, UserX, RefreshCw, Zap, Eye, EyeOff, Sliders, Server, Cpu, ArrowRight, X, PhoneCall,
  Plus, MapPin, Star, FileDown, Download
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
  setProperties?: React.Dispatch<React.SetStateAction<any[]>>;

  customers?: any[];
  setCustomers?: React.Dispatch<React.SetStateAction<any[]>>;
  leadsList?: any[];
  setLeadsList?: React.Dispatch<React.SetStateAction<any[]>>;
  scheduledVisits?: any[];
  setScheduledVisits?: React.Dispatch<React.SetStateAction<any[]>>;
  bookings?: any[];
  setBookings?: React.Dispatch<React.SetStateAction<any[]>>;
  setUsers?: React.Dispatch<React.SetStateAction<any[]>>;
  syncAllToMongoDB?: (overrideData?: any) => void;
  loggedInUser?: any;
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
  setProperties,
  customers = [],
  setCustomers,
  leadsList = [],
  setLeadsList,
  scheduledVisits = [],
  setScheduledVisits,
  bookings = [],
  setBookings,
  setUsers,
  syncAllToMongoDB,
  loggedInUser
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');
  const canDelete = isStrictSuperAdmin; // STRICT SYSTEM POLICY: All delete options in CRM are only accessible by Super Admin / Owner. Admin has Edit access only.

  const canEditUser = (u: any) => {
    if (!isSuperAdmin) return false; // Sales persons and non-admin roles cannot edit any user options
    if (isStrictSuperAdmin) return true; // Super Admin maintains all profiles
    const targetRole = (u?.role || '').toUpperCase();
    // Admin cannot edit Super Admin or Admin profiles
    if (targetRole.includes('SUPER') || targetRole.includes('OWNER') || targetRole === 'ADMIN' || targetRole.includes('ADMIN')) {
      return false;
    }
    return true; // Admin can only maintain others profiles (below Admin level)
  };

  const defaultPristineRoles = React.useMemo(() => [
    { key: 'SUPER_ADMIN', name: 'OWNER / SUPER ADMIN', level: 'Level 5 (Highest)', scope: 'Universal All-Data Access', desc: 'Full administrative control, universal read/write/delete rights, emergency lockdown switch, and system configuration governance.', color: '#0284c7', iconName: 'ShieldCheck' },
    { key: 'ADMIN', name: 'ADMIN', level: 'Level 4 (High)', scope: 'Company-Wide Operations', desc: 'Executive management access to view/create/edit all properties, customer leads, and employee user accounts across branches.', color: '#38bdf8', iconName: 'Shield' },
    { key: 'BRANCH_MANAGER', name: 'BRANCH MANAGER', level: 'Level 3 (Branch Level)', scope: 'Assigned Branch Data', desc: 'Manages branch inventory, team leaders, site visits, cost sheets, and localized sales performance reporting.', color: '#10b981', iconName: 'Building2' },
    { key: 'TELECALLER', name: 'TELECALLER', level: 'Level 2 (Executive Desk)', scope: 'Assigned Calling Queue', desc: 'Inbound and outbound customer call logging, requirement profiling, follow-up scheduling, and lead status updates.', color: '#f59e0b', iconName: 'PhoneCall' },
    { key: 'PROPERTY_MANAGEMENT', name: 'PROPERTY MANAGEMENT', level: 'Level 3 (Inventory Unit)', scope: 'Tower Unit Board & Stock', desc: 'Live tower unit board management, pricing updates, inventory ingestion, floor plan attachments, and amenity tagging.', color: '#ec4899', iconName: 'Building' },
    { key: 'SALES_MANAGEMENT', name: 'SALES MANAGEMENT', level: 'Level 3 (Sales Unit)', scope: 'Sales Team & Pipeline', desc: 'Oversees 13-stage sales funnel, deal closures, site visit assignments, customer negotiation overrides, and booking sheets.', color: '#8b5cf6', iconName: 'Zap' },
    { key: 'SALES_EMPLOYEE', name: 'SALES EMPLOYEE', level: 'Level 2 (Executive Desk)', scope: 'Sales team member', desc: 'Property sales execution, customer site visits, lead follow-ups, and negotiation updates.', color: '#06b6d4', iconName: 'Users' }
  ], []);

  const safeCustomRoles = React.useMemo(() => {
    return (customRoles && customRoles.length > 0) ? customRoles : defaultPristineRoles;
  }, [customRoles, defaultPristineRoles]);

  // Sub-Tab Normalization & Reactive Tab Switching
  const [currentSubTab, setCurrentSubTab] = React.useState<string>(() => {
    if (activeRoleSubTab === 'employee_directory' || activeRoleSubTab === 'user_directory') return 'employee_directory';
    if (activeRoleSubTab === 'branches_offices' || activeRoleSubTab === 'org_hierarchy') return 'branches_offices';
    if (activeRoleSubTab === 'sales_teams_squads' || activeRoleSubTab === 'teams_directory') return 'sales_teams_squads';
    if (activeRoleSubTab === 'assigned_property_advisors') return 'assigned_property_advisors';
    if (activeRoleSubTab === 'exit_handover') return 'exit_handover';
    return 'active_roles_matrix';
  });

  React.useEffect(() => {
    if (activeRoleSubTab === 'employee_directory' || activeRoleSubTab === 'user_directory') {
      setCurrentSubTab('employee_directory');
    } else if (activeRoleSubTab === 'branches_offices' || activeRoleSubTab === 'org_hierarchy') {
      setCurrentSubTab('branches_offices');
    } else if (activeRoleSubTab === 'sales_teams_squads' || activeRoleSubTab === 'teams_directory') {
      setCurrentSubTab('sales_teams_squads');
    } else if (activeRoleSubTab === 'assigned_property_advisors') {
      setCurrentSubTab('assigned_property_advisors');
    } else if (activeRoleSubTab === 'exit_handover') {
      setCurrentSubTab('exit_handover');
    } else if (activeRoleSubTab === 'active_roles_matrix' || activeRoleSubTab === 'permission_matrix') {
      setCurrentSubTab('active_roles_matrix');
    }
  }, [activeRoleSubTab]);

  const handleSwitchSubTab = (tab: string) => {
    setCurrentSubTab(tab);
    if (setActiveRoleSubTab) {
      setActiveRoleSubTab(tab);
    }
  };

  // Helper to filter out any legacy demo branch records
  const isDemoBranch = (b: any) => {
    if (!b) return true;
    const name = String(b.branch_name || b.name || '').toLowerCase();
    const addr = String(b.address || '').toLowerCase();
    return name.includes('north kolkata hub') || addr.includes('dum dum road');
  };

  // Helper to filter out any legacy demo team records
  const isDemoTeam = (t: any) => {
    if (!t) return true;
    const name = String(t.team_name || t.name || '').toLowerCase();
    return name.includes('dum dum sales squad');
  };

  // Local persistent Branches & Teams state strictly sourced from database/props
  const [localBranches, setLocalBranches] = React.useState<any[]>(() => {
    if (branches && Array.isArray(branches) && branches.length > 0) {
      const clean = branches.filter((b: any) => !isDemoBranch(b));
      if (clean.length > 0) return clean;
    }
    try {
      const stored = localStorage.getItem('swaramayi_enterprise_branches_v9');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((b: any) => !isDemoBranch(b));
          if (clean.length > 0) return clean;
        }
      }
    } catch (e) {}
    return (branches && Array.isArray(branches)) ? branches.filter((b: any) => !isDemoBranch(b)) : [];
  });

  const [localTeams, setLocalTeams] = React.useState<any[]>(() => {
    if (teams && Array.isArray(teams) && teams.length > 0) {
      const clean = teams.filter((t: any) => !isDemoTeam(t));
      if (clean.length > 0) return clean;
    }
    try {
      const stored = localStorage.getItem('swaramayi_enterprise_teams_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((t: any) => !isDemoTeam(t));
          if (clean.length > 0) return clean;
        }
      }
    } catch (e) {}
    return (teams && Array.isArray(teams)) ? teams.filter((t: any) => !isDemoTeam(t)) : [];
  });

  // Direct live fetch on mount from MongoDB database to guarantee fresh records
  React.useEffect(() => {
    let isMounted = true;
    const loadRealDatabaseRecords = async () => {
      try {
        const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:5000/api/v1/crm/sync'
          : '/api/v1/crm/sync';
        const res = await fetch(apiUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'SUCCESS' && json.data && isMounted) {
            const mData = json.data;
            if (Array.isArray(mData.branches) && mData.branches.length > 0) {
              const cleanBranches = mData.branches.filter((b: any) => !isDemoBranch(b));
              setLocalBranches(cleanBranches);
              try { localStorage.setItem('swaramayi_enterprise_branches_v9', JSON.stringify(cleanBranches)); } catch (e) {}
            }
            if (Array.isArray(mData.teams) && mData.teams.length > 0) {
              const cleanTeams = mData.teams.filter((t: any) => !isDemoTeam(t));
              setLocalTeams(cleanTeams);
              try { localStorage.setItem('swaramayi_enterprise_teams_v2', JSON.stringify(cleanTeams)); } catch (e) {}
            }
            if (Array.isArray(mData.users) && mData.users.length > 0 && setUsers) {
              setUsers(mData.users);
            }
          }
        }
      } catch (err) {
        console.warn('Live database fetch notice in RoleManagementView:', err);
      }
    };
    loadRealDatabaseRecords();
    return () => { isMounted = false; };
  }, []);

  React.useEffect(() => {
    if (branches && Array.isArray(branches) && branches.length > 0) {
      const clean = branches.filter((b: any) => !isDemoBranch(b));
      if (clean.length > 0) {
        setLocalBranches(clean);
        try { localStorage.setItem('swaramayi_enterprise_branches_v9', JSON.stringify(clean)); } catch (e) {}
      }
    }
  }, [branches]);

  React.useEffect(() => {
    if (teams && Array.isArray(teams) && teams.length > 0) {
      const clean = teams.filter((t: any) => !isDemoTeam(t));
      if (clean.length > 0) {
        setLocalTeams(clean);
        try { localStorage.setItem('swaramayi_enterprise_teams_v2', JSON.stringify(clean)); } catch (e) {}
      }
    }
  }, [teams]);

  const [internalSearchQuery, setInternalSearchQuery] = React.useState('');
  const [internalFilterCategory, setInternalFilterCategory] = React.useState('ALL');
  const [localApprovals, setLocalApprovals] = React.useState<any[]>([]);

  // User Modal State (Add & Edit Employee)
  const [showUserModalInternal, setShowUserModalInternal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [showUserModalPassword, setShowUserModalPassword] = React.useState(false);
  const [userForm, setUserForm] = React.useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'SALES_EXEC',
    designation: '',
    branch_name: '',
    department: 'Sales Operations',
    team_name: '',
    manager_name: '',
    permissions: {
      perm_view: true,
      perm_create: true,
      perm_edit: true,
      perm_delete: false,
      perm_export: true,
      perm_approve: false,
      perm_price_change: false,
      perm_brokerage: false
    }
  });

  const handleOpenAddUserModalInternal = () => {
    setEditingUser(null);
    setShowUserModalPassword(false);
    setUserForm({
      username: '',
      full_name: '',
      email: '',
      password: '',
      mobile: '',
      role: safeCustomRoles[0]?.key || 'SALES_EXEC',
      designation: '',
      branch_name: localBranches[0]?.branch_name || '',
      department: 'Sales Operations',
      team_name: localTeams[0]?.team_name || '',
      manager_name: safeUsers.find((u: any) => (u.role || '').toUpperCase() === 'SUPER_ADMIN')?.full_name || safeUsers[0]?.full_name || '',
      permissions: {
        perm_view: true,
        perm_create: true,
        perm_edit: true,
        perm_delete: false,
        perm_export: true,
        perm_approve: false,
        perm_price_change: false,
        perm_brokerage: false
      }
    });
    setShowUserModalInternal(true);
  };

  const handleOpenEditUserModalInternal = (u: any) => {
    if (!canEditUser(u)) {
      alert('🔒 Access Denied: Admin accounts cannot edit Admin or Super Admin profiles. Admins can only maintain staff profiles below Admin level. Super Admin maintains all profiles.');
      return;
    }
    setEditingUser(u);
    setShowUserModalPassword(false);
    const userRole = (u.role || '').toUpperCase();
    const isSuper = userRole.includes('SUPER') || userRole.includes('OWNER') || u.id === 'USR-01' || (u.full_name || '').toLowerCase().includes('avishek');
    setUserForm({
      username: u.username || u.full_name || '',
      full_name: u.full_name || u.username || '',
      email: u.email || '',
      password: '',
      mobile: u.mobile || '',
      role: isSuper ? 'SUPER_ADMIN' : (u.role || 'SALES_EXEC'),
      designation: u.designation || (isSuper ? 'Managing Director & Founder' : ''),
      branch_name: u.branch_name || 'Head Office (Kolkata)',
      department: u.department || (isSuper ? 'Executive Board' : 'Sales Operations'),
      team_name: u.team_name || (isSuper ? 'Corporate Leadership Squad' : (localTeams[0]?.team_name || 'Head Office Sales Squad')),
      manager_name: u.manager_name || (isSuper ? 'Avishek Das (Super Admin)' : (safeUsers.find((x: any) => (x.role || '').toUpperCase().includes('SUPER'))?.full_name || 'Avishek Das (Super Admin)')),
      permissions: u.permissions || {
        perm_view: true,
        perm_create: true,
        perm_edit: true,
        perm_delete: false,
        perm_export: true,
        perm_approve: false,
        perm_price_change: false,
        perm_brokerage: false
      }
    });
    setShowUserModalInternal(true);
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = (userForm.full_name || userForm.username || '').trim();
    if (!nameTrim) {
      alert('Please enter a Full Name.');
      return;
    }
    const emailTrim = (userForm.email || '').trim();
    if (!emailTrim) {
      alert('Please enter a Corporate Email.');
      return;
    }

    if (editingUser) {
      const updatedUsers = (users || []).map((u: any) => u.id === editingUser.id ? {
        ...u,
        username: nameTrim,
        full_name: nameTrim,
        email: emailTrim,
        password: userForm.password ? userForm.password : (u.password || 'Swaramayi@2026'),
        mobile: userForm.mobile || u.mobile || '',
        role: userForm.role,
        designation: userForm.designation,
        branch_name: userForm.branch_name,
        department: userForm.department,
        team_name: userForm.team_name,
        manager_name: userForm.manager_name,
        permissions: userForm.permissions
      } : u);

      if (setUsers) setUsers(updatedUsers);
      try {
        localStorage.setItem('swaramayi_enterprise_users_v8', JSON.stringify(updatedUsers));
      } catch (err) {}
      if (syncAllToMongoDB) syncAllToMongoDB({ users: updatedUsers });
      alert(`✏️ User "${nameTrim}" (${editingUser.id}) updated & saved successfully!`);
    } else {
      const newId = `USR-${String((users || []).length + 1).padStart(2, '0')}`;
      const newU = {
        id: newId,
        username: nameTrim,
        full_name: nameTrim,
        email: emailTrim,
        password: userForm.password || 'Swaramayi@2026',
        mobile: userForm.mobile || '',
        role: userForm.role,
        designation: userForm.designation || 'Real Estate Specialist',
        branch_name: userForm.branch_name,
        department: userForm.department,
        team_name: userForm.team_name,
        manager_name: userForm.manager_name,
        permissions: userForm.permissions,
        is_active: true,
        user_status: 'ACTIVE',
        created_at: new Date().toISOString().split('T')[0]
      };
      const updatedUsers = [newU, ...(users || [])];
      if (setUsers) setUsers(updatedUsers);
      try {
        localStorage.setItem('swaramayi_enterprise_users_v8', JSON.stringify(updatedUsers));
      } catch (err) {}
      if (syncAllToMongoDB) syncAllToMongoDB({ users: updatedUsers });
      alert(`👤 User "${nameTrim}" (${newId}) provisioned & created successfully!`);
    }

    setShowUserModalInternal(false);
    setEditingUser(null);
  };

  const handleDeleteUserInternal = (userId: string, userName?: string) => {
    if (userId === 'USR-01') {
      alert('🔒 Cannot delete Primary Super Admin Account (USR-01).');
      return;
    }
    if (!canDelete) {
      alert('🔒 Access Denied: Only Super Admin / Owner can delete user accounts.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${userName || userId}"?`)) {
      const updatedUsers = (users || []).filter((u: any) => u.id !== userId);
      if (setUsers) setUsers(updatedUsers);
      try {
        localStorage.setItem('swaramayi_enterprise_users_v8', JSON.stringify(updatedUsers));
      } catch (err) {}
      if (syncAllToMongoDB) syncAllToMongoDB({ users: updatedUsers });
      alert(`🗑️ User "${userName || userId}" removed successfully.`);
    }
  };

  // Branch Modal State (Add & Edit Branch)
  const [showBranchModalInternal, setShowBranchModalInternal] = React.useState(false);
  const [editingBranchId, setEditingBranchId] = React.useState<string | null>(null);
  const [branchForm, setBranchForm] = React.useState({
    branch_name: '',
    city: 'Kolkata',
    manager_name: '',
    address: '',
    target_revenue: '',
    assigned_teams: ''
  });

  const handleOpenAddBranchModal = () => {
    setEditingBranchId(null);
    setBranchForm({
      branch_name: '',
      city: 'Kolkata',
      manager_name: 'Avishek Das (Super Admin)',
      address: 'Camac Street, Park Street, Kolkata - 700017',
      target_revenue: '₹5,00,00,000',
      assigned_teams: 'Corporate Leadership Squad'
    });
    setShowBranchModalInternal(true);
  };

  const handleOpenEditBranchModalInternal = (b: any) => {
    setEditingBranchId(b.id);
    setBranchForm({
      branch_name: b.branch_name || '',
      city: b.city || 'Kolkata',
      manager_name: b.manager_name || '',
      address: b.address || '',
      target_revenue: b.target_revenue || '',
      assigned_teams: Array.isArray(b.teams) ? b.teams.join(', ') : (b.teams || '')
    });
    setShowBranchModalInternal(true);
  };

  const handleSaveBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.branch_name.trim()) {
      alert('Please enter a Branch Office Name.');
      return;
    }
    const branchNameTrim = branchForm.branch_name.trim();

    let updatedBranches: any[];
    if (editingBranchId) {
      updatedBranches = localBranches.map(b => b.id === editingBranchId ? {
        ...b,
        branch_name: branchNameTrim,
        city: branchForm.city,
        manager_name: branchForm.manager_name,
        address: branchForm.address.trim() || b.address,
        target_revenue: branchForm.target_revenue.trim() || b.target_revenue,
        teams: branchForm.assigned_teams.trim()
          ? branchForm.assigned_teams.split(',').map((t: string) => t.trim()).filter(Boolean)
          : (b.teams || [])
      } : b);
      alert(`✅ Branch '${branchNameTrim}' updated successfully across Company Hierarchy!`);
    } else {
      const newB = {
        id: `BR-0${localBranches.length + 1}`,
        branch_name: branchNameTrim,
        city: branchForm.city,
        manager_name: branchForm.manager_name,
        address: branchForm.address.trim(),
        target_revenue: branchForm.target_revenue.trim(),
        teams: branchForm.assigned_teams.trim()
          ? branchForm.assigned_teams.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [],
        created_at: new Date().toISOString().split('T')[0]
      };
      updatedBranches = [...localBranches, newB];
      alert(`🏢 Enterprise Branch '${branchNameTrim}' created successfully!`);
    }

    setLocalBranches(updatedBranches);
    try {
      localStorage.setItem('swaramayi_enterprise_branches_v9', JSON.stringify(updatedBranches));
    } catch (err) {}
    if (syncAllToMongoDB) syncAllToMongoDB({ branches: updatedBranches });

    setShowBranchModalInternal(false);
    setEditingBranchId(null);
  };

  const handleDeleteBranchInternal = (branchId: string, branchName: string) => {
    if (!canDelete) {
      alert('🔒 Access Denied: Only Super Admin / Owner can delete branches.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete Enterprise Branch "${branchName}"?`)) {
      const updated = localBranches.filter(b => b.id !== branchId && b.branch_name !== branchName);
      setLocalBranches(updated);
      try {
        localStorage.setItem('swaramayi_enterprise_branches_v9', JSON.stringify(updated));
      } catch (err) {}
      if (syncAllToMongoDB) syncAllToMongoDB({ branches: updated });
      alert(`🗑️ Branch "${branchName}" removed from Company Hierarchy.`);
    }
  };

  // Team Squad Modal State (Add & Edit Team)
  const [showTeamModalInternal, setShowTeamModalInternal] = React.useState(false);
  const [editingTeamId, setEditingTeamId] = React.useState<string | null>(null);
  const [teamForm, setTeamForm] = React.useState({
    team_name: '',
    branch_name: '',
    department: 'Sales Operations',
    leader_name: '',
    monthly_target: ''
  });

  const handleOpenAddTeamModal = () => {
    setEditingTeamId(null);
    setTeamForm({
      team_name: '',
      branch_name: localBranches[0]?.branch_name || 'Head Office (Kolkata)',
      department: 'Sales Management',
      leader_name: 'Avishek Das (Super Admin)',
      monthly_target: '15 Property Units'
    });
    setShowTeamModalInternal(true);
  };

  const handleOpenEditTeamModalInternal = (t: any) => {
    setEditingTeamId(t.id);
    setTeamForm({
      team_name: t.team_name || '',
      branch_name: t.branch_name || (localBranches[0]?.branch_name || 'Head Office (Kolkata)'),
      department: t.department || 'Sales Management',
      leader_name: t.leader_name || 'Avishek Das (Super Admin)',
      monthly_target: t.monthly_target || '15 Property Units'
    });
    setShowTeamModalInternal(true);
  };

  const handleSaveTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.team_name.trim()) {
      alert('Please enter a Sales Team Name.');
      return;
    }
    const teamNameTrim = teamForm.team_name.trim();

    let updatedTeams: any[];
    if (editingTeamId) {
      updatedTeams = localTeams.map(t => t.id === editingTeamId ? {
        ...t,
        team_name: teamNameTrim,
        branch_name: teamForm.branch_name,
        department: teamForm.department,
        leader_name: teamForm.leader_name,
        monthly_target: teamForm.monthly_target.trim()
      } : t);
      alert(`✅ Team Squad '${teamNameTrim}' updated successfully!`);
    } else {
      const newT = {
        id: `TEAM-0${localTeams.length + 1}`,
        team_name: teamNameTrim,
        branch_name: teamForm.branch_name,
        department: teamForm.department,
        leader_name: teamForm.leader_name,
        monthly_target: teamForm.monthly_target.trim(),
        created_at: new Date().toISOString().split('T')[0]
      };
      updatedTeams = [...localTeams, newT];
      alert(`👥 Sales Team '${teamNameTrim}' provisioned successfully!`);
    }

    setLocalTeams(updatedTeams);
    try {
      localStorage.setItem('swaramayi_enterprise_teams_v2', JSON.stringify(updatedTeams));
    } catch (err) {}
    if (syncAllToMongoDB) syncAllToMongoDB({ teams: updatedTeams });

    setShowTeamModalInternal(false);
    setEditingTeamId(null);
  };

  const handleDeleteTeamInternal = (teamId: string, teamName: string) => {
    if (!canDelete) {
      alert('🔒 Access Denied: Only Super Admin / Owner can delete teams.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete Team Squad "${teamName}"?`)) {
      const updated = localTeams.filter(t => t.id !== teamId && t.team_name !== teamName);
      setLocalTeams(updated);
      try {
        localStorage.setItem('swaramayi_enterprise_teams_v2', JSON.stringify(updated));
      } catch (err) {}
      if (syncAllToMongoDB) syncAllToMongoDB({ teams: updated });
      alert(`🗑️ Team "${teamName}" removed successfully.`);
    }
  };

  // Security Audit Modal State (Linked with ProfileView standard / Image 3)
  const [securityAuditModal, setSecurityAuditModal] = React.useState<{ open: boolean; user: any } | null>(null);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [auditLoading, setAuditLoading] = React.useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = React.useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = React.useState('ALL');

  const getInitialAuditRecords = (userObj: any) => {
    const uname = userObj?.full_name || userObj?.username || 'Avishek Das';
    const urole = userObj?.role || 'SUPER_ADMIN';
    const ubranch = userObj?.branch_name || (localBranches[0]?.branch_name || 'Head Office (Kolkata)');
    const udept = userObj?.department || 'Executive Board';
    const now = new Date();

    return [
      {
        id: 'AUD-001',
        timestamp: now.toLocaleString(),
        action: 'SECURITY_AUDIT_INSPECTION',
        category: 'SECURITY',
        resource: 'USER_PROFILE',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome 127.0 / Windows 11 Enterprise',
        details: `Dynamic security audit inspection performed for ${uname} (${urole}).`,
        status: 'VERIFIED',
        risk_level: 'LOW'
      },
      {
        id: 'AUD-002',
        timestamp: '23/10/2026, 10:15:32',
        action: 'LOGIN_AUTHENTICATION',
        category: 'AUTHENTICATION',
        resource: 'CRM_PORTAL',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome 127.0 / Windows 11 Enterprise',
        details: `Successful hardware key 2FA authentication for ${uname}. Active session token issued.`,
        status: 'SUCCESS',
        risk_level: 'LOW'
      },
      {
        id: 'AUD-003',
        timestamp: '22/10/2026, 17:45:12',
        action: 'CUSTOMER_DATA_QUERY',
        category: 'DATABASE',
        resource: 'CUSTOMER_VAULT',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome 127.0 / Windows 11 Enterprise',
        details: `Queried active customer portfolio records assigned to branch ${ubranch}.`,
        status: 'VERIFIED',
        risk_level: 'LOW'
      },
      {
        id: 'AUD-004',
        timestamp: '20/10/2026, 11:30:20',
        action: 'RBAC_PRIVILEGE_CHECK',
        category: 'ACCESS_CONTROL',
        resource: 'SECURITY_MATRIX',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome 127.0 / Windows 11 Enterprise',
        details: `Privilege scope level evaluated for ${urole} in ${udept}. All permissions verified.`,
        status: 'PASSED',
        risk_level: 'LOW'
      },
      {
        id: 'AUD-005',
        timestamp: '18/10/2026, 16:20:00',
        action: 'ENTERPRISE_USER_PROVISIONED',
        category: 'USER_MANAGEMENT',
        resource: 'EMPLOYEE_DIRECTORY',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome 127.0 / Windows 11 Enterprise',
        details: `User account (${userObj.id || 'USR-01'}) provisioned for ${ubranch} under ${udept}.`,
        status: 'COMPLIANT',
        risk_level: 'LOW'
      },
      {
        id: 'AUD-006',
        timestamp: '15/10/2026, 14:10:45',
        action: 'DATA_ENCRYPTION_CHECK',
        category: 'SECURITY',
        resource: 'SYSTEM_SETTINGS',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome 127.0 / Windows 11 Enterprise',
        details: '256-Bit SSL/TLS Encryption and field-level phone masking policy enforced.',
        status: 'SECURE',
        risk_level: 'LOW'
      }
    ];
  };

  const handleOpenSecurityAudit = (u: any) => {
    const targetUser = u || (users && users[0]) || { username: 'Avishek Das', role: 'SUPER_ADMIN' };
    setAuditSearchQuery('');
    setAuditCategoryFilter('ALL');
    const defaultList = getInitialAuditRecords(targetUser);
    setAuditLogs(defaultList);
    setSecurityAuditModal({ open: true, user: targetUser });
    fetchLiveAuditLogs(targetUser);
  };

  const fetchLiveAuditLogs = async (targetUser?: any) => {
    const u = targetUser || securityAuditModal?.user;
    setAuditLoading(true);
    try {
      const token = localStorage.getItem('swaramayi_token') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
      const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api/v1/security/audit-logs'
        : '/api/v1/security/audit-logs';

      const res = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'SUCCESS' && Array.isArray(json.data) && json.data.length > 0) {
          const targetId = String(u?.id || '');
          const targetUsername = String(u?.username || '').toLowerCase();
          const targetFullName = String(u?.full_name || '').toLowerCase();

          const userLogs = json.data.filter((l: any) => {
            const logUserId = String(l.user_id || '');
            const logUser = String(l.username || '').toLowerCase();
            const logFullName = String(l.full_name || '').toLowerCase();
            return (targetId && logUserId === targetId) ||
                   (targetUsername && logUser === targetUsername) ||
                   (targetFullName && logFullName === targetFullName);
          });

          const rawList = userLogs.length > 0 ? userLogs : json.data;
          const mapped = rawList.map((l: any, idx: number) => ({
            id: l.id || `AUD-${String(idx + 1).padStart(3, '0')}`,
            timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString() : 'Just Now',
            action: l.action || 'SECURITY_AUDIT_INSPECTION',
            category: l.category || 'SECURITY',
            resource: l.resource || 'USER_PROFILE',
            ip: l.ip_address || l.ip || '127.0.0.1 (Localhost)',
            device: l.device || 'Chrome 127.0 / Windows 11 Enterprise',
            details: l.details || `Security audit event logged for ${u?.full_name || u?.username}`,
            status: l.status || 'VERIFIED',
            risk_level: l.risk_level || 'LOW'
          }));
          setAuditLogs(mapped);
        }
      }
    } catch (err) {
      console.warn('Live audit log fetch notice:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleExportAuditCSV = () => {
    if (!securityAuditModal?.user) return;
    const username = securityAuditModal.user.full_name || securityAuditModal.user.username || 'User';
    const csvRows = [
      ['Audit ID', 'Timestamp', 'Action Code', 'Category', 'Resource', 'IP Address', 'Device Info', 'Audit Details', 'Status', 'Risk Level'],
      ...auditLogs.map(l => [
        l.id,
        l.timestamp,
        l.action,
        l.category,
        l.resource,
        l.ip,
        l.device,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        l.status,
        l.risk_level
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Security_Audit_${username.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  const [anomalyLogs, setAnomalyLogs] = React.useState<any[]>([]);

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
    { id: 'USR-01', username: 'Avishek Das (Super Admin)', full_name: 'Avishek Das', email: 'avishek@swaramayi.info', mobile: '+91 98490 00001', role: 'SUPER_ADMIN', branch_name: 'Head Office (Kolkata)', department: 'Executive Board', team_name: 'Corporate Leadership Squad', manager_name: 'Self', is_active: true, user_status: 'ACTIVE', created_at: '2026-01-01' }
  ], []);

  const safeUsers = React.useMemo(() => {
    const list = Array.isArray(users) && users.length > 0 ? users : defaultUsersList;
    return list.filter((u: any) => {
      const name = (u.full_name || u.username || u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const id = (u.id || '').toUpperCase();
      return !(name.includes('rajesh') || name.includes('priya') || email.includes('rajesh') || email.includes('priya'));
    });
  }, [users, defaultUsersList]);

  const currentUserProfile = React.useMemo(() => {
    if (loggedInUser) {
      const match = safeUsers.find((u: any) => u.id === loggedInUser.id || (u.email && loggedInUser.email && u.email.toLowerCase() === loggedInUser.email.toLowerCase()));
      return match || loggedInUser;
    }
    return null;
  }, [loggedInUser, safeUsers]);

  const currentUserRole = (currentUserProfile?.role || currentRole || '').toUpperCase();
  const isUserSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'OWNER' || (!loggedInUser && (isStrictSuperAdmin || currentRole === 'SUPER_ADMIN'));

  const currentUserBranch = (currentUserProfile?.branch_name || currentUserProfile?.branch || '').trim();

  const isSameBranch = React.useCallback((b1?: string, b2?: string) => {
    if (!b1 || !b2) return false;
    const s1 = b1.toLowerCase().trim();
    const s2 = b2.toLowerCase().trim();
    if (s1 === s2) return true;
    const clean1 = s1.replace(/\(.*\)/g, '').replace(/branch/g, '').trim();
    const clean2 = s2.replace(/\(.*\)/g, '').replace(/branch/g, '').trim();
    return clean1.length > 0 && clean2.length > 0 && (clean1.includes(clean2) || clean2.includes(clean1));
  }, []);

  const visibleUsers = React.useMemo(() => {
    if (isUserSuperAdmin) {
      return safeUsers;
    }
    return safeUsers.filter((u: any) => {
      const targetRole = (u.role || '').toUpperCase();
      const isSuper = targetRole === 'SUPER_ADMIN' || targetRole === 'OWNER' || u.id === 'USR-01' || (u.full_name && u.full_name.toLowerCase().includes('avishek'));
      if (isSuper) return true;
      const targetBranch = u.branch_name || u.branch || '';
      return isSameBranch(currentUserBranch, targetBranch);
    });
  }, [safeUsers, isUserSuperAdmin, currentUserBranch, isSameBranch]);

  const safeBranches = localBranches;
  const safeTeams = localTeams;

  const visibleBranches = React.useMemo(() => {
    if (isUserSuperAdmin) {
      return safeBranches;
    }
    return safeBranches.filter((b: any) => isSameBranch(currentUserBranch, b.branch_name || b.name || ''));
  }, [safeBranches, isUserSuperAdmin, currentUserBranch, isSameBranch]);

  const visibleTeams = React.useMemo(() => {
    if (isUserSuperAdmin) {
      return safeTeams;
    }
    return safeTeams.filter((t: any) => isSameBranch(currentUserBranch, t.branch_name || ''));
  }, [safeTeams, isUserSuperAdmin, currentUserBranch, isSameBranch]);

  // Dynamic Employee Exit & CRM Reassignment Handover Hub State
  const [selectedExitingUserId, setSelectedExitingUserId] = React.useState<string>('');
  const [selectedTargetUserId, setSelectedTargetUserId] = React.useState<string>('');
  const [completedHandovers, setCompletedHandovers] = React.useState<string[]>([]);
  const [handoverLogs, setHandoverLogs] = React.useState<{ [userId: string]: { customers: number; leads: number; visits: number; bookings: number } }>({});

  const currentExitingUser = React.useMemo(() => {
    if (selectedExitingUserId) {
      return visibleUsers.find((u: any) => u.id === selectedExitingUserId) || visibleUsers[0];
    }
    return visibleUsers[0];
  }, [selectedExitingUserId, visibleUsers]);

  const currentTargetUser = React.useMemo(() => {
    const candidates = visibleUsers.filter((u: any) => u.id !== currentExitingUser?.id);
    if (selectedTargetUserId) {
      return candidates.find((u: any) => u.id === selectedTargetUserId) || candidates[0];
    }
    return candidates[0];
  }, [selectedTargetUserId, currentExitingUser, visibleUsers]);

  // Dynamic record metrics calculated per selected exiting employee across all CRM datasets
  const exitingStats = React.useMemo(() => {
    if (!currentExitingUser) return { customers: 0, leads: 0, visits: 0, bookings: 0 };
    
    if (completedHandovers.includes(currentExitingUser.id)) {
      return { customers: 0, leads: 0, visits: 0, bookings: 0 };
    }

    if (handoverLogs[currentExitingUser.id]) {
      return handoverLogs[currentExitingUser.id];
    }

    const uId = String(currentExitingUser.id || '');
    const uName = String(currentExitingUser.full_name || currentExitingUser.username || '');
    const uNameLower = uName.toLowerCase();

    // Helper to check if a record belongs to this user
    const isRecordAssignedToUser = (rec: any) => {
      if (!rec) return false;
      const recId = String(rec.assigned_employee_id || rec.salesperson_id || rec.advisor_id || rec.agent_id || rec.sales_executive_id || rec.assignedExecutiveId || '');
      const recName = String(rec.assigned_employee_name || rec.sales_executive || rec.assigned_salesperson || rec.assignedExecutive || rec.advisor_name || rec.assigned_advisor || rec.agent_name || rec.created_by_name || '').toLowerCase();
      
      const isIdMatch = recId && recId === uId;
      const isNameMatch = recName && (recName.includes(uNameLower) || uNameLower.includes(recName));
      return isIdMatch || isNameMatch;
    };

    // Load from props or localStorage fallbacks
    let currentCustList = Array.isArray(customers) && customers.length > 0 ? customers : [];
    if (currentCustList.length === 0) {
      try {
        const stored = localStorage.getItem('swaramayi_customers_master_v3_clean');
        if (stored) currentCustList = JSON.parse(stored);
      } catch (e) { console.error(e); }
    }

    let currentLeads = Array.isArray(leadsList) && leadsList.length > 0 ? leadsList : [];
    if (currentLeads.length === 0) {
      try {
        const stored = localStorage.getItem('swaramayi_leads_v5_clean');
        if (stored) currentLeads = JSON.parse(stored);
      } catch (e) { console.error(e); }
    }

    let currentVisits = Array.isArray(scheduledVisits) && scheduledVisits.length > 0 ? scheduledVisits : [];
    if (currentVisits.length === 0) {
      try {
        const stored = localStorage.getItem('scheduledVisits');
        if (stored) currentVisits = JSON.parse(stored);
      } catch (e) { console.error(e); }
    }

    let currentBookings = Array.isArray(bookings) && bookings.length > 0 ? bookings : [];
    if (currentBookings.length === 0) {
      try {
        const stored = localStorage.getItem('bookings');
        if (stored) currentBookings = JSON.parse(stored);
      } catch (e) { console.error(e); }
    }

    // 1. Pending Customers
    const pendingCustomersCount = currentCustList.filter(c => isRecordAssignedToUser(c) && c.status !== 'CLOSED' && c.customer_status !== 'CLOSED').length;

    // 2. Active Leads
    const activeLeadsFromLeadsList = currentLeads.filter(l => isRecordAssignedToUser(l) && l.status !== 'REJECTED' && l.status !== 'CLOSED').length;
    const activeLeadsFromCustList = currentCustList.filter(c => isRecordAssignedToUser(c) && (c.status === 'NEW_LEAD' || c.status === 'LEAD' || c.customer_status === 'LEAD' || c.lead_status === 'MATCHING_PENDING')).length;
    const activeLeadsCount = activeLeadsFromLeadsList + activeLeadsFromCustList;

    // 3. Site Visits
    const visitsFromScheduled = currentVisits.filter(v => isRecordAssignedToUser(v) && v.status !== 'CANCELLED').length;
    const visitsFromCustList = currentCustList.filter(c => isRecordAssignedToUser(c) && (c.status === 'Site Visit Scheduled' || c.customer_status === 'SCHEDULED_VISIT' || c.status === 'VISITED')).length;
    const siteVisitsCount = visitsFromScheduled + visitsFromCustList;

    // 4. Active Bookings
    const bookingsFromList = currentBookings.filter(b => isRecordAssignedToUser(b) && b.status !== 'CANCELLED').length;
    const bookingsFromCustList = currentCustList.filter(c => isRecordAssignedToUser(c) && (c.status === 'BOOKED' || c.customer_status === 'BOOKING_CONFIRMED' || c.status === 'AGREEMENT_DONE')).length;
    const bookingsCount = bookingsFromList + bookingsFromCustList;

    return {
      customers: pendingCustomersCount,
      leads: activeLeadsCount,
      visits: siteVisitsCount,
      bookings: bookingsCount
    };
  }, [currentExitingUser, customers, leadsList, scheduledVisits, bookings, completedHandovers, handoverLogs]);

  const handleExecuteExitHandover = () => {
    if (!currentExitingUser) {
      alert('Please select an exiting employee.');
      return;
    }
    if (!currentTargetUser || currentTargetUser.id === currentExitingUser.id) {
      alert('Please select a valid target reassignment agent/manager different from the exiting employee.');
      return;
    }

    const { customers: cusCount, leads: leadsCount, visits: visitsCount, bookings: bookingsCount } = exitingStats;

    if (completedHandovers.includes(currentExitingUser.id) || (cusCount === 0 && leadsCount === 0 && visitsCount === 0 && bookingsCount === 0)) {
      alert(`⚠️ All active CRM records for ${currentExitingUser.full_name || currentExitingUser.username} have ALREADY been reassigned! Current active balance: 0 Records.`);
      return;
    }

    const confirmMsg = `🔒 ARE YOU SURE YOU WANT TO EXECUTE EMPLOYEE EXIT HANDOVER?\n\nExiting Employee: ${currentExitingUser.full_name || currentExitingUser.username} (${currentExitingUser.role})\nTarget Manager: ${currentTargetUser.full_name || currentTargetUser.username} (${currentTargetUser.role})\n\nThis will reassign:\n- ${cusCount} Pending Customer Records\n- ${leadsCount} Active Leads\n- ${visitsCount} Site Visits\n- ${bookingsCount} Active Bookings\n\nAnd mark ${currentExitingUser.full_name || currentExitingUser.username}'s account as RESIGNED/INACTIVE.`;

    if (window.confirm(confirmMsg)) {
      const exitingId = String(currentExitingUser.id || '');
      const exitingNameLower = String(currentExitingUser.full_name || currentExitingUser.username || '').toLowerCase();
      const targetId = String(currentTargetUser.id || '');
      const targetName = String(currentTargetUser.full_name || currentTargetUser.username || '');

      const isRecordAssignedToExiting = (rec: any) => {
        if (!rec) return false;
        const recId = String(rec.assigned_employee_id || rec.salesperson_id || rec.advisor_id || rec.agent_id || rec.sales_executive_id || rec.assignedExecutiveId || '');
        const recName = String(rec.assigned_employee_name || rec.sales_executive || rec.assigned_salesperson || rec.assignedExecutive || rec.advisor_name || rec.assigned_advisor || rec.agent_name || rec.created_by_name || '').toLowerCase();
        return (recId && recId === exitingId) || (recName && (recName.includes(exitingNameLower) || exitingNameLower.includes(recName)));
      };

      // 1. Reassign Customers
      let updatedCusts = (customers || []).map((c: any) => {
        if (isRecordAssignedToExiting(c)) {
          return { ...c, assigned_employee_id: targetId, assigned_employee_name: targetName, assigned_salesperson: targetName, advisor_name: targetName };
        }
        return c;
      });
      if (setCustomers) setCustomers(updatedCusts);
      try { localStorage.setItem('swaramayi_customers_master_v3_clean', JSON.stringify(updatedCusts)); } catch (e) { console.error(e); }

      // 2. Reassign Leads
      let updatedLeads = (leadsList || []).map((l: any) => {
        if (isRecordAssignedToExiting(l)) {
          return { ...l, assigned_employee_id: targetId, assigned_employee_name: targetName, sales_executive: targetName, assigned_salesperson: targetName };
        }
        return l;
      });
      if (setLeadsList) setLeadsList(updatedLeads);
      try { localStorage.setItem('swaramayi_leads_v5_clean', JSON.stringify(updatedLeads)); } catch (e) { console.error(e); }

      // 3. Reassign Visits
      let updatedVisits = (scheduledVisits || []).map((v: any) => {
        if (isRecordAssignedToExiting(v)) {
          return { ...v, assignedExecutiveId: targetId, assignedExecutive: targetName, assigned_employee_name: targetName };
        }
        return v;
      });
      if (setScheduledVisits) setScheduledVisits(updatedVisits);
      try { localStorage.setItem('scheduledVisits', JSON.stringify(updatedVisits)); } catch (e) { console.error(e); }

      // 4. Reassign Bookings
      let updatedBookings = (bookings || []).map((b: any) => {
        if (isRecordAssignedToExiting(b)) {
          return { ...b, salesperson_id: targetId, salesperson: targetName, assigned_employee_name: targetName };
        }
        return b;
      });
      if (setBookings) setBookings(updatedBookings);
      try { localStorage.setItem('bookings', JSON.stringify(updatedBookings)); } catch (e) { console.error(e); }

      if (syncAllToMongoDB) syncAllToMongoDB();

      setCompletedHandovers(prev => [...prev, currentExitingUser.id]);
      setHandoverLogs(prev => ({
        ...prev,
        [currentExitingUser.id]: { customers: 0, leads: 0, visits: 0, bookings: 0 }
      }));

      alert(`✅ EMPLOYEE EXIT & REASSIGNMENT COMPLETED SUCCESSFULLY!\n\n• Reassigned ${cusCount} Customers, ${leadsCount} Leads, ${visitsCount} Site Visits, and ${bookingsCount} Bookings to ${targetName}.\n• ${currentExitingUser.full_name || currentExitingUser.username}'s active login sessions have been force disconnected.\n• Account status set to: RESIGNED / INACTIVE.`);
    }
  };

  // Dynamic Property Advisors list derived strictly from active CRM staff and safe users
  const propertyAdvisorsList = React.useMemo(() => {
    const staffFromUsers = (visibleUsers || []).filter((u: any) => {
      const r = String(u.role || '').toUpperCase();
      return r !== 'SUPER_ADMIN' && r !== 'OWNER' && u.id !== 'USR-01';
    });

    const userMap = new Map();
    staffFromUsers.forEach((u: any) => {
      const uNameLower = String(u.full_name || u.username || '').toLowerCase();
      userMap.set(u.id || uNameLower, u);
    });

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
            code: p.property_code || p.id || '',
            title: p.property_title || p.title || 'Property Site',
            location: p.locality || p.location || 'Kolkata',
            type: p.property_type || p.propertyType || 'Residential Flat',
            price: Number(p.final_estimated_price || p.price || p.base_price || 0),
            isSold: Boolean(p.isSold || p.is_sold || String(p.availability_status).toUpperCase() === 'SOLD' || String(p.availability_status).toUpperCase() === 'BOOKED')
          }));
        } else {
          advisorProps = [];
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

      // Dynamic rating strictly from real user record or 0.0 default
      let advisorRatingVal = (u.rating !== undefined && u.rating !== null && !isNaN(Number(u.rating)) && Number(u.rating) > 0) 
        ? Number(u.rating).toFixed(1) 
        : '0.0';

      return {
        id: uId,
        employee_id: u.employee_id || u.customer_number || u.id || '',
        full_name: u.full_name || u.username || 'Staff Member',
        role: u.role || 'Property Advisor',
        mobile: u.mobile || '',
        email: u.email || '',
        branch_name: u.branch_name || (localBranches[0]?.branch_name || 'Head Office (Kolkata)'),
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
    const currentAdvisor = propertyAdvisorsList.find(a => a.id === assignForm.advisorId) || safeUsers.find((u: any) => u.id === assignForm.advisorId);
    const existingProps = currentAdvisor?.assigned_properties || [];

    const selectedPropInCRM = (properties || []).find((p: any) => (p.id || p.property_code) === assignForm.propertyCode);
    const propPrice = selectedPropInCRM?.final_estimated_price || selectedPropInCRM?.base_price || selectedPropInCRM?.price || 0;

    const propCode = assignForm.propertyCode || selectedPropInCRM?.property_code || selectedPropInCRM?.id || '';
    const newPropObj = {
      code: propCode,
      title: assignForm.propertyTitle,
      location: assignForm.location || selectedPropInCRM?.locality || 'Kolkata',
      type: assignForm.propertyType || selectedPropInCRM?.property_type || 'Residential Flat',
      price: Number(propPrice) || 0
    };

    const nextPropsList = [...existingProps.filter((p: any) => p.code !== propCode), newPropObj];

    updateAdvisorProperties(assignForm.advisorId, nextPropsList);

    // 1. Update user record in users state & persistence
    let updatedUsers = (users || []).map((u: any) => {
      if (u.id === assignForm.advisorId) {
        return {
          ...u,
          assigned_properties: nextPropsList
        };
      }
      return u;
    });
    if (setUsers) setUsers(updatedUsers);
    try { localStorage.setItem('swaramayi_users_v7', JSON.stringify(updatedUsers)); } catch (e) {}

    // 2. Update matching property in properties state & persistence
    let updatedProperties = (properties || []).map((p: any) => {
      const isMatch = (propCode && (p.id === propCode || p.property_code === propCode)) ||
                      (p.property_code && p.property_code === propCode) ||
                      (p.title && assignForm.propertyTitle && p.title.toLowerCase().trim() === assignForm.propertyTitle.toLowerCase().trim()) ||
                      (p.property_title && assignForm.propertyTitle && p.property_title.toLowerCase().trim() === assignForm.propertyTitle.toLowerCase().trim());
      if (isMatch) {
        return {
          ...p,
          assigned_employee_id: currentAdvisor?.id || assignForm.advisorId,
          assigned_employee_name: currentAdvisor?.full_name || currentAdvisor?.username || 'Property Advisor',
          site_person_name: currentAdvisor?.full_name || currentAdvisor?.username || 'Property Advisor',
          site_person_contact: currentAdvisor?.mobile || p.site_person_contact || ''
        };
      }
      return p;
    });
    if (setProperties) setProperties(updatedProperties);

    // 3. Dispatch to MongoDB Atlas Live Sync immediately
    if (syncAllToMongoDB) {
      syncAllToMongoDB({
        users: updatedUsers,
        properties: updatedProperties
      });
    }

    alert(`✅ Successfully assigned "${assignForm.propertyTitle}" (${propCode}) to ${currentAdvisor?.full_name || 'Property Advisor'}!\n\nThis assignment has been synced directly to the website.`);
    setShowAssignPropertyModal(false);
    setAssignForm({ advisorId: '', propertyTitle: '', propertyCode: '', location: '', propertyType: 'Residential Flat' });
  };

  const handleRemovePropertyFromAdvisor = (advisorId: string, propCode: string) => {
    if (window.confirm(`Unassign property (${propCode}) from this Advisor?`)) {
      const currentAdvisor = propertyAdvisorsList.find(a => a.id === advisorId) || safeUsers.find((u: any) => u.id === advisorId);
      const existingProps = currentAdvisor?.assigned_properties || [];
      const updatedProps = existingProps.filter((p: any) => p.code !== propCode);

      updateAdvisorProperties(advisorId, updatedProps);

      // 1. Update user record
      let updatedUsers = (users || []).map((u: any) => {
        if (u.id === advisorId) {
          return {
            ...u,
            assigned_properties: updatedProps
          };
        }
        return u;
      });
      if (setUsers) setUsers(updatedUsers);
      try { localStorage.setItem('swaramayi_users_v7', JSON.stringify(updatedUsers)); } catch (e) {}

      // 2. Clear property advisor fields
      let updatedProperties = (properties || []).map((p: any) => {
        const isMatch = (propCode && (p.id === propCode || p.property_code === propCode));
        if (isMatch && p.assigned_employee_id === advisorId) {
          return {
            ...p,
            assigned_employee_id: '',
            assigned_employee_name: '',
            site_person_name: '',
            site_person_contact: ''
          };
        }
        return p;
      });
      if (setProperties) setProperties(updatedProperties);

      // 3. Dispatch to MongoDB Atlas Live Sync
      if (syncAllToMongoDB) {
        syncAllToMongoDB({
          users: updatedUsers,
          properties: updatedProperties
        });
      }

      alert(`🗑️ Property (${propCode}) unassigned successfully.`);
    }
  };

    const searchQuery = userRoleScopeSearchQuery ?? internalSearchQuery;
  const setSearchQuery = setUserRoleScopeSearchQuery ?? setInternalSearchQuery;

  const filterCategory = userRoleFilterCategory ?? internalFilterCategory;
  const setFilterCategory = setUserRoleFilterCategory ?? setInternalFilterCategory;

  const safeSessions = activeSessions || [];

  const safeApprovals = (approvalRequests && approvalRequests.length > 0 ? approvalRequests : localApprovals);

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

  const handleOpenAddRoleModal = () => {
    setEditingRole({ isNew: true, key: '' });
    setEditRoleForm({
      key: '',
      name: '',
      level: 'Level 5 (Highest Tier)',
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
  };

  const handleOpenEditRoleModal = (role: any) => {
    setEditingRole(role);
    const cleanName = (role.name || '').replace(/^\d+\.\s*/, '');
    let matchedLevel = 'Level 5 (Highest Tier)';
    if (role.level) {
      if (role.level.includes('5')) matchedLevel = 'Level 5 (Highest Tier)';
      else if (role.level.includes('4')) matchedLevel = 'Level 4 (High Tier)';
      else if (role.level.includes('3')) matchedLevel = 'Level 3 (Branch Tier)';
      else if (role.level.includes('2')) matchedLevel = 'Level 2 (Executive Desk)';
      else if (role.level.includes('1')) matchedLevel = 'Level 1 (Basic Operational)';
      else matchedLevel = role.level;
    }
    setEditRoleForm({
      key: role.key || '',
      name: cleanName,
      level: matchedLevel,
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
    const cleanName = editRoleForm.name.replace(/^\d+\.\s*/, '').trim();
    if (!cleanName) {
      alert('Please enter a Role Title / Name.');
      return;
    }
    const finalKey = (editRoleForm.key || '').trim().toUpperCase().replace(/\s+/g, '_') || `ROLE_${cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    const updatedForm = { ...editRoleForm, key: finalKey, name: cleanName };
    if (setCustomRoles) {
      setCustomRoles(prev => {
        const targetKey = editingRole.isNew ? null : editingRole.key;
        const exists = targetKey ? prev.some(r => r.key === targetKey) : false;
        if (exists) {
          return prev.map(r => r.key === targetKey ? { ...r, ...updatedForm } : r);
        } else {
          return [...prev, updatedForm];
        }
      });
    }
    try {
      const existing = (customRoles && customRoles.length > 0) ? customRoles : defaultPristineRoles;
      const targetKey = editingRole.isNew ? null : editingRole.key;
      const nextRoles = (targetKey && existing.some(r => r.key === targetKey))
        ? existing.map(r => r.key === targetKey ? { ...r, ...updatedForm } : r)
        : [...existing, updatedForm];
      localStorage.setItem('swaramayi_custom_roles_v4', JSON.stringify(nextRoles));
    } catch (e) {}
    alert(`✅ Custom Enterprise Role "${cleanName}" saved successfully!`);
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 18, 36, 0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#0f1d38', border: isLight ? '1px solid #cbd5e1' : '1.5px solid #1e3a8a', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: isLight ? '0 25px 60px rgba(0,0,0,0.15)' : '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(2, 132, 199, 0.25)' }}>
            
            {/* MODAL HEADER */}
            <div style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔑 {editingRole?.isNew ? 'Create Custom Enterprise Role & Security Scope' : 'Edit Custom Enterprise Role & Security Scope'}
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
              <div style={{ background: isLight ? '#f8fafc' : '#0d1d3a', border: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0284c7', margin: 0 }}>
                  1. Role Identity & Hierarchy Level
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '5px' }}>Role Display Name *</label>
                    <input
                      type="text"
                      value={editRoleForm.name}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Senior Operations Manager, Legal Advisor"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '5px' }}>Security Identifier Code (Slug) *</label>
                    <input
                      type="text"
                      value={editRoleForm.key}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, key: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                      placeholder="e.g. SENIOR_OPS_MGR"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', fontFamily: 'monospace', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '5px' }}>Security Level Tier *</label>
                    <select
                      value={editRoleForm.level}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, level: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', outline: 'none' }}
                    >
                      <option value="Level 5 (Highest Tier)">Level 5 (Highest Tier)</option>
                      <option value="Level 4 (High Tier)">Level 4 (High Tier)</option>
                      <option value="Level 3 (Branch Tier)">Level 3 (Branch Tier)</option>
                      <option value="Level 2 (Executive Desk)">Level 2 (Executive Desk)</option>
                      <option value="Level 1 (Basic Operational)">Level 1 (Basic Operational)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '5px' }}>Scope Access Boundary *</label>
                    <input
                      type="text"
                      value={editRoleForm.scope}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, scope: e.target.value }))}
                      placeholder="e.g. Company-Wide Operations"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ROLE DESCRIPTION & ACCENT COLOR */}
              <div style={{ background: isLight ? '#f8fafc' : '#0d1d3a', border: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0284c7', margin: 0 }}>
                  2. Role Description & Accent Color
                </h4>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '5px' }}>Role Responsibilities & Overview</label>
                  <textarea
                    value={editRoleForm.desc}
                    onChange={(e) => setEditRoleForm(f => ({ ...f, desc: e.target.value }))}
                    rows={3}
                    placeholder="Briefly describe what this custom role manages and its access boundaries across branches..."
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', lineHeight: '1.4', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '5px' }}>Accent Color Badge</label>
                    <select
                      value={editRoleForm.color}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, color: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', outline: 'none' }}
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
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '5px' }}>Role Badge Icon</label>
                    <select
                      value={editRoleForm.iconName}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, iconName: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: '700', outline: 'none' }}
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
              <div style={{ background: isLight ? '#f8fafc' : '#0d1d3a', border: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0284c7', margin: 0 }}>
                  3. Operational Permissions Checklist
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.view}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, view: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    View Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.create}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, create: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Create Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.edit}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, edit: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Edit Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.delete}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, delete: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Delete Records
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.export}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, export: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Export Reports
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.approve}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, approve: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Approve Transfers
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.price_change}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, price_change: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Price Overrides
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.owner_change}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, owner_change: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Reassign Owner
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editRoleForm.brokerage}
                      onChange={(e) => setEditRoleForm(f => ({ ...f, brokerage: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    Brokerage Access
                  </label>
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div style={{ padding: '16px 24px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: isLight ? '#f8fafc' : '#0d1d3a', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
              <button onClick={() => setEditingRole(null)} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '10px 22px', borderRadius: '8px', fontWeight: '800', fontSize: '0.83rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSaveEditedRole} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '0.83rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45)' }}>
                {editingRole?.isNew ? 'Save & Provision Custom Role' : 'Save & Update Role'}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: windowWidth <= 640 ? 'flex-start' : 'center', flexDirection: windowWidth <= 640 ? 'column' : 'row', gap: '16px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: windowWidth <= 480 ? '1.05rem' : (windowWidth <= 640 ? '1.18rem' : '1.4rem'), fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>ADVANCED ROLE, USER & MANAGEMENT CONTROL SYSTEM</h2>
            <span style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>ENTERPRISE RBAC</span>
          </div>
          <p style={{ fontSize: windowWidth <= 640 ? '0.75rem' : '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
            Active Enterprise Roles • Company & Branch Hierarchy • Maker-Checker Universal Approvals • Employee Exit Handover Engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: windowWidth <= 640 ? '100%' : 'auto' }}>
          {isSuperAdmin && (
            <button onClick={handleOpenAddUserModalInternal} style={{ flex: windowWidth <= 480 ? '1 1 100%' : 'initial', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <UserPlus size={15} /> + Add User
            </button>
          )}
          {isStrictSuperAdmin && (
            <>
              <button onClick={handleOpenAddRoleModal} style={{ flex: windowWidth <= 480 ? '1 1 100%' : 'initial', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#0284c7" /> + Add Custom Role
              </button>
              <button onClick={handleResetDefaultRoles} style={{ flex: windowWidth <= 480 ? '1 1 100%' : 'initial', background: isLight ? '#ffffff' : '#1e293b', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <RotateCw size={15} color="#38bdf8" /> Reset Scopes
              </button>
              <button onClick={handleOpenAddBranchModal} style={{ flex: windowWidth <= 480 ? '1 1 100%' : 'initial', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Building2 size={15} color="#fbbf24" /> + Add Branch
              </button>
              <button onClick={handleOpenAddTeamModal} style={{ flex: windowWidth <= 480 ? '1 1 100%' : 'initial', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
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
              flex: windowWidth <= 640 ? '1 1 100%' : 'initial',
              justifyContent: 'center',
              background: isLockdown ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              color: '#ffffff', 
              border: 'none', 
              padding: '8px 14px', 
              borderRadius: '8px', 
              fontWeight: '900', 
              fontSize: '0.78rem', 
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
      <div 
        className={windowWidth <= 768 ? "horizontal-scroll-touch" : ""}
        style={{ 
          display: 'flex', 
          gap: '10px', 
          borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
          paddingBottom: '12px', 
          flexWrap: windowWidth <= 768 ? 'nowrap' : 'wrap',
          overflowX: windowWidth <= 768 ? 'auto' : 'visible',
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <button 
          onClick={() => handleSwitchSubTab('active_roles_matrix')} 
          style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: currentSubTab === 'active_roles_matrix' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: currentSubTab === 'active_roles_matrix' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          🔑 Active Roles & Security Matrix
        </button>
        <button 
          onClick={() => handleSwitchSubTab('employee_directory')} 
          style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: currentSubTab === 'employee_directory' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: currentSubTab === 'employee_directory' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          👥 Employee Directory ({visibleUsers.length})
        </button>
        <button 
          onClick={() => handleSwitchSubTab('assigned_property_advisors')} 
          style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: currentSubTab === 'assigned_property_advisors' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: currentSubTab === 'assigned_property_advisors' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          👨‍💼 Assigned Property Advisor ({propertyAdvisorsList.length})
        </button>
        <button 
          onClick={() => handleSwitchSubTab('branches_offices')} 
          style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: currentSubTab === 'branches_offices' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: currentSubTab === 'branches_offices' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          🏢 Enterprise Branches & Offices ({visibleBranches.length})
        </button>
        <button 
          onClick={() => handleSwitchSubTab('sales_teams_squads')} 
          style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: currentSubTab === 'sales_teams_squads' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: currentSubTab === 'sales_teams_squads' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          🎯 Teams & Squads ({visibleTeams.length})
        </button>

        <button 
          onClick={() => handleSwitchSubTab('exit_handover')} 
          style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: currentSubTab === 'exit_handover' ? '#ef4444' : (isLight ? '#ffffff' : '#1e293b'), color: currentSubTab === 'exit_handover' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          📋 Employee Exit & Handover Hub
        </button>
      </div>

      {/* SUB-TAB 1: ACTIVE ROLES & SECURITY MATRIX */}
      {currentSubTab === 'active_roles_matrix' && (
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
      {currentSubTab === 'employee_directory' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: windowWidth <= 640 ? 'stretch' : 'center', flexDirection: windowWidth <= 640 ? 'column' : 'row', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: windowWidth <= 640 ? '100%' : 'auto' }}>
              <div style={{ position: 'relative', flex: windowWidth <= 640 ? 1 : 'initial', width: windowWidth <= 640 ? '100%' : 'auto' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, mobile..."
                  style={{
                    width: '100%',
                    background: isLight ? '#f8fafc' : '#0f172a',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                    color: isLight ? '#0f172a' : '#ffffff',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    minWidth: windowWidth <= 640 ? '100%' : '240px'
                  }}
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  width: windowWidth <= 640 ? '100%' : 'auto',
                  background: isLight ? '#f8fafc' : '#0f172a',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                  color: isLight ? '#0f172a' : '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700'
                }}
              >
                <option value="ALL">All Roles ({visibleUsers.length})</option>
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
                onClick={handleOpenAddUserModalInternal}
                style={{
                  width: windowWidth <= 640 ? '100%' : 'auto',
                  justifyContent: 'center',
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

          {/* USER DATA DISPLAY: MOBILE CARDS OR DESKTOP TABLE */}
          {windowWidth <= 768 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {visibleUsers
                .filter(u => filterCategory === 'ALL' || u.role === filterCategory)
                .filter(u => !searchQuery || JSON.stringify(u).toLowerCase().includes(searchQuery.toLowerCase()))
                .map((u: any) => (
                  <div 
                    key={u.id}
                    style={{
                      background: isLight ? '#f8fafc' : '#0f172a',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>
                          {(u.full_name || u.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.92rem', display: 'block' }}>{u.full_name || u.username}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{u.id} • @{u.username}</span>
                        </div>
                      </div>

                      <span style={{ background: u.role === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(2, 132, 199, 0.15)', color: u.role === 'SUPER_ADMIN' ? '#f59e0b' : '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem' }}>
                        👑 {u.role}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', background: isLight ? '#ffffff' : '#1e293b', padding: '10px', borderRadius: '8px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Branch & Dept:</span>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{u.branch_name || 'Head Office'}</strong>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>{u.department || 'Operations'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Contact Info:</span>
                        <span style={{ color: '#38bdf8', fontWeight: '700', display: 'block' }}>{u.email}</span>
                        <span style={{ color: '#4ade80', fontWeight: '800', display: 'block' }}>{u.mobile}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '10px' }}>
                      <button
                        onClick={() => handleOpenSecurityAudit(u)}
                        style={{ background: isLight ? '#ffffff' : '#1e293b', color: '#0284c7', border: '1px solid #0284c7', padding: '5px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Shield size={13} /> Security Audit
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {canEditUser(u) && (
                          <button
                            onClick={() => handleOpenEditUserModalInternal(u)}
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                        )}
                        {canDelete && u.id !== 'USR-01' && (
                          <button
                            onClick={() => handleDeleteUserInternal(u.id, u.full_name || u.username)}
                            style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
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
                  {visibleUsers
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
                            onClick={() => handleOpenSecurityAudit(u)}
                            style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: '#0284c7', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Shield size={13} /> Security Audit
                          </button>
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {canEditUser(u) && (
                              <button
                                onClick={() => handleOpenEditUserModalInternal(u)}
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}
                                title="Edit User Profile"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                            {canDelete && u.id !== 'USR-01' && (
                              <button
                                onClick={() => handleDeleteUserInternal(u.id, u.full_name || u.username)}
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
          )}
        </div>
      )}

      {/* SUB-TAB 3: ENTERPRISE BRANCHES & OFFICES */}
      {currentSubTab === 'branches_offices' && (
        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {visibleBranches.map((b: any) => {
            const assignedTeams = safeTeams.filter((t: any) => t.branch_id === b.id || t.branch_name === b.branch_name || (b.branch_name && t.branch_name && t.branch_name.toLowerCase().includes(b.branch_name.toLowerCase())));

            return (
              <div key={b.id} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      🏢 {b.branch_name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                      {b.address ? `${b.address} • ` : ''}City: <strong style={{ color: '#38bdf8' }}>{b.city || 'Kolkata'}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleOpenEditBranchModalInternal(b)}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={14} /> Edit Branch
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteBranchInternal(b.id, b.branch_name)}
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
                    <strong style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', marginTop: '2px' }}>{(b.manager_name || 'Not Assigned').replace(/Rajesh V[ae]rma/gi, 'Avishek Das')}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TARGET REVENUE</span>
                    <strong style={{ display: 'block', color: '#22c55e', fontSize: '0.85rem', marginTop: '2px' }}>{b.target_revenue || 'Not Set'}</strong>
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
      {currentSubTab === 'sales_teams_squads' && (
        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {visibleTeams.map((t: any, idx: number) => {
            const teamId = t.id || `TEAM-0${idx + 1}`;
            const teamName = t.team_name || t.name || 'Sales Team';
            const matchedBranch = safeBranches.find((b: any) => b.branch_name === t.branch_name || b.id === t.branch_id);
            const dynamicBranchAddr = matchedBranch?.address || '';
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
                    {dynamicBranchAddr && (
                      <p style={{ fontSize: '0.75rem', color: isLight ? '#475569' : '#cbd5e1', margin: '3px 0 0 0', fontWeight: '600' }}>
                        📍 <strong>Address:</strong> {dynamicBranchAddr}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleOpenEditTeamModalInternal(t)}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={14} /> Edit Team
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteTeamInternal(teamId, teamName)}
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
                    <strong style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', marginTop: '2px' }}>{(t.leader_name || 'Not Assigned').replace(/Rajesh V[ae]rma/gi, 'Avishek Das')}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>MONTHLY TARGET</span>
                    <strong style={{ display: 'block', color: '#f59e0b', fontSize: '0.85rem', marginTop: '2px' }}>{t.monthly_target || 'Not Set'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* SUB-TAB 7: EMPLOYEE EXIT & AUTOMATED REASSIGNMENT HANDOVER HUB */}
      {currentSubTab === 'exit_handover' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #ef4444', borderRadius: '16px', padding: windowWidth <= 480 ? '14px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: windowWidth <= 640 ? 'column' : 'row', justifyContent: 'space-between', alignItems: windowWidth <= 640 ? 'flex-start' : 'center', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: windowWidth <= 480 ? '1rem' : '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>📋 Employee Exit & Automated CRM Reassignment Handover Hub</h3>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>When marking an employee as RESIGNED or TERMINATED, reassign all active records while preserving audit history.</p>
            </div>
            <span style={{ background: completedHandovers.includes(currentExitingUser?.id) ? '#22c55e' : '#ef4444', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', alignSelf: windowWidth <= 640 ? 'flex-start' : 'center' }}>
              {completedHandovers.includes(currentExitingUser?.id) ? '✓ REASSIGNMENT FINALIZED' : 'SECURITY PROTOCOL ACTIVE'}
            </span>
          </div>

          <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: windowWidth <= 480 ? '14px' : '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Select Resigning / Exiting Employee:</label>
                <select 
                  value={selectedExitingUserId || currentExitingUser?.id || ''} 
                  onChange={(e) => setSelectedExitingUserId(e.target.value)} 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                >
                  {safeUsers.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.username} ({u.role} - {u.team_name || u.branch_name || 'General Operations'}) {completedHandovers.includes(u.id) ? '[EXITED - 0 RECORDS]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Select Target Reassignment Agent / Manager:</label>
                <select 
                  value={selectedTargetUserId || currentTargetUser?.id || ''} 
                  onChange={(e) => setSelectedTargetUserId(e.target.value)} 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', color: '#4ade80', fontWeight: '800', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
                >
                  {safeUsers.filter((u: any) => u.id !== (currentExitingUser?.id || selectedExitingUserId)).map((u: any) => (
                    <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '14px', borderRadius: '8px', display: 'grid', gridTemplateColumns: windowWidth <= 480 ? 'repeat(2, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', padding: '10px', borderRadius: '8px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>PENDING CUSTOMERS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: exitingStats.customers === 0 ? '#64748b' : (isLight ? '#0f172a' : '#ffffff'), margin: '4px 0 0 0' }}>{exitingStats.customers} Records</h4>
              </div>
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', padding: '10px', borderRadius: '8px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>ACTIVE LEADS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: exitingStats.leads === 0 ? '#64748b' : '#38bdf8', margin: '4px 0 0 0' }}>{exitingStats.leads} Leads</h4>
              </div>
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', padding: '10px', borderRadius: '8px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>UPCOMING SITE VISITS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: exitingStats.visits === 0 ? '#64748b' : '#fbbf24', margin: '4px 0 0 0' }}>{exitingStats.visits} Visits</h4>
              </div>
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', padding: '10px', borderRadius: '8px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block' }}>ACTIVE BOOKINGS</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: exitingStats.bookings === 0 ? '#64748b' : '#4ade80', margin: '4px 0 0 0' }}>{exitingStats.bookings} Booking{exitingStats.bookings !== 1 ? 's' : ''}</h4>
              </div>
            </div>

            <button
              onClick={handleExecuteExitHandover}
              disabled={completedHandovers.includes(currentExitingUser?.id)}
              style={{
                background: completedHandovers.includes(currentExitingUser?.id) ? (isLight ? '#cbd5e1' : '#334155') : '#ef4444',
                color: completedHandovers.includes(currentExitingUser?.id) ? (isLight ? '#64748b' : '#94a3b8') : '#ffffff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '0.85rem',
                cursor: completedHandovers.includes(currentExitingUser?.id) ? 'not-allowed' : 'pointer',
                alignSelf: windowWidth <= 640 ? 'stretch' : 'flex-end',
                width: windowWidth <= 640 ? '100%' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {completedHandovers.includes(currentExitingUser?.id)
                ? '✓ Reassignment Finalized (0 Active Records)'
                : 'Execute Employee Exit & Reassign All CRM Records'}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB: ASSIGNED PROPERTY ADVISOR */}
      {currentSubTab === 'assigned_property_advisors' && (
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
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setAssignForm(f => ({ ...f, advisorId: adv.id }));
                              setShowAssignPropertyModal(true);
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            + Add Property
                          </button>
                        )}
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
                              {isSuperAdmin && (
                                <button
                                  onClick={() => handleRemovePropertyFromAdvisor(adv.id, prop.code)}
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                                  title="Unassign Property"
                                >
                                  Remove
                                </button>
                              )}
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
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto', padding: windowWidth <= 640 ? '16px' : '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                    const allProps = (properties && Array.isArray(properties) && properties.length > 0) ? properties : [];

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
                  placeholder="e.g. Property Title / Project Name"
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
                    placeholder="e.g. Property Code"
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

      {/* 1. ENTERPRISE USER PROVISIONING & EDIT MODAL (BLUE ENTERPRISE THEME) */}
      {showUserModalInternal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 20, 40, 0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#0f1d38', border: isLight ? '1px solid #cbd5e1' : '1.5px solid #1e3a8a', borderRadius: '16px', width: '100%', maxWidth: '740px', maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(2, 132, 199, 0.25)' }}>
            
            {/* MODAL HEADER */}
            <div style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} color="#f59e0b" style={{ transform: 'rotate(-45deg)' }} /> {editingUser ? 'Edit Enterprise Employee Account' : 'Provision New Enterprise Employee Account'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                  Provision user credentials, login security, role assignment, and organizational hierarchy.
                </p>
              </div>
              <button 
                onClick={() => { setShowUserModalInternal(false); setEditingUser(null); }}
                style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleSaveUserSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* SYSTEM EMPLOYEE USER ID BANNER */}
              <div style={{
                background: isLight ? '#f1f5f9' : '#0c1b36',
                border: isLight ? '1px solid #cbd5e1' : '1.5px solid #0284c7',
                borderRadius: '12px',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.05em', color: '#38bdf8', textTransform: 'uppercase' }}>
                    System Employee User ID (Auto-Generated)
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#38bdf8', marginTop: '2px', letterSpacing: '0.02em' }}>
                    {editingUser ? (editingUser.id || 'USR-01') : `USR-${String((users || []).length + 1).padStart(2, '0')}`}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.03em'
                }}>
                  <Check size={14} /> AUTO-GENERATED & UNIQUE
                </div>
              </div>

              {/* 1. IDENTITY & LOGIN CREDENTIALS */}
              <div style={{
                background: isLight ? '#f8fafc' : '#0d1d3a',
                border: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8' }}>
                  1. Identity & Login Credentials
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.full_name}
                      onChange={(e) => setUserForm(f => ({ ...f, full_name: e.target.value, username: f.username || e.target.value }))}
                      placeholder="e.g. Avishek Das"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="avishek@swaramayi.info"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Account Password *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showUserModalPassword ? 'text' : 'password'}
                        value={userForm.password}
                        onChange={(e) => setUserForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••••••"
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 36px 9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowUserModalPassword(!showUserModalPassword)}
                        style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: 0 }}
                      >
                        {showUserModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Mobile Contact Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.mobile}
                      onChange={(e) => setUserForm(f => ({ ...f, mobile: e.target.value }))}
                      placeholder="+91 00000 00000"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Official Designation
                  </label>
                  <input
                    type="text"
                    value={userForm.designation}
                    onChange={(e) => setUserForm(f => ({ ...f, designation: e.target.value }))}
                    placeholder="Managing Director & Founder"
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                  />
                </div>
              </div>

              {/* 2. ROLE SCOPE & PERMISSION ACCESS LEVEL */}
              <div style={{
                background: isLight ? '#f8fafc' : '#0d1d3a',
                border: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8' }}>
                  2. Role Scope & Permission Access Level
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    System Access Role (7 Active Enterprise Roles) *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm(f => ({ ...f, role: e.target.value }))}
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}
                  >
                    <option value="SUPER_ADMIN">OWNER / SUPER ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="BRANCH_MANAGER">BRANCH MANAGER</option>
                    <option value="PROPERTY_MANAGEMENT">PROPERTY MANAGEMENT</option>
                    <option value="SALES_MANAGEMENT">SALES MANAGEMENT</option>
                    <option value="SALES_EMPLOYEE">SALES EMPLOYEE</option>
                    <option value="TELECALLER">TELECALLER</option>
                    {safeCustomRoles.filter((r: any) => !['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'PROPERTY_MANAGEMENT', 'SALES_MANAGEMENT', 'SALES_EMPLOYEE', 'TELECALLER'].includes(r.key)).map((r: any) => (
                      <option key={r.key} value={r.key}>{r.name || r.key}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. ORGANIZATION & BRANCH PROFILE DETAILS */}
              <div style={{
                background: isLight ? '#f8fafc' : '#0d1d3a',
                border: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8' }}>
                  3. Organization & Branch Profile Details
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Assigned Branch *
                    </label>
                    <select
                      value={userForm.branch_name}
                      onChange={(e) => setUserForm(f => ({ ...f, branch_name: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}
                    >
                      {localBranches.length > 0 ? (
                        localBranches.map((b: any) => {
                          const bName = b.branch_name || b.name || 'Head Office (Kolkata)';
                          return (
                            <option key={b.id || bName} value={bName}>{bName}</option>
                          );
                        })
                      ) : (
                        <>
                          <option value="Head Office (Kolkata)">Head Office (Kolkata)</option>
                          <option value="South Kolkata Branch">South Kolkata Branch</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Department / Unit *
                    </label>
                    <select
                      value={userForm.department}
                      onChange={(e) => setUserForm(f => ({ ...f, department: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}
                    >
                      <option value="Executive Board">Executive Board</option>
                      <option value="Sales Operations">Sales Operations</option>
                      <option value="Client Acquisition & Brokerage">Client Acquisition & Brokerage</option>
                      <option value="Property Management & Inventory">Property Management & Inventory</option>
                      <option value="Customer Relations & Billing">Customer Relations & Billing</option>
                      <option value="Accounts & Legal Administration">Accounts & Legal Administration</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Assigned Team *
                    </label>
                    <select
                      value={userForm.team_name}
                      onChange={(e) => setUserForm(f => ({ ...f, team_name: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}
                    >
                      <option value="Corporate Leadership Squad">Corporate Leadership Squad</option>
                      <option value="Head Office Sales Squad">Head Office Sales Squad</option>
                      <option value="South Kolkata Growth Team">South Kolkata Growth Team</option>
                      {localTeams.filter((t: any) => !['Corporate Leadership Squad', 'Head Office Sales Squad', 'South Kolkata Growth Team'].includes(t.team_name)).map((t: any) => (
                        <option key={t.id || t.team_name} value={t.team_name}>{t.team_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Reporting Manager *
                    </label>
                    <select
                      value={userForm.manager_name}
                      onChange={(e) => setUserForm(f => ({ ...f, manager_name: e.target.value }))}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}
                    >
                      <option value="Avishek Das (Super Admin)">Avishek Das (Super Admin)</option>
                      <option value="Punita Roy Chowdhury (Admin)">Punita Roy Chowdhury (Admin)</option>
                      <option value="Self">Self</option>
                      {users.filter((u: any) => u.full_name && !['Avishek Das', 'Punita Roy Chowdhury'].includes(u.full_name)).map((u: any) => (
                        <option key={u.id} value={`${u.full_name} (${u.role || 'Staff'})`}>
                          {u.full_name} ({u.role || 'Staff'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. GRANULAR ACTION PERMISSIONS & PRIVILEGES (8 STYLED INTERACTIVE CARDS) */}
              <div style={{
                background: isLight ? '#f8fafc' : '#0d1d3a',
                border: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8' }}>
                    4. Granular Action Permissions & Privileges
                  </div>
                  <span style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    RBAC Security Matrix
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: '12px'
                }}>
                  {/* 1. View */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_view: !f.permissions?.perm_view } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_view) ? 'rgba(2, 132, 199, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_view) ? '#0284c7' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={16} color="#38bdf8" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>View</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_view)}
                        onChange={() => {}}
                        style={{ accentColor: '#0284c7', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      View Records & System Data
                    </div>
                  </div>

                  {/* 2. Create */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_create: !f.permissions?.perm_create } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_create) ? 'rgba(16, 185, 129, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_create) ? '#10b981' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} color="#34d399" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>Create</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_create)}
                        onChange={() => {}}
                        style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      Create New Records
                    </div>
                  </div>

                  {/* 3. Edit */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_edit: !f.permissions?.perm_edit } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_edit) ? 'rgba(245, 158, 11, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_edit) ? '#f59e0b' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Edit3 size={16} color="#fbbf24" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>Edit</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_edit)}
                        onChange={() => {}}
                        style={{ accentColor: '#f59e0b', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      Modify Existing Records
                    </div>
                  </div>

                  {/* 4. Delete */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_delete: !f.permissions?.perm_delete } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_delete) ? 'rgba(239, 68, 68, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_delete) ? '#ef4444' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trash2 size={16} color="#f87171" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>Delete</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_delete)}
                        onChange={() => {}}
                        style={{ accentColor: '#ef4444', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      Remove / Purge Data
                    </div>
                  </div>

                  {/* 5. Export */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_export: !f.permissions?.perm_export } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_export) ? 'rgba(139, 92, 246, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_export) ? '#8b5cf6' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={16} color="#a78bfa" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>Export</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_export)}
                        onChange={() => {}}
                        style={{ accentColor: '#8b5cf6', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      Download CSV / PDF Reports
                    </div>
                  </div>

                  {/* 6. Approve */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_approve: !f.permissions?.perm_approve } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_approve) ? 'rgba(6, 182, 212, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_approve) ? '#06b6d4' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} color="#22d3ee" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>Approve</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_approve)}
                        onChange={() => {}}
                        style={{ accentColor: '#06b6d4', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      Approve Workflows & Requests
                    </div>
                  </div>

                  {/* 7. Price Change */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_price_change: !f.permissions?.perm_price_change } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_price_change) ? 'rgba(236, 72, 153, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_price_change) ? '#ec4899' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sliders size={16} color="#f472b6" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>Price Change</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_price_change)}
                        onChange={() => {}}
                        style={{ accentColor: '#ec4899', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      Override Prices / Rates
                    </div>
                  </div>

                  {/* 8. Brokerage */}
                  <div
                    onClick={() => setUserForm(f => ({ ...f, permissions: { ...f.permissions, perm_brokerage: !f.permissions?.perm_brokerage } }))}
                    style={{
                      background: Boolean(userForm.permissions?.perm_brokerage) ? 'rgba(249, 115, 22, 0.18)' : (isLight ? '#ffffff' : '#08142b'),
                      border: `1.5px solid ${Boolean(userForm.permissions?.perm_brokerage) ? '#f97316' : (isLight ? '#cbd5e1' : '#1e3a8a')}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} color="#fb923c" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>Brokerage</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(userForm.permissions?.perm_brokerage)}
                        onChange={() => {}}
                        style={{ accentColor: '#f97316', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.73rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.25 }}>
                      Brokerage & Commission Governance
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL ACTIONS FOOTER (MATCHES IMAGE 4) */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', paddingTop: '10px', paddingBottom: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setShowUserModalInternal(false); setEditingUser(null); }}
                  style={{
                    background: isLight ? '#f1f5f9' : '#0c1a36',
                    color: isLight ? '#0f172a' : '#ffffff',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel & Exit
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 28px',
                    borderRadius: '8px',
                    fontWeight: '900',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>💾</span> {editingUser ? 'Save & Update User Account' : 'Save & Provision User Account'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. ENTERPRISE BRANCH OFFICE CREATION & EDIT MODAL */}
      {showBranchModalInternal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 18, 36, 0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#0f1d38', border: isLight ? '1px solid #cbd5e1' : '1.5px solid #1e3a8a', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: isLight ? '0 25px 60px rgba(0,0,0,0.15)' : '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(2, 132, 199, 0.25)' }}>
            
            {/* MODAL HEADER */}
            <div style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏢 {editingBranchId ? 'Edit Enterprise Branch' : 'Register New Enterprise Branch'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                  Expand company regional footprint & assign branch management leadership.
                </p>
              </div>
              <button 
                onClick={() => { setShowBranchModalInternal(false); setEditingBranchId(null); }}
                style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleSaveBranchSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Branch Office Name *</label>
                <input
                  type="text"
                  required
                  value={branchForm.branch_name}
                  onChange={(e) => setBranchForm(f => ({ ...f, branch_name: e.target.value }))}
                  placeholder="e.g. Banjara Hills Branch"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>City Location *</label>
                  <select
                    value={branchForm.city}
                    onChange={(e) => setBranchForm(f => ({ ...f, city: e.target.value }))}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  >
                    <option value="Kolkata">Kolkata</option>
                    <option value="Howrah">Howrah</option>
                    <option value="Bidhannagar">Bidhannagar</option>
                    <option value="Rajarhat / Newtown">Rajarhat / Newtown</option>
                    <option value="North 24 Parganas">North 24 Parganas</option>
                    <option value="South 24 Parganas">South 24 Parganas</option>
                    <option value="Hooghly">Hooghly</option>
                    <option value="Durgapur">Durgapur</option>
                    <option value="Siliguri">Siliguri</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Assigned Branch Manager *</label>
                  <select
                    value={branchForm.manager_name}
                    onChange={(e) => setBranchForm(f => ({ ...f, manager_name: e.target.value }))}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  >
                    <option value="Avishek Das (Super Admin)">Avishek Das (Super Admin)</option>
                    <option value="Punita Roy Chowdhury">Punita Roy Chowdhury</option>
                    <option value="Subhankar Mondal">Subhankar Mondal</option>
                    <option value="Chayan Kundu">Chayan Kundu</option>
                    {safeUsers && safeUsers.map((u: any) => {
                      const label = u.role ? `${u.full_name} (${u.role})` : u.full_name;
                      if (['Avishek Das (Super Admin)', 'Punita Roy Chowdhury', 'Subhankar Mondal', 'Chayan Kundu'].includes(label) || ['Avishek Das (Super Admin)', 'Punita Roy Chowdhury', 'Subhankar Mondal', 'Chayan Kundu'].includes(u.full_name)) return null;
                      return <option key={u.id || u.full_name} value={u.full_name}>{label}</option>;
                    })}
                    {branchForm.manager_name && !['Avishek Das (Super Admin)', 'Punita Roy Chowdhury', 'Subhankar Mondal', 'Chayan Kundu'].includes(branchForm.manager_name) && !safeUsers.some((u: any) => u.full_name === branchForm.manager_name) && (
                      <option value={branchForm.manager_name}>{branchForm.manager_name}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Physical Office Address</label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Camac Street, Park Street, Kolkata - 700017"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Assigned Teams (Comma Separated)</label>
                <input
                  type="text"
                  value={branchForm.assigned_teams}
                  onChange={(e) => setBranchForm(f => ({ ...f, assigned_teams: e.target.value }))}
                  placeholder="Corporate Leadership Squad"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Annual Branch Target Revenue</label>
                <input
                  type="text"
                  value={branchForm.target_revenue}
                  onChange={(e) => setBranchForm(f => ({ ...f, target_revenue: e.target.value }))}
                  placeholder="₹5,00,00,000"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                />
              </div>

              {/* MODAL ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', paddingTop: '18px' }}>
                <button
                  type="button"
                  onClick={() => { setShowBranchModalInternal(false); setEditingBranchId(null); }}
                  style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '10px 22px', borderRadius: '8px', fontWeight: '800', fontSize: '0.83rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '0.83rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {editingBranchId ? '💾 Save & Update Branch' : '🖊️ Create & Provision Branch'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 3. SALES TEAM SQUAD CREATION & EDIT MODAL */}
      {showTeamModalInternal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 18, 36, 0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#0f1d38', border: isLight ? '1px solid #cbd5e1' : '1.5px solid #1e3a8a', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: isLight ? '0 25px 60px rgba(0,0,0,0.15)' : '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(2, 132, 199, 0.25)' }}>
            
            {/* MODAL HEADER */}
            <div style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  👥 {editingTeamId ? 'Edit Sales Team / Squad' : 'Create Sales Team / Squad'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                  Organize executives into high-performance sales squads & assign team leads.
                </p>
              </div>
              <button 
                onClick={() => { setShowTeamModalInternal(false); setEditingTeamId(null); }}
                style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleSaveTeamSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Sales Team Name *</label>
                <input
                  type="text"
                  required
                  value={teamForm.team_name}
                  onChange={(e) => setTeamForm(f => ({ ...f, team_name: e.target.value }))}
                  placeholder="e.g. Sales Team Gamma"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Parent Branch *</label>
                  <select
                    value={teamForm.branch_name}
                    onChange={(e) => setTeamForm(f => ({ ...f, branch_name: e.target.value }))}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  >
                    {localBranches.map((b: any) => (
                      <option key={b.id || b.branch_name} value={b.branch_name}>{b.branch_name}</option>
                    ))}
                    {!localBranches.some((b: any) => b.branch_name === 'Head Office (Kolkata)') && (
                      <option value="Head Office (Kolkata)">Head Office (Kolkata)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Department Unit *</label>
                  <select
                    value={teamForm.department}
                    onChange={(e) => setTeamForm(f => ({ ...f, department: e.target.value }))}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  >
                    <option value="Sales Management">Sales Management</option>
                    <option value="Sales Operations">Sales Operations</option>
                    <option value="Property Management">Property Management</option>
                    <option value="Telecalling Unit">Telecalling Unit</option>
                    <option value="Branch Operations">Branch Operations</option>
                    <option value="Executive Operations">Executive Operations</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Assigned Team Lead *</label>
                  <select
                    value={teamForm.leader_name}
                    onChange={(e) => setTeamForm(f => ({ ...f, leader_name: e.target.value }))}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  >
                    <option value="Avishek Das (Super Admin)">Avishek Das (Super Admin)</option>
                    <option value="Punita Roy Chowdhury">Punita Roy Chowdhury</option>
                    <option value="Subhankar Mondal">Subhankar Mondal</option>
                    <option value="Chayan Kundu">Chayan Kundu</option>
                    {safeUsers && safeUsers.map((u: any) => {
                      const label = u.role ? `${u.full_name} (${u.role})` : u.full_name;
                      if (['Avishek Das (Super Admin)', 'Punita Roy Chowdhury', 'Subhankar Mondal', 'Chayan Kundu'].includes(label) || ['Avishek Das (Super Admin)', 'Punita Roy Chowdhury', 'Subhankar Mondal', 'Chayan Kundu'].includes(u.full_name)) return null;
                      return <option key={u.id || u.full_name} value={u.full_name}>{label}</option>;
                    })}
                    {teamForm.leader_name && !['Avishek Das (Super Admin)', 'Punita Roy Chowdhury', 'Subhankar Mondal', 'Chayan Kundu'].includes(teamForm.leader_name) && !safeUsers.some((u: any) => u.full_name === teamForm.leader_name) && (
                      <option value={teamForm.leader_name}>{teamForm.leader_name}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '6px' }}>Monthly Sales Unit Target</label>
                  <input
                    type="text"
                    value={teamForm.monthly_target}
                    onChange={(e) => setTeamForm(f => ({ ...f, monthly_target: e.target.value }))}
                    placeholder="15 Property Units"
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#08142b', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #1e3a8a', paddingTop: '18px' }}>
                <button
                  type="button"
                  onClick={() => { setShowTeamModalInternal(false); setEditingTeamId(null); }}
                  style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '10px 22px', borderRadius: '8px', fontWeight: '800', fontSize: '0.83rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '0.83rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {editingTeamId ? '💾 Save & Update Team Squad' : '🚀 Create & Provision Team Squad'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. SECURITY AUDIT INSPECTION MODAL (EXACT SAME AS PROFILEVIEW / IMAGE 3) */}
      {securityAuditModal && securityAuditModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: isLight ? '#ffffff' : '#0f172a',
            border: isLight ? '1px solid #cbd5e1' : '1px solid #1e293b',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '920px',
            maxHeight: '92vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.65)'
          }}>
            
            {/* MODAL HEADER */}
            <div style={{
              padding: '20px 24px',
              borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      🛡️ Security Audit & Access Control Logs
                    </h3>
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.18)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: '800'
                    }}>
                      ● LIVE AUDIT ACTIVE
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '3px 0 0 0' }}>
                    Real-time tamper-evident compliance logs & authentication history for <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{securityAuditModal.user?.full_name || securityAuditModal.user?.username || 'Staff'}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSecurityAuditModal(null)}
                style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* USER BANNER CARD */}
              <div style={{
                background: isLight ? '#f8fafc' : '#1e293b',
                border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '1.1rem'
                  }}>
                    {securityAuditModal.user?.full_name
                      ? securityAuditModal.user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                      : (securityAuditModal.user?.username || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      {securityAuditModal.user?.full_name || securityAuditModal.user?.username}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '3px 0 0 0' }}>
                      UserID: <strong style={{ color: '#38bdf8' }}>{securityAuditModal.user?.id || 'USR-01'}</strong> • Role: <strong style={{ color: '#f59e0b' }}>{securityAuditModal.user?.role || 'STAFF'}</strong> • Branch: <strong>{securityAuditModal.user?.branch_name || (localBranches[0]?.branch_name || 'Head Office (Kolkata)')}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '800' }}>
                    🔒 256-Bit SSL Encrypted
                  </span>
                  <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '800' }}>
                    🛡️ ISO/IEC 27001 Compliant
                  </span>
                </div>
              </div>

              {/* 4-COLUMN METRICS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ background: isLight ? '#f8fafc' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block' }}>TOTAL LOGGED EVENTS</span>
                  <strong style={{ display: 'block', fontSize: '1.25rem', color: '#38bdf8', marginTop: '4px' }}>{auditLogs.length} Records</strong>
                </div>
                <div style={{ background: isLight ? '#f8fafc' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block' }}>SECURITY RISK LEVEL</span>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#22c55e', marginTop: '6px' }}>🟢 ZERO / LOW RISK</strong>
                </div>
                <div style={{ background: isLight ? '#f8fafc' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block' }}>AUTHENTICATION TYPE</span>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: '#f59e0b', marginTop: '8px' }}>
                    {securityAuditModal.user?.role === 'SUPER_ADMIN' ? '🔑 Hardware Key 2FA' : '🔑 RBAC Multi-Factor'}
                  </strong>
                </div>
                <div style={{ background: isLight ? '#f8fafc' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block' }}>LAST AUDIT TIME</span>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: isLight ? '#0f172a' : '#ffffff', marginTop: '6px' }}>Just Now</strong>
                </div>
              </div>

              {/* CATEGORY FILTER TABS */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {['ALL', 'SECURITY', 'AUTHENTICATION', 'DATABASE', 'ACCESS_CONTROL', 'USER_MANAGEMENT'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setAuditCategoryFilter(cat)}
                    style={{
                      background: auditCategoryFilter === cat ? '#0284c7' : (isLight ? '#f1f5f9' : '#1e293b'),
                      color: auditCategoryFilter === cat ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                      border: auditCategoryFilter === cat ? 'none' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* SEARCH INPUT */}
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Search audit actions or IP..."
                  style={{
                    width: '100%',
                    background: isLight ? '#f8fafc' : '#1e293b',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                    color: isLight ? '#0f172a' : '#ffffff',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* AUDIT LOGS TABLE */}
              {(() => {
                const filtered = auditLogs
                  .filter(l => auditCategoryFilter === 'ALL' || l.category === auditCategoryFilter)
                  .filter(l => !auditSearchQuery || JSON.stringify(l).toLowerCase().includes(auditSearchQuery.toLowerCase()));

                if (auditLoading) {
                  return (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#38bdf8', fontWeight: '800', fontSize: '0.85rem' }}>
                      ⏳ Fetching real-time audit records from database...
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div style={{ padding: '30px', textAlign: 'center', color: isLight ? '#94a3b8' : '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      No security audit log records found matching your filters.
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: 'auto', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: isLight ? '#f8fafc' : '#1e293b', color: isLight ? '#64748b' : '#94a3b8', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                          <th style={{ padding: '10px 14px' }}>Timestamp</th>
                          <th style={{ padding: '10px 14px' }}>Action Code</th>
                          <th style={{ padding: '10px 14px' }}>Category & Resource</th>
                          <th style={{ padding: '10px 14px' }}>IP & Device Info</th>
                          <th style={{ padding: '10px 14px' }}>Audit Details</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((log: any) => (
                          <tr key={log.id} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b' }}>
                            <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }}>
                              {log.timestamp}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                background: 'rgba(2, 132, 199, 0.15)',
                                color: '#38bdf8',
                                border: '1px solid rgba(2, 132, 199, 0.3)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: '800',
                                fontSize: '0.74rem',
                                whiteSpace: 'nowrap'
                              }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{log.category}</strong>
                              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>{log.resource}</span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700', display: 'block' }}>{log.ip}</span>
                              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>{log.device}</span>
                            </td>
                            <td style={{ padding: '10px 14px', color: isLight ? '#334155' : '#cbd5e1', maxWidth: '320px' }}>
                              {log.details}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <span style={{
                                background: 'rgba(34, 197, 94, 0.15)',
                                color: '#4ade80',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: '800'
                              }}>
                                {log.status || 'VERIFIED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* MODAL ACTIONS BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b', paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleExportAuditCSV}
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={15} /> Export Audit Log (CSV)
                  </button>
                  <button
                    onClick={() => fetchLiveAuditLogs()}
                    style={{ background: isLight ? '#f1f5f9' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={14} className={auditLoading ? 'animate-spin' : ''} /> Refresh Live Audit
                  </button>
                </div>
                <button
                  onClick={() => setSecurityAuditModal(null)}
                  style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Close Audit Inspection
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
