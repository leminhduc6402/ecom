import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repo';
import { NotFoundRecordException } from 'src/shared/error';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './role.model';
import { isNotFoundError, isUniqueConstraintError } from 'src/shared/helpers';
import { RoleAlreadyExistsException } from './role.error';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

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
      const role = await this.roleRepository.update({
        id,
        updatedById,
        data,
      });
      return role;
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
}
