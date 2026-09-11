'use client';

import { useAuth } from '@/context/auth-context';
import { useTheme, THEMES, ThemeId } from '@/context/theme-context';
import { getInitials } from '@/lib/utils';
import { User, Palette, CheckCircle2, Shield, Mail, KeyRound } from 'lucide-react';

export default function PerfilPage() {
  const { user } = useAuth();
  const { theme, themeId, setThemeId } = useTheme();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">Mi perfil y personalización</h1>
        <p className="text-caption text-gray-600 dark:text-gray-400">
          Administra la información de tu cuenta y personaliza el tema visual de la plataforma.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-xl p-6 shadow-sm flex items-center gap-5">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.accentGradient} flex items-center justify-center text-xl font-black text-white shadow-md`}
        >
          {user ? getInitials(user.name) : 'AN'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-h2 font-semibold text-gray-900 dark:text-gray-100">{user?.name || 'Ana Valenzuela'}</h2>
            <span
              className={`text-micro font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                user?.role === 'Administrador'
                  ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                  : user?.role === 'Jefatura'
                  ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {user?.role || 'Analista'}
            </span>
          </div>
          <p className="text-caption text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5 text-gray-400" /> {user?.email || 'analista@starken.cl'}
          </p>
        </div>
      </div>

      {/* THEME SELECTION SECTION */}
      <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
          <Palette className="w-4 h-4 text-purple-600 dark:text-emerald-400" />
          <h2 className="text-eyebrow font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
            Temas visuales de color (personalización de interfaz)
          </h2>
        </div>

        <p className="text-caption text-gray-600 dark:text-gray-400">
          Selecciona una paleta de color. El tema seleccionado se aplicará de inmediato a toda tu sesión y se recordará automáticamente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const t = THEMES[id];
            const isSelected = themeId === id;

            return (
              <div
                key={id}
                onClick={() => setThemeId(id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'border-purple-600 dark:border-emerald-400 bg-purple-50/40 dark:bg-emerald-500/10 shadow-md ring-2 ring-purple-600/20 dark:ring-emerald-400/20'
                    : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 hover:border-purple-300 dark:hover:border-emerald-400/50 hover:bg-purple-50/20 dark:hover:bg-white/10'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-purple-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                {/* Color Swatch Preview */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg shadow-sm border border-black/10"
                    style={{ backgroundColor: t.previewPrimary }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg shadow-sm border border-black/10"
                    style={{ backgroundColor: t.previewBg }}
                  />
                </div>

                <div>
                  <h3 className="text-body font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1">{t.name}</h3>
                  <p className="text-caption text-gray-600 dark:text-gray-400 leading-relaxed">{t.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
