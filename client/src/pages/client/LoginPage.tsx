import { GoogleOutlined } from '@ant-design/icons';
import { Button, Divider, Form, message } from 'antd';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { LoginSchema, type LoginInput } from '../../schemas/auth.schema';
import { validateWithZod } from '../../utils/zodForm';

export default function LoginPage() {
  const [form] = Form.useForm<LoginInput>();
  const { login, loginMutation } = useAuth();
  const googleMutation = useMutation({
    mutationFn: authApi.getGoogleLink,
    onSuccess: (data) => {
      const url = data.data?.url ?? data.url;
      if (!url) {
        message.error('Không nhận được Google OAuth URL');
        return;
      }
      window.location.href = url;
    },
    onError: (err: Error) => message.error(err.message || 'Không thể lấy Google OAuth URL'),
  });

  return (
    <AuthLayout>
      <section className="auth-card rounded-2xl p-6 md:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-3xl text-primary">⌁</div>
          <h1 className="font-headline text-3xl font-bold text-on-surface">Welcome Back</h1>
          <p className="mt-2 text-on-surface-variant">Log in to manage your workspace security.</p>
        </div>
        <LoginForm
          form={form}
          loading={loginMutation.isPending}
          onSubmit={(values) => {
            const parsed = validateWithZod(LoginSchema, values, form);
            if (parsed) login(parsed);
          }}
          extraActions={
            <>
              <div className="mt-2 text-right">
                <Link className="font-semibold text-primary" to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>
              <Divider plain>or continue with</Divider>
              <Button block size="large" icon={<GoogleOutlined />} loading={googleMutation.isPending} onClick={() => googleMutation.mutate()}>
                Sign in with Google
              </Button>
            </>
          }
        />
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link className="font-semibold text-primary" to="/register">
            Sign Up
          </Link>
        </p>
      </section>
    </AuthLayout>
  );
}
