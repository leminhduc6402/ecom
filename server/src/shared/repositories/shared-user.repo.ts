import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { UserType } from '../models/shared-user.model';
import { RoleType } from '../models/shared-role.model';
import { PermissionType } from '../models/shared-permission.model';

type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } };

export type WhereUniqueUserType = { id: number } | { email: string };

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return await this.prismaService.user.findFirst({
      where,
    });
  }

  findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findFirst({
      where,
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  update(where: { id: number }, data: Partial<UserType>): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    });
  }
}
