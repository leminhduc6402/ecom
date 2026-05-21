import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './permission.repo';
import { NotFoundRecordException } from 'src/shared/error';
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model';
import { isNotFoundError, isUniqueConstraintError } from 'src/shared/helpers';
import { PermissionAlreadyExistsException } from './permission.error';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async findAll(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepository.findAll(pagination);
    return data;
  }

  async findById(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw NotFoundRecordException;
    }
    return permission;
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdatePermissionBodyType; updatedById: number }) {
    try {
      const permission = await this.permissionRepository.update({
        id,
        updatedById,
        data,
      });
      return permission;
    } catch (error) {
      if (isNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.permissionRepository.delete({ id, deletedById });
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
