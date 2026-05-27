import AdminLayout from '../../components/admin/AdminLayout';
import { UserTable } from '../../components/users/UserTable';

export default function UsersPage() {
  return (
    <AdminLayout title="Quản lý người dùng">
      <UserTable />
    </AdminLayout>
  );
}
