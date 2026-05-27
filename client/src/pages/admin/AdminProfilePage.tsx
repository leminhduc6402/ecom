import AdminLayout from '../../components/admin/AdminLayout';
import ClientProfilePage from '../client/ClientProfilePage';

export default function AdminProfilePage() {
  return (
    <AdminLayout title="Hồ sơ cá nhân">
      <ClientProfilePage />
    </AdminLayout>
  );
}
