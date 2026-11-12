import { Request, Response } from 'express';
import { BusinessSettings } from '../models/BusinessSettings.js';
import { logAudit } from '../services/auditService.js';

export async function getSettings(req: Request, res: Response): Promise<void> {
  let settings = await BusinessSettings.findOne();
  if (!settings) {
    settings = await BusinessSettings.create({});
  }
  res.json({
    success: true,
    data: settings,
  });
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;

  let settings = await BusinessSettings.findOne();
  if (!settings) {
    settings = new BusinessSettings(req.body);
  } else {
    Object.assign(settings, req.body);
  }
  await settings.save();

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'UPDATE_SETTINGS',
    entityType: 'SETTINGS',
    details: { businessName: settings.businessName },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Business settings updated successfully',
    data: settings,
  });
}
