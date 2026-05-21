'use client';

import { useState } from 'react';
import { Form, Input, Button, Alert, Divider } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useLogin, type LoginError } from '../hooks/useLogin';
import type { LoginRequest } from '../types/auth.types';
import { authApi } from '../api/auth.api';

export function LoginForm() {
  const [form] = Form.useForm<LoginRequest>();
  const { mutate: login, isPending, error } = useLogin();
  const [requires2FA, setRequires2FA] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loginError = error as LoginError | null;
  const displayError = globalError || (loginError && !loginError.fieldErrors.email && !loginError.fieldErrors.password ? loginError.message : null);

  const onSubmit = (values: LoginRequest) => {
    setGlobalError(null);
    login(values, {
      onError: (err) => {
        const parsed = err as LoginError;
        
        // Handle 2FA Requirement
        // If the server returns InvalidTOTPAndCode error on email/password submission, it means 2FA is required
        if (parsed.fieldErrors?.totpCode || parsed.fieldErrors?.code || parsed.message.includes('Mã') || parsed.message.includes('TOTP')) {
          setRequires2FA(true);
          return;
        }

        // Set field-level errors
        const formErrors = [];
        if (parsed.fieldErrors?.email) {
          formErrors.push({ name: 'email', errors: [parsed.fieldErrors.email] });
        }
        if (parsed.fieldErrors?.password) {
          formErrors.push({ name: 'password', errors: [parsed.fieldErrors.password] });
        }
        if (formErrors.length > 0) {
          form.setFields(formErrors);
        }
      },
    });
  };

  const handleGoogleLogin = async () => {
    try {
      const { url } = await authApi.getGoogleAuthUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setGlobalError('Không thể lấy URL đăng nhập Google.');
    }
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={onSubmit}
      layout="vertical"
      requiredMark={false}
      size="large"
      className="w-full"
    >
      {displayError && (
        <Alert
          message={displayError}
          type="error"
          showIcon
          className="mb-6 rounded-xl border-red-500/30 bg-red-500/10 text-red-400"
        />
      )}

      <Form.Item
        name="email"
        label={<span className="text-slate-300">Email</span>}
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' },
        ]}
      >
        <Input 
          prefix={<MailOutlined className="text-slate-500" />} 
          placeholder="you@example.com" 
          disabled={requires2FA || isPending}
          className="rounded-xl border-white/10 bg-white/5 text-white hover:border-violet-500/50 focus:border-violet-500/50" 
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={<span className="text-slate-300">Mật khẩu</span>}
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined className="text-slate-500" />} 
          placeholder="••••••••" 
          disabled={requires2FA || isPending}
          className="rounded-xl border-white/10 bg-white/5 text-white hover:border-violet-500/50 focus:border-violet-500/50" 
        />
      </Form.Item>

      {requires2FA && (
        <Form.Item
          name="totpCode" // or "code" if using email OTP, let's use totpCode primarily as per auth logic
          label={<span className="text-slate-300">Mã xác thực 2FA (TOTP / OTP)</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mã xác thực 2FA!' },
            { len: 6, message: 'Mã xác thực phải gồm 6 ký tự!' }
          ]}
          extra={<span className="text-xs text-slate-400">Nhập mã từ ứng dụng Authenticator hoặc Email.</span>}
        >
          <Input 
            prefix={<SafetyCertificateOutlined className="text-slate-500" />} 
            placeholder="123456" 
            maxLength={6}
            className="rounded-xl border-white/10 bg-white/5 text-white hover:border-violet-500/50 focus:border-violet-500/50" 
          />
        </Form.Item>
      )}

      <Form.Item className="mt-8 mb-4">
        <Button
          type="primary"
          htmlType="submit"
          loading={isPending}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 border-0 font-semibold shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition-all"
        >
          {requires2FA ? 'Xác thực & Đăng nhập' : 'Đăng nhập'}
        </Button>
      </Form.Item>

      {requires2FA && (
        <div className="text-center mb-4">
          <Button type="link" onClick={() => setRequires2FA(false)} className="text-violet-400">
            Hủy / Thử lại bằng tài khoản khác
          </Button>
        </div>
      )}

      {!requires2FA && (
        <>
          <Divider className="border-white/10">
            <span className="text-slate-500 text-sm">Hoặc tiếp tục với</span>
          </Divider>
          
          <Button
            onClick={handleGoogleLogin}
            icon={<GoogleOutlined />}
            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Đăng nhập bằng Google
          </Button>
        </>
      )}
    </Form>
  );
}
