import { BadRequestException, NotFoundException } from '@nestjs/common';

export const OutOfStockSKUException = new BadRequestException('Error.OutOfStockSKU');
export const NotFoundCartItemException = new NotFoundException('Error.NotFoundCartItem');
export const SKUNotBelongToShopException = new BadRequestException('Error.SKUNotBelongToShop');
