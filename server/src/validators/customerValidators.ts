import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').trim(),
  mobile: z.string().min(5, 'Valid phone number is required').trim(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().default('Gujarat'),
  pinCode: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const customerUpdateSchema = customerSchema.partial();
