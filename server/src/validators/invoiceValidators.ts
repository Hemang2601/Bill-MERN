import { z } from 'zod';

export const invoiceItemInputSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1, 'Item name is required').trim(),
  description: z.string().optional().or(z.literal('')),
  hsn: z.string().optional().or(z.literal('')),
  quantity: z.number().min(0.01, 'Quantity must be greater than zero'),
  unit: z.enum(['Nos', 'Pcs', 'Mtr', 'Coil', 'Set', 'Box', 'Pkt']).default('Nos'),
  rate: z.number().min(0, 'Rate cannot be negative'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  gstRate: z.number().min(0).max(100).optional().default(18),
});

export const invoiceCustomerInputSchema = z.object({
  customerId: z.string().optional(),
  name: z.string().min(1, 'Customer name is required').trim(),
  mobile: z.string().min(5, 'Valid mobile number is required').trim(),
  email: z.string().email().optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().default('Gujarat'),
  pinCode: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
});

export const createInvoiceSchema = z.object({
  customer: invoiceCustomerInputSchema,
  items: z.array(invoiceItemInputSchema).min(1, 'At least one item is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional().or(z.literal('')),
  placeOfSupply: z.string().default('Gujarat (24)'),
  isInterState: z.boolean().default(false),
  amountPaid: z.number().min(0).default(0),
  notes: z.string().optional().or(z.literal('')),
  terms: z.array(z.string()).optional(),
});

export const updateInvoiceSchema = z.object({
  customer: invoiceCustomerInputSchema,
  items: z.array(invoiceItemInputSchema).min(1, 'At least one item is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional().or(z.literal('')),
  placeOfSupply: z.string().default('Gujarat (24)'),
  isInterState: z.boolean().default(false),
  amountPaid: z.number().min(0).default(0),
  notes: z.string().optional().or(z.literal('')),
  terms: z.array(z.string()).optional(),
});
