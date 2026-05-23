import { Button, Form, Input, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import AuthLayout from '../../components/auth/AuthLayout';
import { ForgotPasswordSchema, type ForgotPasswordInput } from '../../schemas/auth.schema';
import { validateWithZod } from '../../utils/zodForm';

export default function ForgotPasswordPage() {
  const [form] = Form.useForm<ForgotPasswordInput>();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, values) => {
      message.success('OTP đã được gửi');
      navigate(`/otp?email=${encodeURIComponent(values.email)}&type=FORGOT_PASSWORD`);
    },
    onError: (err: Error) => message.error(err.message || 'Không thể gửi OTP'),
  });

  return (
    <AuthLayout visualTitle="Recover access carefully" visualCopy="Email OTP verification keeps reset flows explicit and auditable.">
      <section className="auth-card rounded-2xl p-6 md:p-8">
        <h1 className="font-headline text-3xl font-bold">Forgot Password</h1>
        <p className="mt-2 text-on-surface-variant">Enter your email address and we will send a verification code.</p>
        <Form<ForgotPasswordInput>
          form={form}
          layout="vertical"
          className="mt-8"
          onFinish={(values) => {
            const parsed = validateWithZod(ForgotPasswordSchema, values, form);
            if (parsed) mutation.mutate(parsed);
          }}
        >
          <Form.Item name="email" label="Email Address">
            <Input size="large" placeholder="name@company.com" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={mutation.isPending}>
            Send OTP
          </Button>
        </Form>
        <Link className="mt-6 block text-center font-semibold text-primary" to="/login">
          Back to login
        </Link>
      </section>
    </AuthLayout>
  );
}
