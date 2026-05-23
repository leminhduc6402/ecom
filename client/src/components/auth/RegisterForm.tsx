import { Button, Form, Input, type FormInstance } from 'antd';
import type { RegisterInput } from '../../schemas/auth.schema';

type RegisterFormProps = {
  form?: FormInstance<RegisterInput>;
  loading?: boolean;
  onSubmit: (values: RegisterInput) => void;
};

export default function RegisterForm({ form, loading = false, onSubmit }: RegisterFormProps) {
  return (
    <Form<RegisterInput> form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
      <Form.Item name="name" label="Full Name" rules={[{ required: true, min: 2, message: 'Tên tối thiểu 2 ký tự' }]}>
        <Input size="large" placeholder="John Doe" />
      </Form.Item>
      <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
        <Input size="large" placeholder="john@example.com" />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
        <Input.Password size="large" placeholder="••••••••" />
      </Form.Item>
      <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}>
        <Input.Password size="large" placeholder="••••••••" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading} size="large" block>
        Sign Up
      </Button>
    </Form>
  );
}
