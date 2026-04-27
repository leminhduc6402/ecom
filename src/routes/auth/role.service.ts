import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { RoleName } from '../../shared/constants/role.constant';
import { RoleType } from './auth.model';

@Injectable()
export class RoleService {
  private clientRoleId: number | null = null;
  constructor(private readonly prismaService: PrismaService) {}
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }
    const role: RoleType | null = await this.prismaService.$queryRaw`
      SELECT * FROM "Role"
      WHERE name = ${RoleName.Client}
        AND "deletedAt" IS NULL
      LIMIT 1
    `;
    // .then((res: RoleType[]) => {
    //   if (res.length === 0) {
    //     return null;
    //   }
    //   return res[0];
    // });
    if (!role) {
      throw new Error('Role CLIENT not found');
    }
    this.clientRoleId = role.id;
    return role.id;
  }
}
