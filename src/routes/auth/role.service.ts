import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { RoleName } from '../../shared/constants/role.constant'

@Injectable()
export class RoleService {
  private clientRoleId: number | null = null
  constructor(private readonly prismaService: PrismaService) {}
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.prismaService.role.findUnique({
      where: {
        name: RoleName.Client,
      },
    })
    if (!role) {
      throw new Error('Role CLIENT not found')
    }
    this.clientRoleId = role.id
    return role.id
  }
}
