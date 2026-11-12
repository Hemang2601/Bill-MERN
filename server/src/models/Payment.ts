import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod } from '../types/index.js';

export interface IPayment extends Document {
  invoiceId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  recordedBy: {
    id: mongoose.Types.ObjectId;
    username: 'hiren' | 'suresh';
    displayName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'],
      default: 'CASH',
      index: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: String,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      id: { type: Schema.Types.ObjectId, ref: 'Manager', required: true },
      username: { type: String, required: true, enum: ['hiren', 'suresh'] },
      displayName: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
