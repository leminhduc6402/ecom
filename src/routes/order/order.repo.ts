import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { GetOrderListQueryType, GetOrderListResType } from 'src/routes/order/order.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class OrderRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
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
}
