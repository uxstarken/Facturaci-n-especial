'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus2,
  ShieldAlert,
  LogOut,
  User,
  CheckSquare,
  Users,
  AlertOctagon,
  Share2,
  Scale,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { getInitials } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import {
  MOCK_PROFORMAS,
  MOCK_EXCEPCIONES_TARIFARIAS,
  MOCK_COMUNICACIONES_KAM,
  MOCK_CLIENTS,
} from '@/lib/mock-data';

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isPricing = user?.role === 'Pricing';
  const isJefatura = user?.role === 'Jefatura';

  // Badges dinámicos de casos pendientes reactivos:
  const [rechazosCount, setRechazosCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('starken_fe_counts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (typeof parsed.rechazosCount === 'number') return parsed.rechazosCount;
        } catch {}
      }
    }
    return MOCK_PROFORMAS.filter((p) => p.estado.includes('Rechazada') || Boolean(p.motivoRechazoPricing)).length;
  });

  const [excepcionesCount, setExcepcionesCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('starken_fe_counts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (typeof parsed.excepcionesCount === 'number') return parsed.excepcionesCount;
        } catch {}
      }
    }
    return MOCK_EXCEPCIONES_TARIFARIAS.filter((e) => e.estado.includes('Pendiente')).length;
  });

  const [kamComsCount, setKamComsCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('starken_fe_counts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (typeof parsed.kamComsCount === 'number') return parsed.kamComsCount;
        } catch {}
      }
    }
    return MOCK_COMUNICACIONES_KAM.filter((c) => c.estado !== 'Resuelta').length;
  });

  const [clientesReprocesoCount, setClientesReprocesoCount] = useState<number>(() => {
    return MOCK_CLIENTS.filter((c) => c.kpis.cantidadReprocesos > 0).length;
  });

  const [aprobacionesV2Count, setAprobacionesV2Count] = useState<number>(() => {
    return MOCK_PROFORMAS.filter((p) => p.versionActual === 'v2' || p.estadoSupervision === 'Pendiente_Autorizacion').length;
  });

  useEffect(() => {
    const handleBadgeUpdate = (e: any) => {
      if (e.detail) {
        if (typeof e.detail.rechazosCount === 'number') setRechazosCount(e.detail.rechazosCount);
        if (typeof e.detail.excepcionesCount === 'number') setExcepcionesCount(e.detail.excepcionesCount);
        if (typeof e.detail.kamComsCount === 'number') setKamComsCount(e.detail.kamComsCount);
        if (typeof e.detail.aprobacionesV2Count === 'number') setAprobacionesV2Count(e.detail.aprobacionesV2Count);
        if (typeof e.detail.clientesReprocesoCount === 'number') setClientesReprocesoCount(e.detail.clientesReprocesoCount);
      }
    };

    window.addEventListener('starken_badges_changed', handleBadgeUpdate);
    return () => window.removeEventListener('starken_badges_changed', handleBadgeUpdate);
  }, []);

  // Navegación adaptativa según rol (en formato Tipo frase / Sentence case):
  let navItems: { label: string; href: string; icon: any; badge?: string; tabKey?: string }[] = [];

  if (isPricing) {
    navItems = [
      { label: 'Dashboard y KPIs', href: '/?tab=dashboard', icon: LayoutDashboard, tabKey: 'dashboard' },
      { label: 'Rechazos por tarifa', href: '/?tab=rechazos', icon: AlertOctagon, badge: rechazosCount > 0 ? String(rechazosCount) : undefined, tabKey: 'rechazos' },
      { label: 'Clientes y tarifas', href: '/?tab=clientes', icon: Users, tabKey: 'clientes' },
      { label: 'Gestión KAM y SF', href: '/?tab=kam', icon: Share2, badge: kamComsCount > 0 ? String(kamComsCount) : undefined, tabKey: 'kam' },
      { label: 'Auditoría y trazabilidad', href: '/auditoria', icon: ShieldAlert },
      { label: 'Mi perfil y temas', href: '/perfil', icon: User },
    ];
  } else if (isJefatura) {
    navItems = [
      { label: 'Dashboard y KPIs', href: '/', icon: LayoutDashboard },
      { label: 'Gestión clientes', href: '/clientes', icon: Users, badge: clientesReprocesoCount > 0 ? String(clientesReprocesoCount) : undefined },
      { label: 'Aprobaciones V2', href: '/aprobaciones', icon: CheckSquare, badge: aprobacionesV2Count > 0 ? String(aprobacionesV2Count) : undefined },
      { label: 'Auditoría y bitácora', href: '/auditoria', icon: ShieldAlert },
      { label: 'Mi perfil y temas', href: '/perfil', icon: User },
    ];
  } else {
    navItems = [
      { label: 'Home operativo', href: '/', icon: LayoutDashboard },
      { label: 'Crear proforma', href: '/proformas/nueva', icon: FilePlus2 },
      { label: 'Mi perfil y temas', href: '/perfil', icon: User },
    ];
  }

  const roleLabel = isPricing ? 'pricing' : isJefatura ? 'jefatura' : 'ejecutivo';
  const roleBadgeText = isPricing ? 'Pricing' : isJefatura ? 'Jefe' : 'Ejecutivo';
  const roleTitle = isPricing ? 'Encargado de Pricing' : isJefatura ? 'Jefatura de Facturación' : 'Ejecutivo de Facturación';

  return (
    <aside className={`w-[250px] h-screen bg-gradient-to-b ${theme.sidebarBgGradient} border-r border-purple-900/15 dark:border-white/5 flex flex-col fixed top-0 left-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.06)] overflow-hidden`}>
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
      <div className="h-16 flex items-center gap-2.5 px-4.5 border-b border-purple-900/10 dark:border-white/5 relative z-10 bg-white/40 dark:bg-black/20 backdrop-blur-md">
        <div className={`w-8 h-8 bg-gradient-to-br ${theme.accentGradient} rounded-lg flex items-center justify-center font-extrabold text-white text-sm shadow-md shrink-0`}>
          SK
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none truncate">Starken</span>
          <span className={`text-[9px] font-semibold ${theme.accentText} capitalize tracking-wider leading-tight truncate`}>
            Facturación especial
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-2.5 flex flex-col gap-1 relative z-10 overflow-y-auto">
        <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
          <span className="text-micro font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wide">
            Menú {roleLabel}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            {roleBadgeText}
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = isPricing && item.tabKey
            ? (pathname === '/' && currentTab === item.tabKey)
            : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-body font-medium transition-all relative whitespace-nowrap overflow-hidden group ${
                isItemActive
                  ? 'bg-white/95 dark:bg-white/10 text-gray-900 dark:text-white border border-purple-100/90 dark:border-white/10 shadow-xs backdrop-blur-xl'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5'
              }`}
              title={item.label}
            >
              {isItemActive && (
                <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 ${theme.accentBg} rounded-r-md`} />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? theme.accentText : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`flex-1 text-[12.5px] leading-tight truncate whitespace-nowrap ${isItemActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className={`${theme.accentBg} text-white text-[10.5px] font-bold min-w-[19px] h-[19px] px-1.5 rounded-full flex items-center justify-center shadow-xs shrink-0`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-purple-900/10 dark:border-white/5 relative z-10 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-purple-100/80 dark:border-white/10 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
            {user ? getInitials(user.name) : (isPricing ? 'RP' : isJefatura ? 'CM' : 'AV')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
              {user?.name || (isPricing ? 'Rodrigo Palma' : isJefatura ? 'Carlos Muñoz' : 'Ana Valenzuela')}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {roleTitle}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-600 p-1.5 transition-colors rounded-lg hover:bg-red-50/80 dark:hover:bg-red-500/10 cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-red-600" />
          </button>
        </div>
      </div>
    </aside>
  );
}
