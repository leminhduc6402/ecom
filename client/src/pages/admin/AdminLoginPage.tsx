import { Form } from 'antd';
import AuthBrand from '../../components/auth/AuthBrand';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { LoginSchema, type LoginInput } from '../../schemas/auth.schema';
import { validateWithZod } from '../../utils/zodForm';

export default function AdminLoginPage() {
  const [form] = Form.useForm<LoginInput>();
  const { login, loginMutation } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBrand admin />
      <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-8">
        <div className="absolute right-0 top-0 hidden h-full w-1/4 border-l border-slate-200 bg-slate-100 lg:block">
          <div className="flex h-full flex-col justify-center gap-6 p-10 opacity-60">
            <div className="h-px bg-slate-300" />
            <div className="space-y-3">
              <div className="h-3 w-3/4 rounded-full bg-slate-300" />
              <div className="h-3 w-1/2 rounded-full bg-slate-300" />
              <div className="h-3 w-2/3 rounded-full bg-slate-300" />
            </div>
            <div className="h-px bg-slate-300" />
          </div>
        </div>
        <section className="relative z-10 w-full max-w-[440px] rounded-xl border border-outline-variant bg-white/95 p-6 shadow-admin backdrop-blur md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">A</div>
            <h1 className="font-headline text-3xl font-bold text-on-surface">Admin Portal Access</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Authorized personnel only. Secure terminal.</p>
          </div>
          <LoginForm
            admin
            form={form}
            loading={loginMutation.isPending}
            onSubmit={(values) => {
              const parsed = validateWithZod(LoginSchema, values, form);
              if (parsed) login(parsed);
            }}
            extraActions={<p className="pt-4 text-center text-xs text-slate-500">End-to-End Encrypted Session</p>}
          />
        </section>
      </main>
    </div>
  );
}
