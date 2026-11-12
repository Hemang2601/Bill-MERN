import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessSettings extends Document {
  businessName: string;
  tagline: string;
  specialization: string;
  phone1: string;
  phone2?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pinCode: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  invoicePrefix: string;
  invoiceTerms: string[];
  defaultNotes?: string;
  isGstEnabled: boolean;
  defaultGstRate: number;
}

const BusinessSettingsSchema = new Schema<IBusinessSettings>(
  {
    businessName: {
      type: String,
      required: true,
      default: 'SHREE SHAKTI ELECTRIC',
    },
    tagline: {
      type: String,
      default: 'Specialist in: All types of Electric Fitting, Wiring & Maintenance',
    },
    specialization: {
      type: String,
      default: 'All types of Electric Fitting, Wiring & Maintenance',
    },
    phone1: {
      type: String,
      required: true,
      default: '+91 90336 60384',
    },
    phone2: {
      type: String,
      default: '+91 70160 55176',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      default: 'Shreeji Complex, Main Bazar',
    },
    city: {
      type: String,
      default: 'Rajkot',
    },
    state: {
      type: String,
      default: 'Gujarat',
    },
    stateCode: {
      type: String,
      default: '24',
    },
    pinCode: {
      type: String,
      default: '360001',
    },
    gstin: {
      type: String,
      trim: true,
      default: '',
    },
    pan: {
      type: String,
      trim: true,
      default: '',
    },
    bankName: {
      type: String,
      default: 'State Bank of India',
    },
    accountNumber: {
      type: String,
      default: '',
    },
    ifscCode: {
      type: String,
      default: '',
    },
    branch: {
      type: String,
      default: 'Rajkot Main Branch',
    },
    upiId: {
      type: String,
      default: '',
    },
    invoicePrefix: {
      type: String,
      default: 'SE',
    },
    invoiceTerms: {
      type: [String],
      default: [
        'E & O.E',
        '1. Goods once sold will not be taken back.',
        '2. Guarantee / warranty as per manufacturer policy.',
        '3. Subject to local jurisdiction only.',
      ],
    },
    defaultNotes: {
      type: String,
      default: 'Thank you for your business! For any technical assistance or electrical service inquiries, contact us anytime.',
    },
    isGstEnabled: {
      type: Boolean,
      default: true,
    },
    defaultGstRate: {
      type: Number,
      default: 18,
    },
  },
  {
    timestamps: true,
  }
);

export const BusinessSettings = mongoose.model<IBusinessSettings>(
  'BusinessSettings',
  BusinessSettingsSchema
);
