import z from 'zod';
import { TypeOfVerificationCode } from '../../shared/constants/auth.constant';
import { UserSchema } from '../../shared/models/shared-user.model';

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })
  .strict();

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});
export type RegisterResType = z.infer<typeof RegisterResSchema>;

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().length(6),
  type: z.enum([
    TypeOfVerificationCode.FORGOT_PASSWORD,
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.LOGIN,
    TypeOfVerificationCode.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;

export const SendOtpBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;

// Login Body
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();
export type LoginBodyType = z.infer<typeof LoginBodySchema>;

// Login Response
export const LoginResSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict();
export type LoginResType = z.infer<typeof LoginResSchema>;

// Refresh token body
export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;

// Refresh token response
export const RefreshTokenResSchema = LoginResSchema;
export type RefreshTokenResType = LoginResType;

// Device
export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});
export type DeviceType = z.infer<typeof DeviceSchema>;

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
});
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type RoleType = z.infer<typeof RoleSchema>;

export const LogoutBodySchema = RefreshTokenBodySchema;
export type LogoutBodyType = RefreshTokenBodyType;

export const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
}).strict();
export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>;

export const getAuthorizationUrlResSchema = z
  .object({
    url: z.string(),
  })
  .strict();
export type getAuthorizationUrlResType = z.infer<typeof getAuthorizationUrlResSchema>;
