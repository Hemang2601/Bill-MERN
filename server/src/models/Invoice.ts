import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '../types/index.js';

export interface IInvoiceItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  hsn?: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface ICustomerSnapshot {
  customerId?: mongoose.Types.ObjectId;
  name: string;
  mobile: string;
  email?: string;
  billingAddress?: string;
  city?: string;
  state: string;
  pinCode?: string;
  gstin?: string;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  placeOfSupply: string;
  isInterState: boolean;
  customer: ICustomerSnapshot;
  items: IInvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  terms?: string[];
  managerId: mongoose.Types.ObjectId;
  managerUsername: 'hiren' | 'suresh';
  managerName: string;
  managerSignature: string;
  pdfPath?: string;
  pdfUrl?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    hsn: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, required: true, default: 'Nos' },
    rate: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxableAmount: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 0, min: 0 },
    cgstAmount: { type: Number, default: 0, min: 0 },
    sgstAmount: { type: Number, default: 0, min: 0 },
    igstAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const CustomerSnapshotSchema = new Schema<ICustomerSnapshot>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    billingAddress: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, required: true, default: 'Gujarat' },
    pinCode: { type: String, trim: true },
    gstin: { type: String, trim: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    dueDate: {
      type: String,
    },
    placeOfSupply: {
      type: String,
      required: true,
      default: 'Gujarat (24)',
    },
    isInterState: {
      type: Boolean,
      default: false,
    },
    customer: {
      type: CustomerSnapshotSchema,
      required: true,
    },
    items: {
      type: [InvoiceItemSchema],
      required: true,
      validate: [(v: IInvoiceItem[]) => v.length > 0, 'At least one invoice item is required'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxableAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCgst: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSgst: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalIgst: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    roundOff: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'UNPAID'],
      default: 'UNPAID',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    terms: {
      type: [String],
      default: [],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
    managerUsername: {
      type: String,
      required: true,
      enum: ['hiren', 'suresh'],
    },
    managerName: {
      type: String,
      required: true,
    },
    managerSignature: {
      type: String,
      required: true,
    },
    pdfPath: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.index({ invoiceNumber: 'text', 'customer.name': 'text', 'customer.mobile': 'text' });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
