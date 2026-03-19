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

export const VerificationCode = z.object({
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

export type VerificationCodeType = z.infer<typeof VerificationCode>;

export const SendOtpBodySchema = VerificationCode.pick({
  email: true,
  type: true,
}).strict();

export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;
