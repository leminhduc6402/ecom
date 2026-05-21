import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Ecom',
  description: 'Trang quản lý của bạn',
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-400">Đăng nhập thành công! Chào mừng bạn đến với Ecom.</p>
      </div>
    </main>
  );
}
