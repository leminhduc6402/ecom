import { Injectable } from '@nestjs/common';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundError, isUniqueConstraintError } from 'src/shared/helpers';
import { ProductTranslationRepo } from 'src/routes/product/product-translation/product-translation.repo';
import { ProductTranslationAlreadyExistsException } from 'src/routes/product/product-translation/product-translation.error';
import {
  CreateProductTranslationBodyType,
  UpdateProductTranslationBodyType,
} from 'src/routes/product/product-translation/product-translation.model';

@Injectable()
export class ProductTranslationService {
  constructor(private productTranslationRepo: ProductTranslationRepo) {}

  async findById(id: number) {
    const product = await this.productTranslationRepo.findById(id);
    if (!product) {
      throw NotFoundRecordException;
    }
    return product;
  }

  async create({ data, createdById }: { data: CreateProductTranslationBodyType; createdById: number }) {
    try {
      return await this.productTranslationRepo.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateProductTranslationBodyType; updatedById: number }) {
    try {
      const product = await this.productTranslationRepo.update({
        id,
        updatedById,
        data,
      });
      return product;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      if (isNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.productTranslationRepo.delete({
        id,
        deletedById,
      });
      return {
        message: 'Delete successfully',
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
