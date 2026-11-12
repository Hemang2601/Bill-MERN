import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export interface AuditParams {
  managerId: any;
  managerUsername: 'hiren' | 'suresh';
  managerDisplayName: string;
  action: string;
  entityType: 'INVOICE' | 'PAYMENT' | 'CUSTOMER' | 'PRODUCT' | 'SETTINGS' | 'AUTH';
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    // Sanitize details: strip password, secret, token fields
    const safeDetails = { ...(params.details || {}) };
    delete safeDetails.password;
    delete safeDetails.passwordHash;
    delete safeDetails.sessionSecret;
    delete safeDetails.token;

    await AuditLog.create({
      managerId: params.managerId,
      managerUsername: params.managerUsername,
      managerDisplayName: params.managerDisplayName,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: safeDetails,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to persist audit log entry');
  }
}
