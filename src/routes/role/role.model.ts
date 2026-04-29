import z from 'zod';
import { RoleSchema } from 'src/shared/models/shared-role.model';
import { PermissionSchema } from 'src/shared/models/shared-permission.model';

// export type RoleType = z.infer<typeof RoleSchema>;

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>;

export const GetRolesResSchema = z.object({
  data: z.array(RoleSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type GetRolesResType = z.infer<typeof GetRolesResSchema>;

export const GetRolesQuerySchema = z
  .object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
  })
  .strict();
export type GetRolesQueryType = z.infer<typeof GetRolesQuerySchema>;

export const GetRoleParamsSchema = z
  .object({
    roleId: z.coerce.number(),
  })
  .strict();
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>;

export const GetRoleDetailResSchema = RoleWithPermissionsSchema;
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>;

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).strict();
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;

export const CreateRoleResSchema = RoleSchema;
export type CreateRoleResType = z.infer<typeof CreateRoleResSchema>;

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
})
  .extend({
    permissionIds: z.array(z.number()),
  })
  .strict();
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>;
