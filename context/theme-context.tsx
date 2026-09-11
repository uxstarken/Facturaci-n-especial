'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'purple' | 'mocha' | 'dark';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  previewBg: string;
  previewPrimary: string;
  // CSS classes / Tokens mapping
  sidebarBgGradient: string;
  sidebarGridColor: string;
  mainBgGradient: string;
  accentGradient: string;
  buttonGradient: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  accentRing: string;
  badgeBg: string;
  checkboxBg: string;
  activeStepBorder: string;
  cardHeaderGradient: string;
  sidebarOrbs: [string, string];
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  purple: {
    id: 'purple',
    name: 'Morado Starken (predeterminado)',
    description: 'Diseño elegante con acentos morado y violeta, malla suave y efecto cristal.',
    previewBg: '#F5F3FF',
    previewPrimary: '#7C3AED',
    sidebarBgGradient: 'from-[#EDE9FE] via-[#F3F4F8] to-[#E0E7FF]',
    sidebarGridColor: 'rgba(124, 58, 237, 0.05)',
    mainBgGradient: 'from-[#F5F3FF] via-[#F8F7FC] to-[#EEF2FF]',
    accentGradient: 'from-purple-600 to-indigo-600',
    buttonGradient: 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
    accentBg: 'bg-purple-600',
    accentBorder: 'border-purple-600',
    accentText: 'text-purple-600',
    accentRing: 'ring-purple-600/20',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/60',
    checkboxBg: 'bg-purple-600 border-purple-600',
    activeStepBorder: 'border-purple-600 ring-2 ring-purple-600/15',
    cardHeaderGradient: 'from-purple-900 via-indigo-900 to-purple-800',
    sidebarOrbs: ['bg-purple-500/20', 'bg-indigo-500/15'],
  },
  mocha: {
    id: 'mocha',
    name: 'Mocka cálido',
    description: 'Elegante paleta moka cálido, tonos café chocolate, espresso y crema.',
    previewBg: '#FAF5F0',
    previewPrimary: '#78350F',
    sidebarBgGradient: 'from-[#F5EBE1] via-[#FAF5F0] to-[#EFE3D5]',
    sidebarGridColor: 'rgba(120, 53, 15, 0.06)',
    mainBgGradient: 'from-[#FAF5F0] via-[#FDFBF7] to-[#F5EBE1]',
    accentGradient: 'from-amber-900 to-stone-800',
    buttonGradient: 'from-amber-900 to-stone-800 hover:from-amber-950 hover:to-stone-900',
    accentBg: 'bg-amber-900',
    accentBorder: 'border-amber-900',
    accentText: 'text-amber-900',
    accentRing: 'ring-amber-900/20',
    badgeBg: 'bg-amber-100/70 text-amber-950 border-amber-300/70',
    checkboxBg: 'bg-amber-900 border-amber-900',
    activeStepBorder: 'border-amber-900 ring-2 ring-amber-900/20',
    cardHeaderGradient: 'from-stone-900 via-amber-950 to-stone-950',
    sidebarOrbs: ['bg-amber-600/15', 'bg-stone-500/15'],
  },
  dark: {
    id: 'dark',
    name: 'Modo oscuro (Cyber Dark)',
    description: 'Modo oscuro cibernético con tonos púrpura noche y destellos verde neón.',
    previewBg: '#0F172A',
    previewPrimary: '#10B981',
    sidebarBgGradient: 'from-[#0B0F19] via-[#0F172A] to-[#1E1B4B]',
    sidebarGridColor: 'rgba(16, 185, 129, 0.08)',
    mainBgGradient: 'from-[#0B0F19] via-[#0F172A] to-[#1E1B4B]',
    accentGradient: 'from-emerald-500 via-teal-500 to-purple-600',
    buttonGradient: 'from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-teal-600',
    accentBg: 'bg-emerald-500',
    accentBorder: 'border-emerald-400',
    accentText: 'text-emerald-400',
    accentRing: 'ring-emerald-400/30',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    checkboxBg: 'bg-emerald-500 border-emerald-500',
    activeStepBorder: 'border-emerald-400 ring-2 ring-emerald-400/30',
    cardHeaderGradient: 'from-slate-950 via-purple-950 to-slate-900',
    sidebarOrbs: ['bg-emerald-500/15', 'bg-purple-500/15'],
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('purple');

  useEffect(() => {
    const stored = localStorage.getItem('starken_fe_theme') as ThemeId;
    if (stored && THEMES[stored]) {
      setThemeIdState(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      setThemeIdState('purple');
      localStorage.setItem('starken_fe_theme', 'purple');
      document.documentElement.classList.toggle('dark', false);
      document.documentElement.setAttribute('data-theme', 'purple');
    }
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem('starken_fe_theme', id);
    document.documentElement.classList.toggle('dark', id === 'dark');
    document.documentElement.setAttribute('data-theme', id);
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
