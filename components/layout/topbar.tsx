'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { getInitials } from '@/lib/utils';

export function Topbar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>('');

  const getBreadcrumbTitle = () => {
    if (pathname === '/proformas/nueva') return 'Crear proforma';
    if (pathname === '/auditoria') return 'Auditorías';
    if (pathname === '/perfil') return 'Mi perfil y personalización';
    return 'Home';
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      setTimeStr(
        `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} · ${now.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-purple-900/10 dark:border-white/5 flex items-center justify-between px-7 sticky top-0 z-40">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-caption text-gray-600 dark:text-gray-400">
        <span>Starken FE</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="text-caption text-gray-600 dark:text-gray-400 bg-purple-50/50 dark:bg-white/5 border border-purple-100 dark:border-white/10 px-3 py-1.5 rounded-md font-medium">
          {timeStr || 'Cargando...'}
        </div>

        <button className="w-9 h-9 flex items-center justify-center rounded-md bg-purple-50/50 dark:bg-white/5 border border-purple-100 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-emerald-400 hover:bg-purple-100/50 dark:hover:bg-white/10 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className={`absolute top-1.5 right-1.5 w-2 h-2 ${theme.accentBg} rounded-full ring-2 ring-white dark:ring-slate-900`} />
        </button>

        <Link
          href="/perfil"
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.accentGradient} flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 ${theme.accentRing} transition-all`}
          title="Ver perfil y personalización de temas"
        >
          {user ? getInitials(user.name) : 'AN'}
        </Link>
      </div>
    </header>
  );
}
