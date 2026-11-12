import mongoose, { Schema, Document } from 'mongoose';

export interface IManager extends Document {
  username: 'hiren' | 'suresh';
  displayName: string;
  passwordHash: string;
  signatureImage: string;
  role: 'manager';
  phone?: string;
  email?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ManagerSchema = new Schema<IManager>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      enum: ['hiren', 'suresh'],
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    signatureImage: {
      type: String,
      required: true,
      default: 'suresh.png',
    },
    role: {
      type: String,
      enum: ['manager'],
      default: 'manager',
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Manager = mongoose.model<IManager>('Manager', ManagerSchema);
