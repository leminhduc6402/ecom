import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionBodyType,
} from './permission.model';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(pagination: GetPermissionsQueryType) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: { deletedAt: null },
      }),
      this.prismaService.permission.findMany({
        where: { deletedAt: null },
        skip,
        take,
      }),
    ]);
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    };
  }

  findById(id: number) {
    return this.prismaService.permission.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async create({ createdById, data }: { createdById: number; data: CreatePermissionBodyType }) {
    return await this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  update({ id, data, updatedById }: { id: number; data: UpdatePermissionBodyType; updatedById: number }) {
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
      include: {
        roles: true,
      },
    });
  }

  delete(
    {
      id,
      deletedById,
    }: {
      id: number;
      deletedById: number;
    },
    isHard?: boolean,
  ) {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id,
          },
          include: {
            roles: true,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
          include: {
            roles: true,
          },
        });
  }
}
