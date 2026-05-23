import { Form, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';
import { RegisterSchema, type RegisterInput } from '../../schemas/auth.schema';
import { validateWithZod } from '../../utils/zodForm';

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterInput>();
  const navigate = useNavigate();
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_, values) => {
      message.success('Đăng ký thành công. Vui lòng xác minh OTP.');
      navigate(`/otp?email=${encodeURIComponent(values.email)}&type=REGISTER`);
    },
    onError: (err: Error) => message.error(err.message || 'Đăng ký thất bại'),
  });

  return (
    <AuthLayout visualTitle="Create a protected account" visualCopy="Register once, verify by OTP, and keep account recovery flows consistent across devices.">
      <section className="auth-card rounded-2xl p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-3xl font-bold text-on-surface">Create an Account</h1>
          <p className="mt-2 text-on-surface-variant">Join SecurityFlow and protect what matters.</p>
        </div>
        <RegisterForm
          form={form}
          loading={registerMutation.isPending}
          onSubmit={(values) => {
            const parsed = validateWithZod(RegisterSchema, values, form);
            if (parsed) registerMutation.mutate(parsed);
          }}
        />
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link className="font-semibold text-primary" to="/login">
            Log In
          </Link>
        </p>
      </section>
    </AuthLayout>
  );
}
