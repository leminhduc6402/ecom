import AdminLayout from '../../components/admin/AdminLayout';
import TwoFactorForm from '../../components/auth/TwoFactorForm';

export default function TwoFactorSetupPage() {
  return (
    <AdminLayout title="Settings">
      <TwoFactorForm />
    </AdminLayout>
  );
}
