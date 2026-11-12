import { z } from 'zod';

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().min(0.01, 'Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']).default('CASH'),
  referenceNumber: z.string().optional().or(z.literal('')),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Payment date must be in YYYY-MM-DD format'),
  notes: z.string().optional().or(z.literal('')),
});
