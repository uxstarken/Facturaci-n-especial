'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'wellbeing' | 'warning';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (messageOrTitle: string, variantOrMessage?: any, durationOrVariant?: any, optionalTitle?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (messageOrTitle: string, variantOrMessage: any = 'info', durationOrVariant: any = DEFAULT_DURATION, optionalTitle?: string) => {
      let title: string | undefined = optionalTitle;
      let message: string = messageOrTitle;
      let variant: ToastVariant = 'info';
      let duration: number = DEFAULT_DURATION;

      const validVariants: ToastVariant[] = ['success', 'error', 'info', 'wellbeing', 'warning'];

      if (typeof variantOrMessage === 'string' && validVariants.includes(variantOrMessage as ToastVariant)) {
        // Form: showToast(message, 'success', 4000, 'Title')
        variant = variantOrMessage as ToastVariant;
        message = messageOrTitle;
        if (typeof durationOrVariant === 'number') duration = durationOrVariant;
        title = optionalTitle;
      } else if (typeof variantOrMessage === 'string' && typeof durationOrVariant === 'string' && validVariants.includes(durationOrVariant as ToastVariant)) {
        // Form: showToast('Title', 'Message', 'success')
        title = messageOrTitle;
        message = variantOrMessage;
        variant = durationOrVariant as ToastVariant;
      } else if (typeof variantOrMessage === 'string') {
        // Form: showToast('Title', 'Message')
        title = messageOrTitle;
        message = variantOrMessage;
        variant = 'info';
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, variant, title, message }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
