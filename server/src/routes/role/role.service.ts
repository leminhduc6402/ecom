import { Inject, Injectable } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundError, isUniqueConstraintError } from 'src/shared/helpers';
import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from './role.error';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './role.model';
import { RoleRepository } from './role.repo';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(pagination: GetRolesQueryType) {
    const data = await this.roleRepository.findAll(pagination);
    return data;
  }

  async findById(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw NotFoundRecordException;
    }
    return role;
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      return await this.roleRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      await this.verifyRole(id);

      const updatedRole = await this.roleRepository.update({
        id,
        updatedById,
        data,
      });
      await this.cacheManager.del(`role:${updatedRole.id}`); // Xóa cache của role đã cập nhật
      return updatedRole;
    } catch (error) {
      if (isNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(id);
      await this.roleRepository.delete({ id, deletedById });
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

  private async verifyRole(roleId: number) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw NotFoundRecordException;
    }
    const baseRoles: string[] = [RoleName.Admin, RoleName.Client, RoleName.Seller];

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException;
    }
  }
}
