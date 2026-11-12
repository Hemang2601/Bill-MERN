import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Manager } from '../models/Manager.js';
import { logAudit } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  const manager = await Manager.findOne({ username: username.toLowerCase() });
  if (!manager || !manager.isActive) {
    res.status(401).json({
      success: false,
      error: 'Invalid manager credentials or account deactivated.',
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, manager.passwordHash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      error: 'Invalid password or PIN.',
    });
    return;
  }

  manager.lastLogin = new Date();
  await manager.save();

  // Set session
  req.session.manager = {
    id: manager._id.toString(),
    username: manager.username,
    displayName: manager.displayName,
    signatureImage: manager.signatureImage,
    role: manager.role,
  };

  await logAudit({
    managerId: manager._id,
    managerUsername: manager.username,
    managerDisplayName: manager.displayName,
    action: 'LOGIN',
    entityType: 'AUTH',
    entityId: manager._id.toString(),
    details: { username: manager.username },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info({ username: manager.username }, 'Manager logged in successfully');

  res.json({
    success: true,
    message: `Welcome back, ${manager.displayName}!`,
    data: {
      id: manager._id,
      username: manager.username,
      displayName: manager.displayName,
      signatureImage: manager.signatureImage,
      role: manager.role,
      phone: manager.phone,
      email: manager.email,
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const current = req.session.manager;

  if (current) {
    await logAudit({
      managerId: current.id,
      managerUsername: current.username,
      managerDisplayName: current.displayName,
      action: 'LOGOUT',
      entityType: 'AUTH',
      entityId: current.id,
      details: {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, 'Error destroying session');
      res.status(500).json({ success: false, error: 'Could not log out' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.session || !req.session.manager) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const manager = await Manager.findById(req.session.manager.id).select('-passwordHash');
  if (!manager || !manager.isActive) {
    req.session.destroy(() => {});
    res.status(401).json({ success: false, error: 'Account not active or found' });
    return;
  }

  res.json({
    success: true,
    data: {
      id: manager._id,
      username: manager.username,
      displayName: manager.displayName,
      signatureImage: manager.signatureImage,
      role: manager.role,
      phone: manager.phone,
      email: manager.email,
      lastLogin: manager.lastLogin,
    },
  });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const { currentPassword, newPassword } = req.body;

  const manager = await Manager.findById(current.id);
  if (!manager) {
    res.status(404).json({ success: false, error: 'Manager account not found' });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, manager.passwordHash);
  if (!isMatch) {
    res.status(400).json({ success: false, error: 'Current password is incorrect' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  manager.passwordHash = await bcrypt.hash(newPassword, salt);
  await manager.save();

  await logAudit({
    managerId: manager._id,
    managerUsername: manager.username,
    managerDisplayName: manager.displayName,
    action: 'CHANGE_PASSWORD',
    entityType: 'AUTH',
    entityId: manager._id.toString(),
    details: {},
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({ success: true, message: 'Password changed successfully' });
}
