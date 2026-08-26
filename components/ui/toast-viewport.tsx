'use client';

import { CheckCircle2, AlertCircle, Info, Coffee, AlertTriangle, X } from 'lucide-react';
import { useToast, ToastVariant } from '@/context/toast-context';

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; bg: string; border: string; titleColor: string; textColor: string; iconBg: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    border: 'border-2 border-emerald-500',
    titleColor: 'text-emerald-950 dark:text-emerald-100',
    textColor: 'text-emerald-900 dark:text-emerald-300',
    iconBg: 'bg-emerald-200/60 dark:bg-emerald-500/20 border border-emerald-300/60',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
  },
  error: {
    icon: AlertTriangle,
    bg: 'bg-[#fffbeb] dark:bg-slate-900',
    border: 'border-2 border-[#f59e0b]',
    titleColor: 'text-[#78350f] dark:text-amber-100',
    textColor: 'text-[#92400e] dark:text-amber-300',
    iconBg: 'bg-[#fef3c7] dark:bg-amber-500/20 border border-[#fde68a] dark:border-amber-500/30',
    iconColor: 'text-[#b45309] dark:text-amber-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#fffbeb] dark:bg-slate-900',
    border: 'border-2 border-[#f59e0b]',
    titleColor: 'text-[#78350f] dark:text-amber-100',
    textColor: 'text-[#92400e] dark:text-amber-300',
    iconBg: 'bg-[#fef3c7] dark:bg-amber-500/20 border border-[#fde68a] dark:border-amber-500/30',
    iconColor: 'text-[#b45309] dark:text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/80',
    border: 'border-2 border-blue-500',
    titleColor: 'text-blue-950 dark:text-blue-100',
    textColor: 'text-blue-900 dark:text-blue-300',
    iconBg: 'bg-blue-200/60 dark:bg-blue-500/20 border border-blue-300/60',
    iconColor: 'text-blue-700 dark:text-blue-400',
  },
  wellbeing: {
    icon: Coffee,
    bg: 'bg-amber-50 dark:bg-amber-950/80',
    border: 'border-2 border-amber-500',
    titleColor: 'text-amber-950 dark:text-amber-100',
    textColor: 'text-amber-900 dark:text-amber-300',
    iconBg: 'bg-amber-200/60 dark:bg-amber-500/20 border border-amber-300/60',
    iconColor: 'text-amber-700 dark:text-amber-400',
  },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-[100] flex flex-col gap-2.5 w-[min(400px,calc(100vw-2.5rem))] pointer-events-none">
      {toasts.map((t) => {
        const style = VARIANT_STYLES[t.variant] || VARIANT_STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl transition-all ${style.bg} ${style.border}`}
          >
            <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
              <Icon className={`w-5 h-5 ${style.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              {t.title && (
                <h4 className={`text-body font-bold leading-tight ${style.titleColor}`}>
                  {t.title}
                </h4>
              )}
              <p className={`text-caption font-medium leading-snug ${style.textColor} ${t.title ? 'mt-0.5' : ''}`}>
                {t.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className={`shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${style.textColor}`}
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
