import { Button, Form, Input, message } from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import AuthLayout from '../../components/auth/AuthLayout';
import OtpInput from '../../components/auth/OtpInput';
import { ForgotPasswordSchema, OtpSchema, type OtpInput as OtpInputType } from '../../schemas/auth.schema';
import type { OtpType } from '../../types/auth';

export default function OtpVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = searchParams.get('email') || '';
  const initialType = (searchParams.get('type') || 'REGISTER') as OtpType;
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [resetForm] = Form.useForm<{ password: string; confirmPassword: string }>();

  useEffect(() => {
    const timer = setInterval(() => setCountdown((current) => (current > 0 ? current - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: () => {
      message.success('Xác minh OTP thành công');
      if (initialType === 'FORGOT_PASSWORD') return;
      navigate('/login');
    },
    onError: (err: Error) => {
      setHasOtpError(true);
      message.error(err.message || 'OTP không hợp lệ');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => {
      const parsed = ForgotPasswordSchema.safeParse({ email });
      if (!parsed.success) throw new Error('Email không hợp lệ');
      return authApi.resendOtp({ email, type: initialType });
    },
    onSuccess: () => {
      message.success('OTP mới đã được gửi');
      setCountdown(60);
    },
    onError: (err: Error) => message.error(err.message || 'Không thể gửi lại OTP'),
  });

  const debouncedResend = useMemo(() => debounce(() => resendMutation.mutate(), 1000), [resendMutation]);

  useEffect(() => () => debouncedResend.cancel(), [debouncedResend]);

  const onVerify = useCallback(() => {
    const payload: OtpInputType = { email, otp, type: initialType };
    const result = OtpSchema.safeParse(payload);
    if (!result.success) {
      setHasOtpError(true);
      message.error(result.error.issues[0]?.message ?? 'OTP không hợp lệ');
      return;
    }
    setHasOtpError(false);
    verifyMutation.mutate(result.data);
  }, [email, initialType, otp, verifyMutation]);

  return (
    <AuthLayout visualTitle="Task-focused verification" visualCopy="Six dedicated inputs, paste support, countdown resend, and inline feedback for the OTP journey.">
      <section className="auth-card rounded-2xl p-6 md:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-2xl text-primary">✉</div>
          <h1 className="font-headline text-3xl font-bold">Verify Your Email</h1>
          <p className="mt-2 text-on-surface-variant">We&apos;ve sent a 6-digit code to your email.</p>
        </div>
        {!initialEmail ? (
          <Form layout="vertical" className="mb-6">
            <Form.Item label="Email Address">
              <Input size="large" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
            </Form.Item>
          </Form>
        ) : null}
        <div className="space-y-6">
          <OtpInput value={otp} onChange={setOtp} hasError={hasOtpError} autoFocus />
          {hasOtpError ? <p className="text-sm text-error">The code you entered is incorrect or has expired. Please try again.</p> : null}
          <Button type="primary" size="large" block loading={verifyMutation.isPending} onClick={onVerify}>
            Verify
          </Button>
          <div className="text-center">
            <Button type="link" disabled={countdown > 0} loading={resendMutation.isPending} onClick={() => debouncedResend()}>
              Resend Code {countdown > 0 ? `${countdown}s` : ''}
            </Button>
            <p className="text-xs text-on-surface-variant">Didn&apos;t receive a code? Check your spam folder.</p>
          </div>
        </div>
        {initialType === 'FORGOT_PASSWORD' && verifyMutation.isSuccess ? (
          <Form
            form={resetForm}
            layout="vertical"
            className="mt-8 rounded-xl border border-outline-variant bg-surface-container-low p-4"
            onFinish={(values) => {
              if (values.password !== values.confirmPassword) {
                resetForm.setFields([{ name: 'confirmPassword', errors: ['Mật khẩu xác nhận không khớp'] }]);
                return;
              }
              message.info('Backend chưa cung cấp endpoint đặt mật khẩu mới trong prompt.');
            }}
          >
            <Form.Item name="password" label="New Password" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}>
              <Input.Password />
            </Form.Item>
            <Button htmlType="submit" block>
              Save New Password
            </Button>
          </Form>
        ) : null}
        <Link className="mt-6 block text-center font-semibold text-primary" to="/login">
          Back to login
        </Link>
      </section>
    </AuthLayout>
  );
}
