import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog.js';

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const manager = req.query.manager as string;
  const entityType = req.query.entityType as string;
  const action = req.query.action as string;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (manager) query.managerUsername = manager.toLowerCase();
  if (entityType) query.entityType = entityType;
  if (action) query.action = action;

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
