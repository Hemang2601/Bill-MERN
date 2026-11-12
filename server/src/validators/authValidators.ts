import { z } from 'zod';

export const loginSchema = z.object({
  username: z.enum(['hiren', 'suresh'], {
    required_error: 'Please select an authorized manager (Hiren or Suresh)',
    invalid_type_error: 'Unauthorized manager username',
  }),
  password: z.string().min(1, 'Password or PIN is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters'),
});
