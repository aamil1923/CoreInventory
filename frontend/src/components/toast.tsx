'use client';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToastState } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, dismiss } = useToastState();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
            'animate-fade-up backdrop-blur-sm',
            t.variant === 'success' && 'bg-card border-success/40 text-foreground',
            t.variant === 'destructive' && 'bg-card border-destructive/40 text-foreground',
            (!t.variant || t.variant === 'default') && 'bg-card border-border text-foreground'
          )}
        >
          {t.variant === 'success' && <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />}
          {t.variant === 'destructive' && <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
          {(!t.variant || t.variant === 'default') && <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
