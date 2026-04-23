import { HTTPMethod } from 'src/shared/constants/role.constant';
import z from 'zod';

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().max(1000),
  path: z.string().max(500),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  module: z.string().max(500),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  // deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type PermissionType = z.infer<typeof PermissionSchema>;

export const GetPermissionsResSchema = z.object({
  data: z.array(PermissionSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>;

export const GetPermissionsQuerySchema = z
  .object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
  })
  .strict();
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>;

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number(),
  })
  .strict();
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>;

export const GetPermissionDetailResSchema = PermissionSchema;
export type GetPermissionDetailResType = z.infer<typeof GetPermissionDetailResSchema>;

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
  // module: true,
}).strict();
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;

export const UpdatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
  // module: true,
}).strict();
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;
