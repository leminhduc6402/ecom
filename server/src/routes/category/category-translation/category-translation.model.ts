import { CategoryTranslationSchema } from 'src/shared/models/shared-category-translation.model';
import { z } from 'zod';

export type CategoryTranslationType = z.infer<typeof CategoryTranslationSchema>;
export const GetCategoryTranslationParamsSchema = z
  .object({
    categoryTranslationId: z.coerce.number().int().positive(),
  })
  .strict();
export const GetCategoryTranslationDetailResSchema = CategoryTranslationSchema;
export type GetCategoryTranslationDetailResType = z.infer<typeof GetCategoryTranslationDetailResSchema>;

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  categoryId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();
export type CreateCategoryTranslationBodyType = z.infer<typeof CreateCategoryTranslationBodySchema>;

export const UpdateCategoryTranslationBodySchema = CreateCategoryTranslationBodySchema;
export type UpdateCategoryTranslationBodyType = z.infer<typeof UpdateCategoryTranslationBodySchema>;
