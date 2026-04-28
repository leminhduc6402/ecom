import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateRoleBodyType, GetRolesQueryType, GetRolesResType, RoleType, UpdateRoleBodyType } from './role.model';

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(pagination: GetRolesQueryType): Promise<GetRolesResType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: { deletedAt: null },
      }),
      this.prismaService.role.findMany({
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

  findById(id: number): Promise<RoleType | null> {
    return this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
      include: {
        permissions: { where: { deletedAt: null } },
      },
    });
  }

  async create({ createdById, data }: { createdById: number; data: CreateRoleBodyType }): Promise<RoleType> {
    return await this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateRoleBodyType;
    updatedById: number;
  }): Promise<RoleType> {
    // Kiểm tra permission đã bị xóa (mềm) thì không cho phép cập nhật
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: { id: { in: data.permissionIds } },
      });
      const deletedPermission = permissions.filter((permission) => permission.deletedAt !== null);
      if (deletedPermission.length > 0) {
        const deletedPermissionIds = deletedPermission.map((permission) => permission.id).join(', ');
        throw new Error(`Permission with id:${deletedPermissionIds} has been deleted`);
      }
    }

    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: true,
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
  ): Promise<RoleType> {
    return isHard
      ? this.prismaService.role.delete({
          where: {
            id,
          },
        })
      : this.prismaService.role.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        });
  }
}
