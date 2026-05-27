import { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, message, Skeleton, Badge, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { profileApi } from '../../api/profile.api';
import { AvatarUpload } from '../../components/users/AvatarUpload';

export default function ClientProfilePage() {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getMe,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        avatar: profile.avatar,
      });
    }
  }, [profile, profileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      message.success('Cập nhật thông tin thành công');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      message.error(err.payload?.message || 'Có lỗi xảy ra');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: any) =>
      profileApi.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    },
    onError: (err: any) => {
      message.error(err.payload?.message || 'Mật khẩu hiện tại không đúng');
    },
  });

  if (isLoading) {
    return <div className="p-8 max-w-4xl mx-auto"><Skeleton active paragraph={{ rows: 8 }} /></div>;
  }

  const profileContent = (
    <div className="max-w-2xl">
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={(values) => updateProfileMutation.mutate(values)}
      >
        <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
          <div className="flex-shrink-0">
            <Form.Item name="avatar" noStyle>
              <AvatarUpload />
            </Form.Item>
          </div>
          
          <div className="flex-grow space-y-2 w-full">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
              <Badge count={profile?.role.name} style={{ backgroundColor: '#52c41a' }} />
            </div>
            
            <Form.Item label="Email">
              <Input value={profile?.email} disabled size="large" />
            </Form.Item>

            <Form.Item
              name="name"
              label="Họ tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }, { min: 2, message: 'Tối thiểu 2 ký tự' }]}
            >
              <Input disabled={!isEditing} size="large" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              rules={[{ pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' }]}
            >
              <Input disabled={!isEditing} size="large" />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {!isEditing ? (
            <Button type="primary" onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
          ) : (
            <>
              <Button onClick={() => {
                setIsEditing(false);
                profileForm.setFieldsValue(profile);
              }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={updateProfileMutation.isPending}>Lưu thay đổi</Button>
            </>
          )}
        </div>
      </Form>
    </div>
  );

  const securityContent = (
    <div className="max-w-xl">
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Bảo mật 2 Lớp (2FA)</h3>
        <div className="flex items-center justify-between">
          <span>Trạng thái: {profile?.isTotpEnabled ? <Badge status="success" text="Đã bật" /> : <Badge status="default" text="Đang tắt" />}</span>
          <Link to="/profile/security">
            <Button type="default">{profile?.isTotpEnabled ? 'Cài đặt 2FA' : 'Bật 2FA'}</Button>
          </Link>
        </div>
      </div>

      <Divider />

      <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={(values) => changePasswordMutation.mutate(values)}
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item
          name="confirmNewPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending}>Đổi mật khẩu</Button>
      </Form>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>
      <Card>
        <Tabs
          items={[
            { key: '1', label: 'Thông tin cá nhân', children: profileContent },
            { key: '2', label: 'Bảo mật', children: securityContent },
          ]}
        />
      </Card>
    </div>
  );
}
