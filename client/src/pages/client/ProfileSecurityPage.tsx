import AuthBrand from '../../components/auth/AuthBrand';
import TwoFactorForm from '../../components/auth/TwoFactorForm';

export default function ProfileSecurityPage() {
  return (
    <div className="min-h-screen bg-surface-bright">
      <AuthBrand />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-on-surface">Profile Security</h1>
          <p className="mt-2 text-on-surface-variant">Manage account protection and two-factor authentication.</p>
        </div>
        <TwoFactorForm />
      </main>
    </div>
  );
}
