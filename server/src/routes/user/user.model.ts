import { RoleSchema } from 'src/shared/models/shared-role.model';
import { UserSchema } from 'src/shared/models/shared-user.model';
import { z } from 'zod';

export const GetUsersResSchema = z.object({
  data: z.array(
    UserSchema.omit({ password: true, totpSecret: true }).extend({
      role: RoleSchema.pick({
        id: true,
        name: true,
      }),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type GetUsersResType = z.infer<typeof GetUsersResSchema>;

export const GetUsersQuerySchema = z
  .object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
  })
  .strict();
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>;

export const GetUserParamsSchema = z
  .object({
    userId: z.coerce.number(),
  })
  .strict();
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>;

export const GetUserDetailResSchema = UserSchema;
export type GetUserDetailResType = z.infer<typeof GetUserDetailResSchema>;

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  password: true,
  roleId: true,
  status: true,
}).strict();
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;

export const UpdateUserBodySchema = CreateUserBodySchema;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;
