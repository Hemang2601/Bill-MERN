import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  sku: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required').default('Electrical'),
  unit: z.enum(['Nos', 'Pcs', 'Mtr', 'Coil', 'Set', 'Box', 'Pkt']).default('Nos'),
  sellingPrice: z.number().min(0, 'Selling price must be 0 or higher'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative').optional().default(0),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').default(18),
  hsn: z.string().optional().or(z.literal('')),
});

export const productUpdateSchema = productSchema.partial();
