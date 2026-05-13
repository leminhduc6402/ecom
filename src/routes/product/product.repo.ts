import { Injectable } from '@nestjs/common';
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
} from 'src/routes/product/product.model';
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ProductRepo {
  constructor(private readonly prismaService: PrismaService) {}

  // Get all product with pagination
  async list(query: GetProductsQueryType, languageId: string): Promise<GetProductsResType> {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.product.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
    ]);
    return {
      data,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    };
  }

  // Get product by id
  findById(id: number, languageId: string): Promise<GetProductDetailResType | null> {
    return this.prismaService.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
        },
        skus: {
          where: { deletedAt: null },
        },
        brand: {
          include: {
            brandTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
            },
          },
        },
        categories: {
          where: { deletedAt: null },
          include: {
            categoryTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
            },
          },
        },
      },
    });
  }

  // Create product
  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateProductBodyType;
  }): Promise<GetProductDetailResType> {
    const { skus, categories, ...productData } = data;
    return this.prismaService.product.create({
      data: {
        createdById,
        ...productData,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus.map((sku) => ({ ...sku, createdById })),
          },
        },
      },
      include: {
        productTranslations: {
          where: { deletedAt: null },
        },
        skus: {
          where: { deletedAt: null },
        },
        brand: {
          include: {
            brandTranslations: {
              where: { deletedAt: null },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });
  }

  // Update product by id
  async update({
    id,
    updatedById,
    data,
  }: {
    id: number;
    updatedById: number;
    data: UpdateProductBodyType;
  }): Promise<ProductType> {
    const { skus: dataSkus, categories, ...productData } = data;
    // 1. Lấy danh sách SKU hiện tại tồn tại trong DB
    const existingSKU = await this.prismaService.sKU.findMany({
      where: {
        productId: id,
        deletedAt: null,
      },
    });

    // 2. Tìm các SKU cần xóa (case: tồn tại trong db nhưng không có trong payload)
    const skusToDelete = existingSKU.filter((sku) => dataSkus.every((s) => s.value !== sku.value));
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id);

    // 3. Mapping Id vào trong data payload
    const skuWithId = dataSkus.map((dataSku) => {
      const existing = existingSKU.find((s) => s.value === dataSku.value);
      return {
        ...dataSku,
        id: existing?.id || null,
      };
    });

    // 4. Tìm các sku để cập nhật
    const skusToUpdate = skuWithId.filter((sku) => sku.id !== null);

    // 5. Tìm các sku để thêm mới
    const skusToCreate = skuWithId
      .filter((sku) => sku.id === null)
      .map((sku) => {
        const { id: skuId, ...data } = sku;
        return {
          ...data,
          productId: id,
          createdById: updatedById,
        };
      });

    const [product] = await this.prismaService.$transaction([
      // Cập nhật Product
      this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          updatedById: updatedById,
          ...productData,
          categories: {
            connect: categories.map((category) => ({ id: category })),
          },
        },
      }),

      // Xóa mềm các sku không tồn tại trong payload
      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedAt: new Date(),
          deletedById: updatedById,
        },
      }),

      // Cập nhật các SKU tồn tại trong payload
      ...skusToUpdate.map((sku) => {
        return this.prismaService.sKU.update({
          where: {
            id: sku.id as number,
            deletedAt: null,
          },
          data: {
            value: sku.value,
            stock: sku.stock,
            price: sku.price,
            image: sku.image,
            updatedById: updatedById,
          },
        });
      }),

      // Thêm mới các SKU không có trong DB
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ]);

    return product;
  }

  // Delete product by id
  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<ProductType> {
    if (isHard) {
      const [product] = await Promise.all([
        this.prismaService.product.delete({
          where: {
            id,
            deletedAt: null,
          },
        }),
        this.prismaService.sKU.deleteMany({
          where: {
            productId: id,
            deletedAt: null,
          },
        }),
      ]);
      return product;
    } else {
      const now = new Date();
      const [product] = await Promise.all([
        this.prismaService.product.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: now,
            deletedById,
          },
        }),
        this.prismaService.sKU.updateMany({
          where: {
            productId: id,
            deletedAt: null,
          },
          data: {
            deletedAt: now,
            deletedById,
          },
        }),
      ]);
      return product;
    }
  }
}
