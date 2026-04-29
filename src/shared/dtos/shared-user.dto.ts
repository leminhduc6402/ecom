import { GetUserProfileResSchema, UpdateProfileResSchema } from '../models/shared-user.model';
import { createZodDto } from 'nestjs-zod';

export class GetUserProfileResDto extends createZodDto(GetUserProfileResSchema) {}

export class UpdateProfileResDto extends createZodDto(UpdateProfileResSchema) {}
