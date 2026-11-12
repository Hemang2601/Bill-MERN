import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  managerId: mongoose.Types.ObjectId;
  managerUsername: 'hiren' | 'suresh';
  managerDisplayName: string;
  action: string;
  entityType: 'INVOICE' | 'PAYMENT' | 'CUSTOMER' | 'PRODUCT' | 'SETTINGS' | 'AUTH';
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
      index: true,
    },
    managerUsername: {
      type: String,
      required: true,
      enum: ['hiren', 'suresh'],
      index: true,
    },
    managerDisplayName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['INVOICE', 'PAYMENT', 'CUSTOMER', 'PRODUCT', 'SETTINGS', 'AUTH'],
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
