'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: number;
  type: ToastType;
  title: string;
  msg?: string;
}

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'cancel',
  info: 'info',
  warning: 'warning',
};

const STYLES: Record<ToastType, string> = {
  success: 'border-tertiary/30 bg-white text-tertiary',
  error:   'border-error/30 bg-white text-error',
  info:    'border-primary/30 bg-white text-primary',
  warning: 'border-amber-400/40 bg-white text-amber-600',
};

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-[360px] ${STYLES[toast.type]} animate-[slideIn_0.2s_ease-out]`}>
      <span className={`material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5 icon-filled`}>{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-on-surface">{toast.title}</p>
        {toast.msg && <p className="text-xs text-outline mt-0.5 leading-relaxed">{toast.msg}</p>}
      </div>
      <button type="button" onClick={() => onDismiss(toast.id)} className="text-outline hover:text-on-surface transition-colors flex-shrink-0">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}
