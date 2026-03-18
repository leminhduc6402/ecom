import z from 'zod';
import { UserStatus } from '../constants/auth.constant';

export const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string().min(3).max(100),
  phoneNumber: z.string().min(10).max(15),
  password: z.string().min(6).max(100),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE]),
  roleId: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  deletedById: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
});
export type UserType = z.infer<typeof UserSchema>;
