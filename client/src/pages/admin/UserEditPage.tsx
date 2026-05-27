import { message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { UserForm } from '../../components/users/UserForm';
import { userApi } from '../../api/user.api';

export default function UserEditPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();

  const id = Number(userId);

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => userApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
    },
    onError: (err: any) => {
      const msg = err.payload?.message || 'Có lỗi xảy ra khi cập nhật';
      message.error(msg);
    },
  });

  return (
    <AdminLayout title="Chỉnh sửa người dùng">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {user && (
          <UserForm
            mode="edit"
            isLoadingData={isLoading}
            loading={updateMutation.isPending}
            initialValues={{
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
              avatar: user.avatar,
              roleId: user.role.id,
              status: user.status,
            }}
            onCancel={() => navigate('/admin/users')}
            onSubmit={(values) => updateMutation.mutate(values)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
