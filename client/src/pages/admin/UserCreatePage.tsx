import { message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { UserForm } from '../../components/users/UserForm';
import { userApi } from '../../api/user.api';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      message.success('Tạo người dùng mới thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
    },
    onError: (err: any) => {
      const msg = err.payload?.message || 'Có lỗi xảy ra khi tạo người dùng';
      message.error(msg);
    },
  });

  return (
    <AdminLayout title="Thêm người dùng mới">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <UserForm
          mode="create"
          loading={createMutation.isPending}
          onCancel={() => navigate('/admin/users')}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      </div>
    </AdminLayout>
  );
}
