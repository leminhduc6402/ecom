import type { ReactNode } from 'react';
import AuthBrand from './AuthBrand';

type AuthLayoutProps = {
  children: ReactNode;
  visualTitle?: string;
  visualCopy?: string;
};

export default function AuthLayout({ children, visualTitle, visualCopy }: AuthLayoutProps) {
  return (
    <div className="auth-page flex min-h-screen flex-col">
      <AuthBrand />
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:px-8">
        <section className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(360px,480px)_1fr]">
          {children}
          <aside className="security-visual hidden min-h-[520px] overflow-hidden rounded-2xl p-8 text-white shadow-2xl lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-8 grid grid-cols-3 gap-3 opacity-80">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-lg border border-white/20 bg-white/10" />
                  ))}
                </div>
                <h2 className="font-headline text-3xl font-bold">{visualTitle ?? 'Enterprise Security'}</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                  {visualCopy ?? 'Protect account access with role-aware authentication and layered verification.'}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-semibold">Zero-trust session</p>
                <p className="mt-1 text-xs text-white/70">Token storage, refresh handling, and guarded admin routes are wired in.</p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
