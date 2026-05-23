import { SafetyCertificateOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

type AuthBrandProps = {
  admin?: boolean;
};

export default function AuthBrand({ admin = false }: AuthBrandProps) {
  return (
    <header className="h-16 border-b border-outline-variant bg-surface/90">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to={admin ? '/admin/login' : '/login'} className="flex items-center gap-2 text-primary">
          <SafetyCertificateOutlined className="text-2xl" />
          <span className="font-headline text-xl font-bold">SecurityFlow</span>
        </Link>
        <span className="text-sm font-semibold text-on-surface-variant">Support</span>
      </div>
    </header>
  );
}
