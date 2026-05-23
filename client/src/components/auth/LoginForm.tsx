import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, type FormInstance } from 'antd';
import type { ReactNode } from 'react';
import type { LoginInput } from '../../schemas/auth.schema';

type LoginFormProps = {
  admin?: boolean;
  form?: FormInstance<LoginInput>;
  loading?: boolean;
  onSubmit: (values: LoginInput) => void;
  extraActions?: ReactNode;
};

export default function LoginForm({ admin = false, form, loading = false, onSubmit, extraActions }: LoginFormProps) {
  return (
    <Form<LoginInput> form={form} layout="vertical" requiredMark={false} onFinish={onSubmit} className="space-y-1">
      <Form.Item name="email" label={admin ? 'Administrator Email' : 'Email Address'} rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
        <Input size="large" prefix={<MailOutlined />} placeholder={admin ? 'name@securityflow.com' : 'name@company.com'} />
      </Form.Item>
      <Form.Item name="password" label={admin ? 'Access Password' : 'Password'} rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
        <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
      </Form.Item>
      <Form.Item name="totpCode" label="2FA Code" help="Chỉ nhập khi tài khoản đã bật 2FA.">
        <Input size="large" inputMode="numeric" maxLength={6} placeholder="123456" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading} size="large" block>
        {admin ? 'Secure Login' : 'Sign In'}
      </Button>
      {extraActions}
    </Form>
  );
}
