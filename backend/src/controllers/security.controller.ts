import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbStore, loadData, saveData, logAudit, generateID, UserRecord } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

// 1. Emergency System Lockdown Toggle
export async function toggleLockdown(req: AuthRequest, res: Response) {
  const { is_locked } = req.body;
  const statusStr = is_locked ? 'true' : 'false';

  loadData();
  dbStore.data.system_settings.is_lockdown_active = statusStr;
  saveData();

  logAudit(req.user?.id || null, 'EMERGENCY_LOCKDOWN', 'SECURITY', `System emergency lockdown set to ${statusStr}`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: is_locked ? 'EMERGENCY SYSTEM LOCKDOWN ACTIVATED. Non-SuperAdmin access blocked.' : 'Emergency lockdown lifted.',
    is_lockdown_active: is_locked
  });
}

// 2. Organization Structure & Branch/Team Management
export async function getOrganizationStructure(req: AuthRequest, res: Response) {
  loadData();
  return res.json({
    status: 'SUCCESS',
    data: {
      branches: dbStore.data.branches || [],
      teams: dbStore.data.teams || [],
      users: dbStore.data.users || []
    }
  });
}

export async function createBranch(req: AuthRequest, res: Response) {
  const { branch_name, city, address, branch_manager_name } = req.body;
  if (!branch_name || !city) {
    return res.status(400).json({ status: 'ERROR', message: 'branch_name and city are required.' });
  }

  loadData();
  const newBranch = {
    id: `BR-${Date.now()}`,
    branch_code: `SRM-BR-0${(dbStore.data.branches?.length || 0) + 1}`,
    branch_name,
    city,
    address: address || `${city} Main Office`,
    branch_manager_name: branch_manager_name || 'Avishek Das',
    created_at: new Date().toISOString().split('T')[0]
  };

  if (!dbStore.data.branches) dbStore.data.branches = [];
  dbStore.data.branches.push(newBranch);
  saveData();

  logAudit(req.user?.id || null, 'CREATE_BRANCH', 'ORGANIZATION', `Created branch ${branch_name} in ${city}`, req.ip);

  return res.status(201).json({ status: 'SUCCESS', message: `Branch ${branch_name} created successfully.`, data: newBranch });
}

export async function createTeam(req: AuthRequest, res: Response) {
  const { team_name, branch_name, team_lead_name } = req.body;
  if (!team_name) {
    return res.status(400).json({ status: 'ERROR', message: 'team_name is required.' });
  }

  loadData();
  const newTeam = {
    id: `TEAM-${Date.now()}`,
    team_name,
    branch_id: 'BR-HYD-KON',
    branch_name: branch_name || 'Kondapur Branch',
    team_lead_name: team_lead_name || 'Rahul Sharma',
    members_count: 1
  };

  if (!dbStore.data.teams) dbStore.data.teams = [];
  dbStore.data.teams.push(newTeam);
  saveData();

  logAudit(req.user?.id || null, 'CREATE_TEAM', 'ORGANIZATION', `Created sales team ${team_name}`, req.ip);

  return res.status(201).json({ status: 'SUCCESS', message: `Team ${team_name} created successfully.`, data: newTeam });
}

// 3. User & Employee Directory Management
export async function getUsers(req: AuthRequest, res: Response) {
  loadData();
  return res.json({
    status: 'SUCCESS',
    count: dbStore.data.users.length,
    data: dbStore.data.users
  });
}

export async function createUser(req: AuthRequest, res: Response) {
  const { username, full_name, email, mobile, role, branch_name, department, team_name, manager_name } = req.body;

  if (!username || !email || !role) {
    return res.status(400).json({ status: 'ERROR', message: 'username, email, and role are required.' });
  }

  loadData();
  const newUser: UserRecord = {
    id: `USR-0${dbStore.data.users.length + 1}`,
    username,
    full_name: full_name || username,
    email,
    mobile: mobile || '+91 98490 00000',
    role: role || 'SALES_EXEC',
    branch_name: branch_name || 'Kondapur Branch',
    department: department || 'Sales',
    team_name: team_name || 'Sales Team Alpha',
    manager_name: manager_name || 'Rahul Sharma',
    is_active: true,
    user_status: 'ACTIVE',
    created_at: new Date().toISOString().split('T')[0]
  };

  dbStore.data.users.unshift(newUser);
  saveData();

  logAudit(req.user?.id || null, 'CREATE_USER', 'SECURITY', `Created user ${username} (${role})`, req.ip);

  return res.status(201).json({
    status: 'SUCCESS',
    message: `User ${username} created successfully with role ${role}.`,
    data: newUser
  });
}

export async function updateUserStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { user_status, is_active } = req.body;

  loadData();
  const user = dbStore.data.users.find(u => u.id === id || u.username === id);
  if (!user) {
    return res.status(404).json({ status: 'ERROR', message: 'User not found.' });
  }

  if (user_status) user.user_status = user_status;
  if (typeof is_active === 'boolean') user.is_active = is_active;

  saveData();

  logAudit(req.user?.id || null, 'UPDATE_USER_STATUS', 'SECURITY', `Updated user ${user.username} status to ${user_status || is_active}`, req.ip);

  return res.json({ status: 'SUCCESS', message: `User ${user.username} status updated to ${user.user_status}.`, data: user });
}

// 4. Employee Exit & Database Handover Reassignment
export async function reassignEmployeeExit(req: AuthRequest, res: Response) {
  const { resigning_user_id, new_assigned_agent_name, new_assigned_agent_id } = req.body;

  loadData();
  const user = dbStore.data.users.find(u => u.id === resigning_user_id || u.username === resigning_user_id);
  if (user) {
    user.is_active = false;
    user.user_status = 'RESIGNED';
  }

  // Reassign customers & leads
  let reassignedCustomersCount = 0;
  dbStore.data.customers.forEach(c => {
    if (c.assigned_employee_id === resigning_user_id || c.assigned_employee_name === user?.full_name || c.assigned_employee_name === user?.username) {
      c.assigned_employee_id = new_assigned_agent_id || 'USR-05';
      c.assigned_employee_name = new_assigned_agent_name || 'Priya Nair (Sales Exec)';
      reassignedCustomersCount++;
    }
  });

  saveData();

  logAudit(req.user?.id || null, 'EMPLOYEE_EXIT_HANDOVER', 'SECURITY', `Employee ${user?.username || resigning_user_id} marked RESIGNED. ${reassignedCustomersCount} records reassigned to ${new_assigned_agent_name}`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: `Employee exit completed. ${reassignedCustomersCount} active CRM records reassigned to ${new_assigned_agent_name}.`,
    reassigned_count: reassignedCustomersCount
  });
}

// 5. Role Permission Matrix & Custom Role Engine
export async function getRolePermissions(req: AuthRequest, res: Response) {
  loadData();
  return res.json({
    status: 'SUCCESS',
    data: dbStore.data.role_permissions
  });
}

export async function updateRolePermission(req: AuthRequest, res: Response) {
  const { role_key, perm_key, value } = req.body;

  loadData();
  const rp = dbStore.data.role_permissions.find(r => r.role_key === role_key);
  if (rp) {
    (rp as any)[perm_key] = value;
    saveData();
    logAudit(req.user?.id || null, 'UPDATE_PERMISSION', 'SECURITY', `Updated permission ${perm_key} for role ${role_key} to ${value}`, req.ip);
    return res.json({ status: 'SUCCESS', message: `Permission ${perm_key} for ${role_key} set to ${value}.`, data: rp });
  }

  return res.status(404).json({ status: 'ERROR', message: 'Role permission not found.' });
}

export async function createCustomRole(req: AuthRequest, res: Response) {
  const { role_name, data_scope } = req.body;
  if (!role_name) {
    return res.status(400).json({ status: 'ERROR', message: 'role_name is required.' });
  }

  loadData();
  const roleKey = role_name.toUpperCase().replace(/\s+/g, '_');
  const newRole = {
    id: `ROLE-${Date.now()}`,
    role_key: roleKey,
    role_name,
    data_scope: data_scope || 'ASSIGNED_DATA',
    permissions: []
  };

  dbStore.data.role_permissions.push(newRole as any);
  saveData();

  logAudit(req.user?.id || null, 'CREATE_CUSTOM_ROLE', 'SECURITY', `Created custom role ${role_name} (${roleKey})`, req.ip);

  return res.status(201).json({ status: 'SUCCESS', message: `Custom role ${role_name} created successfully.`, data: newRole });
}

// 6. Universal Approval Engine
export async function getApprovalRequests(req: AuthRequest, res: Response) {
  loadData();
  return res.json({
    status: 'SUCCESS',
    data: dbStore.data.approval_requests
  });
}

export async function respondApprovalRequest(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { action } = req.body; // 'APPROVE' or 'REJECT'

  loadData();
  const request = dbStore.data.approval_requests.find(r => r.id === id || r.request_code === id);
  if (!request) {
    return res.status(404).json({ status: 'ERROR', message: 'Approval request not found.' });
  }

  request.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  request.approved_by_name = req.user?.username || 'Super Admin';
  request.approved_at = new Date().toLocaleString();

  saveData();

  logAudit(req.user?.id || null, `APPROVAL_${action}`, 'SECURITY', `Approval request ${request.request_code} set to ${request.status}`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: `Request ${request.request_code} ${request.status}.`,
    data: request
  });
}

// 7. Active Sessions & Security Risk Alerts
export async function getActiveSessions(req: AuthRequest, res: Response) {
  loadData();
  return res.json({
    status: 'SUCCESS',
    sessions: dbStore.data.active_sessions
  });
}

export async function revokeSession(req: AuthRequest, res: Response) {
  const { id } = req.params;

  loadData();
  const session = dbStore.data.active_sessions.find(s => s.id === id);
  if (session) {
    session.status = 'REVOKED';
    saveData();
    logAudit(req.user?.id || null, 'REVOKE_SESSION', 'SECURITY', `Revoked active session ${id} for ${session.username}`, req.ip);
    return res.json({ status: 'SUCCESS', message: `Session ${id} for ${session.username} revoked.` });
  }

  return res.status(404).json({ status: 'ERROR', message: 'Session not found.' });
}

export async function getAuditLogs(req: AuthRequest, res: Response) {
  loadData();
  const logs = dbStore.data.audit_logs.map(a => {
    const user = dbStore.data.users.find(u => u.id === a.user_id);
    return {
      ...a,
      username: user ? user.username : null,
      full_name: user ? user.full_name : null
    };
  });

  return res.json({
    status: 'SUCCESS',
    data: logs
  });
}

export async function getFraudAlerts(req: AuthRequest, res: Response) {
  loadData();
  return res.json({
    status: 'SUCCESS',
    data: dbStore.data.security_alerts
  });
}

// 8. Delete & Sync Operations (Database & MongoDB Atlas)
export async function deleteBranch(req: AuthRequest, res: Response) {
  const { id } = req.params;
  loadData();
  dbStore.data.branches = (dbStore.data.branches || []).filter(b => b.id !== id && b.branch_name !== id);
  saveData();
  logAudit(req.user?.id || null, 'DELETE_BRANCH', 'ORGANIZATION', `Deleted branch ${id}`, req.ip);
  return res.json({ status: 'SUCCESS', message: `Branch ${id} deleted successfully from database.` });
}

export async function deleteTeam(req: AuthRequest, res: Response) {
  const { id } = req.params;
  loadData();
  dbStore.data.teams = (dbStore.data.teams || []).filter(t => t.id !== id && t.team_name !== id);
  saveData();
  logAudit(req.user?.id || null, 'DELETE_TEAM', 'ORGANIZATION', `Deleted team ${id}`, req.ip);
  return res.json({ status: 'SUCCESS', message: `Team ${id} deleted successfully from database.` });
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  if (id === 'USR-01' || id === 'admin') {
    return res.status(400).json({ status: 'ERROR', message: 'Primary Super Admin user cannot be deleted.' });
  }
  loadData();
  dbStore.data.users = (dbStore.data.users || []).filter(u => u.id !== id && u.username !== id && u.full_name !== id);
  saveData();
  logAudit(req.user?.id || null, 'DELETE_USER', 'SECURITY', `Deleted user ${id}`, req.ip);
  return res.json({ status: 'SUCCESS', message: `User ${id} deleted successfully from database.` });
}

export async function syncSecurityData(req: AuthRequest, res: Response) {
  const { branches, teams, users } = req.body;
  loadData();
  if (Array.isArray(branches)) dbStore.data.branches = branches;
  if (Array.isArray(teams)) dbStore.data.teams = teams;
  if (Array.isArray(users)) dbStore.data.users = users;
  saveData();
  return res.json({ status: 'SUCCESS', message: 'Security & Organization structure synced to database and MongoDB Atlas.' });
}

