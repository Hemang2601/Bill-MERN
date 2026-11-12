import mongoose, { Schema, Document } from 'mongoose';
import { ProductUnit } from '../types/index.js';

export interface IProduct extends Document {
  name: string;
  sku?: string;
  description?: string;
  category: string;
  unit: ProductUnit;
  sellingPrice: number;
  purchasePrice?: number;
  taxRate: number;
  hsn?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Electrical',
      trim: true,
      index: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ['Nos', 'Pcs', 'Mtr', 'Coil', 'Set', 'Box', 'Pkt'],
      default: 'Nos',
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasePrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 18,
    },
    hsn: {
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

ProductSchema.index({ name: 'text', description: 'text', sku: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
