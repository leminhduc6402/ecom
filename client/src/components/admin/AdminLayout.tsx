import { LogoutOutlined, SafetyCertificateOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type AdminLayoutProps = {
  title: string;
  children: ReactNode;
};

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <SafetyCertificateOutlined /> },
  { label: 'Settings', path: '/admin/settings/2fa', icon: <SettingOutlined /> },
];

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const { pathname } = useLocation();
  const { logout, logoutMutation } = useAuth();

  return (
    <div className="admin-shell flex">
      <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white px-4 py-6 md:block">
        <div className="mb-8 px-2">
          <p className="font-headline text-xl font-black text-slate-900">SecurityFlow</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Portal</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                pathname === item.path ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-slate-200 pt-4">
          <Button block icon={<LogoutOutlined />} loading={logoutMutation.isPending} onClick={logout}>
            Logout
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <h1 className="font-headline text-xl font-bold text-primary">{title}</h1>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-secondary-container text-on-secondary-container">
            <UserOutlined />
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
