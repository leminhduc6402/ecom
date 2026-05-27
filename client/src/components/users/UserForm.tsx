import { useState } from 'react';
import { Form, Input, Select, Switch, Button, Skeleton } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api/user.api';
import { AvatarUpload } from './AvatarUpload';
import type { CreateUserInput, UpdateUserInput } from '../../api/user.api';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<UpdateUserInput>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  isLoadingData?: boolean;
}

export function UserForm({ mode, initialValues, onSubmit, onCancel, loading, isLoadingData }: UserFormProps) {
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles-dropdown'],
    queryFn: () => userApi.getRoles(),
  });

  const roles = rolesData?.data || [];

  if (isLoadingData) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  const handleValuesChange = () => {
    if (mode === 'edit' && !hasChanges) {
      setHasChanges(true);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ status: 'ACTIVE', ...initialValues }}
      onFinish={onSubmit}
      onValuesChange={handleValuesChange}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }, { min: 2, message: 'Tối thiểu 2 ký tự' }]}
          >
            <Input size="large" placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input size="large" placeholder="example@email.com" disabled={mode === 'edit'} />
          </Form.Item>

          <Form.Item
            label={mode === 'create' ? 'Mật khẩu' : 'Mật khẩu (Để trống nếu không đổi)'}
            name="password"
            rules={mode === 'create' ? [{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }] : [{ min: 6, message: 'Tối thiểu 6 ký tự' }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' }]}
          >
            <Input size="large" placeholder="Nhập số điện thoại" />
          </Form.Item>
        </div>

        <div className="md:col-span-1 space-y-4">
          <Form.Item label="Ảnh đại diện" name="avatar">
            <AvatarUpload />
          </Form.Item>

          <Form.Item
            label="Vai trò (Role)"
            name="roleId"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              size="large"
              placeholder="Chọn vai trò"
              loading={isLoadingRoles}
              options={roles.map((r) => ({ label: r.name, value: r.id }))}
            />
          </Form.Item>

          <Form.Item label="Trạng thái hoạt động" name="status">
            <Select
              size="large"
              options={[
                { label: 'Hoạt động (ACTIVE)', value: 'ACTIVE' },
                { label: 'Không hoạt động (INACTIVE)', value: 'INACTIVE' },
                ...(mode === 'edit' ? [{ label: 'Khóa (BLOCKED)', value: 'BLOCKED' }] : []),
              ]}
            />
          </Form.Item>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
        <Button size="large" onClick={onCancel}>Hủy</Button>
        <Button type="primary" htmlType="submit" size="large" loading={loading} disabled={mode === 'edit' && !hasChanges}>
          Lưu thay đổi
        </Button>
      </div>
    </Form>
  );
}
