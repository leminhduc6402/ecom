import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException,
} from 'src/routes/user/user.error';
import { CreateUserBodyType, GetUsersQueryType, UpdateUserBodyType } from 'src/routes/user/user.model';
import { UserRepository } from 'src/routes/user/user.repo';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { isForeignKeyConstraintError, isNotFoundError, isUniqueConstraintError } from 'src/shared/helpers';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) {}

  async findAll(pagination: GetUsersQueryType) {
    const data = await this.userRepository.findAll(pagination);
    return data;
  }

  async findById(id: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({ id, deletedAt: null });
    if (!user) {
      throw NotFoundRecordException;
    }
    return user;
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType;
    createdById: number;
    createdByRoleName: string;
  }) {
    try {
      await this.verifyRole({ roleNameAgent: createdByRoleName, roleIdTarget: data.roleId });
      const hashedPassword = await this.hashingService.hash(data.password);
      return await this.userRepository.create({
        createdById,
        data: {
          ...data,
          password: hashedPassword,
        },
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw RoleNotFoundException;
      }
      if (isUniqueConstraintError(error)) {
        throw UserAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({
    id,
    data,
    updatedById,
    updatedByRoleName,
  }: {
    id: number;
    data: UpdateUserBodyType;
    updatedById: number;
    updatedByRoleName: string;
  }) {
    try {
      if (id === updatedById) {
        throw CannotUpdateOrDeleteYourselfException;
      }
      const currentUser = await this.sharedUserRepository.findUnique({ id, deletedAt: null });
      if (!currentUser) {
        throw NotFoundRecordException;
      }
      await this.verifyRole({ roleNameAgent: updatedByRoleName, roleIdTarget: currentUser.roleId });
      const updatedUser = await this.sharedUserRepository.update({ id, deletedAt: null }, { updatedById, ...data });
      return updatedUser;
    } catch (error) {
      if (isNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintError(error)) {
        throw UserAlreadyExistsException;
      }
      if (isForeignKeyConstraintError(error)) {
        throw RoleNotFoundException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById, deletedByRoleName }: { id: number; deletedById: number; deletedByRoleName: string }) {
    try {
      if (id === deletedById) {
        throw CannotUpdateOrDeleteYourselfException;
      }
      const currentUser = await this.sharedUserRepository.findUnique({ id, deletedAt: null });
      if (!currentUser) {
        throw NotFoundRecordException;
      }
      await this.verifyRole({ roleNameAgent: deletedByRoleName, roleIdTarget: currentUser.roleId });

      await this.userRepository.delete({ id, deletedById });
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

  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    if (roleNameAgent === RoleName.Admin) {
      return true;
    }
    const adminRoleId = await this.sharedRoleRepository.getAdminRoleId();
    if (roleIdTarget === adminRoleId) {
      throw new ForbiddenException();
    }
    return true;
  }
}
