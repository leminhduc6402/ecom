import { BrandTranslationSchema } from 'src/shared/models/shared-brand-translation.model';
import { z } from 'zod';

export type BrandTranslationType = z.infer<typeof BrandTranslationSchema>;

//Get Brand Translation By ID
export const GetBrandTranslationParamsSchema = z
  .object({
    brandTranslationId: z.coerce.number().int().positive(),
  })
  .strict();
export type GetBrandTranslationParamsType = z.infer<typeof GetBrandTranslationParamsSchema>;

// Brand Translation Detail Response
export const GetBrandTranslationDetailResSchema = BrandTranslationSchema;
export type GetBrandTranslationDetailResType = z.infer<typeof GetBrandTranslationDetailResSchema>;

// Create Brand Translation
export const CreateBrandTranslationBodySchema = BrandTranslationSchema.pick({
  brandId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();
export type CreateBrandTranslationBodyType = z.infer<typeof CreateBrandTranslationBodySchema>;

// Update Brand Translation
export const UpdateBrandTranslationBodySchema = CreateBrandTranslationBodySchema;
export type UpdateBrandTranslationBodyType = z.infer<typeof UpdateBrandTranslationBodySchema>;
