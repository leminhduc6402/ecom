import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { UserStatus } from '../../generated/prisma/enums'

const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE]),
  roleId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  deletedById: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
})

const RegisterBodySchema = z
  .object({
    email: z.email('Email không hợp lệ'),
    password: z.string().min(6).max(100),
    name: z.string().min(3).max(100),
    confirmPassword: z.string().min(6).max(100),
    phoneNumber: z.string().min(10).max(15),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })
  .strict()

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(UserSchema) {}
