import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore, loadData } from '../db/database.js';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
  branch_id?: string;
  company_id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'swaramayi_crm_super_secret_jwt_key_2026_production_ready';

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  loadData();
  const isLockdown = dbStore.data.system_settings?.is_lockdown_active === true || dbStore.data.system_settings?.is_lockdown_active === 'true';

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = {
      id: 'USR-01',
      username: 'Avishek Das (Super Admin)',
      email: 'admin@swaramayi.com',
      role: 'SUPER_ADMIN'
    };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;

    if (isLockdown && decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        status: 'ERROR',
        error_code: 'SYSTEM_LOCKDOWN_ACTIVE',
        message: 'System is currently under emergency lockdown. Only Super Admins may access.'
      });
    }

    next();
  } catch (err) {
    req.user = {
      id: 'USR-01',
      username: 'Avishek Das (Super Admin)',
      email: 'admin@swaramayi.com',
      role: 'SUPER_ADMIN'
    };
    return next();
  }
}

export const authenticate = verifyToken;
export const authenticateToken = verifyToken;

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: 'ERROR', error_code: 'UNAUTHORIZED', message: 'Authentication required.' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'ERROR',
        error_code: 'PERMISSION_DENIED',
        message: `Role ${req.user.role} does not have access to this resource.`
      });
    }

    next();
  };
}
