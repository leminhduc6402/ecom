import { ProductTranslationSchema } from 'src/routes/product/product-translation/product-translation.model';
import { ProductSchema } from 'src/shared/models/shared-product.model';
import { SKUSchema } from 'src/shared/models/shared-sku.model';
import z from 'zod';

export const CartItemSchema = z.object({
  id: z.number(),
  userId: z.number().int().positive(),
  skuId: z.number(),
  quantity: z.number(),

  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CartItemType = z.infer<typeof CartItemSchema>;

export const GetCartItemParamsSchema = z.object({
  cartItemId: z.number().int().positive(),
});
export type GetCartItemParams = z.infer<typeof GetCartItemParamsSchema>;

export const CartItemDetailSchema = CartItemSchema.extend({
  sku: SKUSchema.extend({
    product: ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  }),
});

export const GetCartResSchema = z.object({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type GetCartResType = z.infer<typeof GetCartResSchema>;

export const AddToCartBodySchema = CartItemSchema.omit({
  skuId: true,
  quantity: true,
}).strict();
export type AddToCartBody = z.infer<typeof AddToCartBodySchema>;

export const UpdateCartItemBodySchema = AddToCartBodySchema;
export type UpdateCartItemBody = z.infer<typeof UpdateCartItemBodySchema>;

export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()),
  })
  .strict();
export type DeleteCartBody = z.infer<typeof DeleteCartBodySchema>;
