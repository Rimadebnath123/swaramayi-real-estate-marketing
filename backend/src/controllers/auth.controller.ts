import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore, loadData, logAudit } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'swaramayi_crm_super_secret_jwt_key_2026_production_ready';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'ERROR', message: 'Username and password are required.' });
  }

  loadData();
  const user = dbStore.data.users.find(u => u.username === username || u.email === username);

  if (!user) {
    return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials.' });
  }

  if (!user.is_active || user.is_locked) {
    return res.status(403).json({ status: 'ERROR', message: 'Account is locked or inactive. Contact admin.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash || '');
  if (!isMatch) {
    logAudit(user.id, 'LOGIN_FAILED', 'AUTH', `Failed login attempt for username: ${username}`, req.ip);
    return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials.' });
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    branch_id: user.branch_id,
    company_id: user.company_id
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  logAudit(user.id, 'LOGIN_SUCCESS', 'AUTH', `User ${user.username} logged in successfully`, req.ip);

  return res.json({
    status: 'SUCCESS',
    message: 'Authentication successful.',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_mfa_enabled: Boolean(user.is_mfa_enabled)
    }
  });
}

export async function verifyMFA(req: Request, res: Response) {
  const { code, user_id } = req.body;
  if (!code || !user_id) {
    return res.status(400).json({ status: 'ERROR', message: 'Code and user_id are required.' });
  }

  loadData();
  const user = dbStore.data.users.find(u => u.id === user_id || u.username === user_id);
  if (user && (!user.is_mfa_enabled || ((user as any).mfa_code && String((user as any).mfa_code) === String(code)))) {
    return res.json({ status: 'SUCCESS', message: 'MFA Verification successful.' });
  }

  return res.status(400).json({ status: 'ERROR', message: 'Invalid MFA verification code.' });
}

export async function bindDevice(req: Request, res: Response) {
  const { device_uuid } = req.body;
  logAudit((req as any).user?.id || null, 'DEVICE_BIND', 'SECURITY', `Device bound: ${device_uuid}`, req.ip);
  return res.json({
    status: 'SUCCESS',
    message: 'Device fingerprint successfully bound and authorized.',
    data: { device_uuid, bound_at: new Date().toISOString() }
  });
}
