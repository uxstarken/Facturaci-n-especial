'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loggedOut = typeof window !== 'undefined' && localStorage.getItem('starken_fe_logged_out') === 'true';
    if (loggedOut || !user) {
      const stored = localStorage.getItem('starken_fe_user');
      if (!stored || loggedOut) {
        router.push('/login');
      }
    }
  }, [user, router]);

  return (
    <div className={`flex min-h-screen bg-gradient-to-br ${theme.mainBgGradient}`}>
      <Sidebar />
      <div className="ml-[230px] flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="p-7 flex-1">{children}</main>
      </div>
    </div>
  );
}
