import z from 'zod';
import { UserStatus } from '../constants/auth.constant';
import { RoleSchema } from './shared-role.model';
import { PermissionSchema } from './shared-permission.model';

export const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string().min(3).max(100),
  phoneNumber: z.string(),
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

export const GetUserProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true,
      }),
    ),
  }),
});
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;

export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>;
