import { z } from 'zod';

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  totpCode: z.string().optional(),
});

export const OtpSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otp: z.string().regex(/^\d{6}$/, 'OTP phải là 6 chữ số'),
  type: z.enum(['REGISTER', 'FORGOT_PASSWORD']),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const TwoFactorCodeSchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/, 'Mã TOTP phải là 6 chữ số'),
});

export const DisableTwoFactorSchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/, 'Mã TOTP phải là 6 chữ số'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type OtpInput = z.infer<typeof OtpSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type TwoFactorCodeInput = z.infer<typeof TwoFactorCodeSchema>;
export type DisableTwoFactorInput = z.infer<typeof DisableTwoFactorSchema>;
