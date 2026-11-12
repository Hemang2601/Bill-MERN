import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  mobile: string;
  email?: string;
  billingAddress?: string;
  city?: string;
  state: string;
  pinCode?: string;
  gstin?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    billingAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: 'Rajkot',
    },
    state: {
      type: String,
      trim: true,
      default: 'Gujarat',
    },
    pinCode: {
      type: String,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ name: 'text', mobile: 'text', city: 'text' });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
