import { BrandTranslationSchema } from 'src/routes/brand/brand-translation/brand-translation.model';
import { z } from 'zod';

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().url().max(1000),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type BrandType = z.infer<typeof BrandSchema>;

const BrandIncludeTranslationSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
});
export type BrandIncludeTranslationType = z.infer<typeof BrandIncludeTranslationSchema>;

export const GetBrandsResSchema = z.object({
  data: z.array(BrandIncludeTranslationSchema),
  totalItems: z.number(),
  page: z.number(), // Số trang hiện tại
  limit: z.number(), // Số item trên 1 trang
  totalPages: z.number(), // Tổng số trang
});
export type GetBrandsResType = z.infer<typeof GetBrandsResSchema>;

export const GetBrandParamsSchema = z
  .object({
    brandId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetBrandDetailResSchema = BrandIncludeTranslationSchema;
export type GetBrandDetailResType = z.infer<typeof GetBrandDetailResSchema>;

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  logo: true,
}).strict();
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>;

export const UpdateBrandBodySchema = CreateBrandBodySchema;
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>;
