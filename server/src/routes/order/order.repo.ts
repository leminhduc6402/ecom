import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from 'src/generated/prisma/client';
import {
  CannotCancelOrderException,
  NotFoundCartItemException,
  OrderNotFoundException,
  OutOfStockSKUException,
  ProductNotFoundException,
  SKUNotBelongToShopException,
} from 'src/routes/order/order.error';
import { CreateOrderBodyType, CreateOrderResType, GetOrderListQueryType } from 'src/routes/order/order.model';
import { PaymentStatus } from 'src/shared/constants/payment.constant';
import { isNotFoundError } from 'src/shared/helpers';
import { PrismaService } from 'src/shared/services/prisma.service';
import { OrderProducer } from './order.producer';
import { VersionConflictException } from 'src/shared/error';

@Injectable()
export class OrderRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}
  async list(userId: number, query: GetOrderListQueryType) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.OrderWhereInput = {
      userId,
      status,
    };

    const totalItem$ = this.prismaService.order.count({
      where,
    });

    const data$ = await this.prismaService.order.findMany({
      where,
      include: {
        items: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const [data, totalItems] = await Promise.all([data$, totalItem$]);
    return {
      data,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async create(userId: number, body: CreateOrderBodyType) {
    // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
    // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
    // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
    // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
    // 5. Tạo order
    // 6. Xóa cartItem
    const [paymentId, orders] = await this.prismaService.$transaction<[number, CreateOrderResType['orders']]>(
      async (tx) => {
        const allBodyCartItemIds = body.map((item) => item.cartItemIds).flat();
        // const cartItemsForSKUId = await tx.cartItem.findMany({
        //   where: {
        //     id: {
        //       in: allBodyCartItemIds,
        //     },
        //     userId,
        //   },
        //   select: {
        //     skuId: true,
        //   },
        // })
        // const skuIds = cartItemsForSKUId.map((cartItem) => cartItem.skuId)
        // await tx.$queryRaw`SELECT * FROM "SKU" WHERE id IN (${Prisma.join(skuIds)}) FOR UPDATE`
        const cartItems = await tx.cartItem.findMany({
          where: {
            id: {
              in: allBodyCartItemIds,
            },
            userId,
          },
          include: {
            sku: {
              include: {
                product: {
                  include: {
                    productTranslations: true,
                  },
                },
              },
            },
          },
        });

        // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
        if (cartItems.length !== allBodyCartItemIds.length) {
          throw NotFoundCartItemException;
        }

        // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
        const isOutOfStock = cartItems.some((item) => {
          return item.sku.stock < item.quantity;
        });
        if (isOutOfStock) {
          throw OutOfStockSKUException;
        }

        // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
        const isExistNotReadyProduct = cartItems.some(
          (item) =>
            item.sku.product.deletedAt !== null ||
            item.sku.product.publishedAt === null ||
            item.sku.product.publishedAt > new Date(),
        );
        if (isExistNotReadyProduct) {
          throw ProductNotFoundException;
        }

        // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
        const cartItemMap = new Map<number, (typeof cartItems)[0]>();
        cartItems.forEach((item) => {
          cartItemMap.set(item.id, item);
        });
        const isValidShop = body.every((item) => {
          const bodyCartItemIds = item.cartItemIds;
          return bodyCartItemIds.every((cartItemId) => {
            // Neu đã đến bước này thì cartItem luôn luôn có giá trị
            // Vì chúng ta đã so sánh với allBodyCartItems.length ở trên rồi
            const cartItem = cartItemMap.get(cartItemId)!;
            return item.shopId === cartItem.sku.createdById;
          });
        });
        if (!isValidShop) {
          throw SKUNotBelongToShopException;
        }

        // 5. Tạo order và xóa cartItem trong transaction để đảm bảo tính toàn vẹn dữ liệu

        const payment = await tx.payment.create({
          data: {
            status: PaymentStatus.PENDING,
          },
        });
        const orders: CreateOrderResType['orders'] = [];
        for (const item of body) {
          const order = await tx.order.create({
            data: {
              userId,
              status: OrderStatus.PENDING_PAYMENT,
              receiver: item.receiver,
              createdById: userId,
              shopId: item.shopId,
              paymentId: payment.id,
              items: {
                create: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!;
                  return {
                    productName: cartItem.sku.product.name,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    skuId: cartItem.sku.id,
                    skuValue: cartItem.sku.value,
                    quantity: cartItem.quantity,
                    productId: cartItem.sku.product.id,
                    productTranslations: cartItem.sku.product.productTranslations.map((translation) => {
                      return {
                        id: translation.id,
                        name: translation.name,
                        description: translation.description,
                        languageId: translation.languageId,
                      };
                    }),
                  };
                }),
              },
              products: {
                connect: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!;
                  return {
                    id: cartItem.sku.product.id,
                  };
                }),
              },
            },
          });
          orders.push({
            ...order,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            deletedAt: order.deletedAt ? order.deletedAt.toISOString() : null,
          });
        }

        await tx.cartItem.deleteMany({
          where: {
            id: {
              in: allBodyCartItemIds,
            },
          },
        });
        for (const item of cartItems) {
          await tx.sKU
            .update({
              where: {
                id: item.sku.id,
                updatedAt: item.sku.updatedAt, // Đảm bảo không có ai cập nhật SKU trong khi chúng ta đang xử lý
                stock: {
                  gte: item.quantity, // Đảm bảo số lượng tồn kho đủ để trừ
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
            .catch((e) => {
              if (isNotFoundError(e)) {
                throw VersionConflictException;
              }
              throw e;
            });
        }
        await this.orderProducer.addCancelPaymentJob(payment.id);
        return [payment.id, orders];
      },
    );

    return {
      paymentId,
      orders,
    };
  }

  async detail(userId: number, orderId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });
    if (!order) {
      throw OrderNotFoundException;
    }
    return order;
  }

  async cancel(userId: number, orderId: number) {
    try {
      const order = await this.prismaService.order.findUnique({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
      });

      if (!order || order.status !== OrderStatus.PENDING_PAYMENT) {
        throw CannotCancelOrderException;
      }
      const updatedOrder = await this.prismaService.order.update({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        data: {
          status: OrderStatus.CANCELLED,
          updatedById: userId,
        },
      });

      return updatedOrder;
    } catch (error) {
      if (isNotFoundError(error)) {
        throw OrderNotFoundException;
      }
      throw error;
    }
  }
}
