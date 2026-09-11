'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FilePlus2, ShieldAlert, LogOut, User, CheckSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { getInitials } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Crear Proforma', href: '/proformas/nueva', icon: FilePlus2 },
    { label: 'Aprobaciones', href: '/aprobaciones', icon: CheckSquare, badge: '4' },
    { label: 'Auditorías', href: '/auditoria', icon: ShieldAlert, badge: user?.role !== 'Analista' ? '3' : undefined },
    { label: 'Mi perfil y temas', href: '/perfil', icon: User },
  ];

  return (
    <aside className={`w-[230px] h-screen bg-gradient-to-b ${theme.sidebarBgGradient} border-r border-purple-900/15 dark:border-white/5 flex flex-col fixed top-0 left-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.06)] overflow-hidden`}>
      {/* Background Orbs */}
      <div className={`absolute w-52 h-52 ${theme.sidebarOrbs[0]} rounded-full blur-3xl -top-16 -left-16 pointer-events-none animate-pulse`} />
      <div className={`absolute w-44 h-44 ${theme.sidebarOrbs[1]} rounded-full blur-3xl bottom-10 -right-16 pointer-events-none`} />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          backgroundImage: `
            linear-gradient(${theme.sidebarGridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${theme.sidebarGridColor} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Brand Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-purple-900/10 dark:border-white/5 relative z-10 bg-white/40 dark:bg-black/20 backdrop-blur-md">
        <div className={`w-8 h-8 bg-gradient-to-br ${theme.accentGradient} rounded-lg flex items-center justify-center font-extrabold text-white text-sm shadow-md`}>
          SK
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">Starken</span>
          <span className={`text-[9px] font-semibold ${theme.accentText} uppercase tracking-widest leading-tight`}>
            Facturación Especial
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 flex flex-col gap-1 relative z-10">
        <span className="text-micro font-semibold text-gray-600 dark:text-gray-500 uppercase tracking-wider px-2.5 pt-2 pb-1">
          Principal
        </span>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-body font-medium transition-all relative ${isActive
                ? 'bg-white/90 dark:bg-white/10 text-gray-900 dark:text-white border border-white/90 dark:border-white/10 shadow-sm backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                }`}
            >
              {isActive && (
                <span className={`absolute left-0 top-2 bottom-2 w-1 ${theme.accentBg} rounded-r`} />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? theme.accentText : 'text-gray-500 dark:text-gray-400'}`} />
              <span className="flex-1 font-semibold">{item.label}</span>
              {item.badge && (
                <span className={`${theme.accentBg} text-white text-micro font-bold px-1.5 py-0.5 rounded-full`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-purple-900/10 dark:border-white/5 relative z-10 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/80 dark:bg-slate-800/60 border border-purple-200/60 dark:border-white/10 shadow-xs">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.accentGradient} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs`}>
            {user ? getInitials(user.name) : 'AN'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'Analista'}</p>
            <p className="text-micro text-gray-600 dark:text-gray-400 truncate">{user?.role || 'analista@starken.cl'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-600 p-1.5 transition-colors rounded-md hover:bg-red-50/80 dark:hover:bg-red-500/10 cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-600" />
          </button>
        </div>
      </div>
    </aside>
  );
}
