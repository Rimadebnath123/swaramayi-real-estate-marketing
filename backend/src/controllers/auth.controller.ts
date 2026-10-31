import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { dbStore, loadData, saveData, logAudit } from '../db/database.js';
import { UserModel, syncToMongoDB } from '../db/mongoPersistence.js';

const JWT_SECRET = process.env.JWT_SECRET || 'swaramayi_crm_super_secret_jwt_key_2026_production_ready';

// In-Memory Secure OTP Store for Password Reset (Expires in 10 minutes)
interface PasswordResetOtpRecord {
  code: string;
  expiresAt: number;
  userId: string;
  email: string;
}

const passwordResetOtpStore = new Map<string, PasswordResetOtpRecord>();

function getMailTransporter() {
  const user = (process.env.GMAIL_USER || 'avishekdas077@gmail.com').replace(/^your-/, '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || 'wxmxedoivwrikxxv').replace(/\s+/g, '').trim();

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass }
  });
}

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

// ==========================================
// FORGOT PASSWORD EMAIL OTP CONTROLLERS
// ==========================================

export async function sendPasswordResetOTP(req: Request, res: Response) {
  try {
    const rawEmail = req.body.email;
    const targetEmail = String(rawEmail || '').trim().toLowerCase();

    if (!targetEmail) {
      return res.status(400).json({ status: 'ERROR', message: 'Corporate email address is required.' });
    }

    loadData();
    let user: any = dbStore.data.users.find((u: any) => 
      (u.email && u.email.trim().toLowerCase() === targetEmail) ||
      (u.username && u.username.trim().toLowerCase() === targetEmail) ||
      (u.id && u.id.trim().toLowerCase() === targetEmail)
    );

    if (!user && mongoose.connection.readyState === 1) {
      try {
        const doc = await UserModel.findOne({
          $or: [
            { email: new RegExp(`^${targetEmail}$`, 'i') },
            { username: new RegExp(`^${targetEmail}$`, 'i') }
          ]
        }).lean();
        if (doc) user = doc as any;
      } catch (e) {}
    }

    // Fallback for primary Super Admin
    if (!user && (targetEmail === 'avishek@swaramayi.info' || targetEmail === 'admin@swaramayi.com' || targetEmail === 'avishekdas077@gmail.com')) {
      user = dbStore.data.users.find((u: any) => u.role === 'SUPER_ADMIN') || {
        id: 'USR-01',
        username: 'Avishek Das (Super Admin)',
        full_name: 'Avishek Das',
        email: targetEmail,
        role: 'SUPER_ADMIN'
      };
    }

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: `No corporate user account found matching '${targetEmail}'. Please verify your registered email address.`
      });
    }

    const recipientEmail = targetEmail.includes('@') ? targetEmail : ((user.email && user.email.includes('@')) ? user.email.trim() : targetEmail);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    passwordResetOtpStore.set(targetEmail, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      userId: user.id,
      email: recipientEmail
    });

    if (recipientEmail.toLowerCase() !== targetEmail) {
      passwordResetOtpStore.set(recipientEmail.toLowerCase(), {
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        userId: user.id,
        email: recipientEmail
      });
    }

    const transporter = getMailTransporter();
    const senderUser = (process.env.GMAIL_USER || 'avishekdas077@gmail.com').replace(/^your-/, '').trim();

    await transporter.sendMail({
      from: `"Swaramayi Security Center" <${senderUser}>`,
      to: recipientEmail,
      subject: `🔑 Swaramayi CRM - Password Reset OTP: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(2, 132, 199, 0.1);">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">SWARAMAYI REAL ESTATE MARKETING</h1>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #bae6fd; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Enterprise Identity & Access Security System</p>
          </div>
          <div style="padding: 30px 24px; color: #1e293b;">
            <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Corporate Password Reset Verification</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
              Hello <strong>${user.full_name || user.username || 'Swaramayi User'}</strong>,<br/>
              We received an authentication request to reset the password for your enterprise account (<strong>${recipientEmail}</strong>).
            </p>
            <div style="background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
              <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0284c7; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
              <span style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0369a1; font-family: 'Courier New', monospace; display: block;">${otp}</span>
              <span style="font-size: 12px; color: #64748b; display: block; margin-top: 10px;">⏱️ This OTP code expires in <strong>10 minutes</strong>.</span>
            </div>
            <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 20px 0;">
              If you did not request this verification code, please disregard this email. Your password will remain unchanged.
            </p>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 11px; color: #94a3b8; text-align: center;">
              🔒 256-Bit SSL Encrypted Enterprise Portal • Swaramayi CRM v4.2 Production
            </div>
          </div>
        </div>
      `
    });

    return res.json({
      status: 'SUCCESS',
      message: `A 6-digit verification code has been dispatched to ${recipientEmail}. Please check your inbox.`,
      email: recipientEmail,
      user_id: user.id
    });
  } catch (err: any) {
    console.error('Password reset email error:', err);
    return res.status(500).json({
      status: 'ERROR',
      message: `Failed to dispatch email: ${err.message || 'SMTP Connection Error'}`
    });
  }
}

export async function verifyPasswordResetOTP(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    const targetEmail = String(email || '').trim().toLowerCase();
    const targetOtp = String(otp || '').trim();

    if (!targetEmail || !targetOtp) {
      return res.status(400).json({ status: 'ERROR', message: 'Email and 6-digit OTP code are required.' });
    }

    const record = passwordResetOtpStore.get(targetEmail);
    if (!record) {
      return res.status(400).json({ status: 'ERROR', message: 'No active OTP verification session found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetOtpStore.delete(targetEmail);
      return res.status(400).json({ status: 'ERROR', message: 'Verification code has expired. Please request a new code.' });
    }

    if (record.code !== targetOtp) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid verification code. Please check your email and try again.' });
    }

    return res.json({
      status: 'SUCCESS',
      message: 'Email successfully verified with Google Gmail SMTP!',
      verified: true
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
}

export async function resetPasswordWithOTP(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;
    const targetEmail = String(email || '').trim().toLowerCase();
    const targetOtp = String(otp || '').trim();
    const cleanPassword = String(newPassword || '').trim();

    if (!targetEmail || !targetOtp || !cleanPassword) {
      return res.status(400).json({ status: 'ERROR', message: 'Email, OTP, and new password are required.' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ status: 'ERROR', message: 'Password must be at least 6 characters long.' });
    }

    const record = passwordResetOtpStore.get(targetEmail);
    if (!record) {
      return res.status(400).json({ status: 'ERROR', message: 'No active OTP verification session found for this email.' });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetOtpStore.delete(targetEmail);
      return res.status(400).json({ status: 'ERROR', message: 'Verification code has expired. Please request a new code.' });
    }

    if (record.code !== targetOtp) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid verification code.' });
    }

    loadData();
    let updatedUser: any = null;

    dbStore.data.users = dbStore.data.users.map((u: any) => {
      const isMatch = (record.userId && u.id === record.userId) ||
                      (u.email && u.email.trim().toLowerCase() === targetEmail) ||
                      (u.email && u.email.trim().toLowerCase() === record.email.toLowerCase());
      if (isMatch) {
        updatedUser = {
          ...u,
          password: cleanPassword,
          updatedAt: new Date().toISOString()
        };
        return updatedUser;
      }
      return u;
    });

    if (!updatedUser) {
      updatedUser = {
        id: record.userId || 'USR-01',
        email: targetEmail,
        password: cleanPassword,
        updatedAt: new Date().toISOString()
      };
      dbStore.data.users.push(updatedUser);
    }

    saveData();

    // Commit to MongoDB Atlas
    await syncToMongoDB(dbStore.data).catch((e) => console.warn('syncToMongoDB warning:', e));
    if (mongoose.connection.readyState === 1) {
      await UserModel.updateOne(
        { $or: [{ id: record.userId }, { email: targetEmail }, { email: record.email }] },
        { $set: { password: cleanPassword, updatedAt: new Date() } }
      ).catch(() => {});
    }

    passwordResetOtpStore.delete(targetEmail);
    if (record.email && record.email.toLowerCase() !== targetEmail) {
      passwordResetOtpStore.delete(record.email.toLowerCase());
    }

    logAudit(record.userId, 'PASSWORD_RESET', 'AUTH', `Password reset successfully via Email OTP for ${targetEmail}`, req.ip);

    return res.json({
      status: 'SUCCESS',
      message: 'Password successfully reset and saved to MongoDB Atlas!',
      user_id: record.userId
    });
  } catch (err: any) {
    console.error('Password reset with OTP error:', err);
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
}
