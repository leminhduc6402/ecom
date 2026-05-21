import { CategoryIncludeTranslationSchema, CategorySchema } from 'src/shared/models/shared-category.model';
import { z } from 'zod';

export type CategoryType = z.infer<typeof CategorySchema>;
export type CategoryIncludeTranslationType = z.infer<typeof CategoryIncludeTranslationSchema>;

export const GetAllCategoriesResSchema = z.object({
  data: z.array(CategorySchema),
  totalItems: z.number(),
});
export type GetAllCategoriesResType = z.infer<typeof GetAllCategoriesResSchema>;

export const GetAllCategoriesQuerySchema = z.object({
  parentCategoryId: z.coerce.number().int().positive().optional(),
});
export type GetAllCategoriesQueryType = z.infer<typeof GetAllCategoriesQuerySchema>;

export const GetCategoryParamsSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
  })
  .strict();
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>;

export const GetCategoryDetailResSchema = CategoryIncludeTranslationSchema;
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>;

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict();
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;

export const UpdateCategoryBodySchema = CreateCategoryBodySchema;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
