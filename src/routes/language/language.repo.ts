import { Injectable } from '@nestjs/common';
import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from './language.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create({ createdById, data }: { createdById: number; data: CreateLanguageBodyType }): Promise<LanguageType> {
    return await this.prismaService.language.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async findAll(): Promise<LanguageType[]> {
    return await this.prismaService.language.findMany({
      where: { deletedAt: null },
    });
  }

  async findById(id: string): Promise<LanguageType | null> {
    return await this.prismaService.language.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdateLanguageBodyType;
    updatedById: number;
  }): Promise<LanguageType> {
    return await this.prismaService.language.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  async delete(id: string, isHard: boolean): Promise<LanguageType> {
    return isHard
      ? this.prismaService.language.delete({
          where: {
            id,
          },
        })
      : this.prismaService.language.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });
  }
}
