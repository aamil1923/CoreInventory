'use client';
import { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'success' | 'destructive';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

// Global toast emitter (simple event-based)
type ToastHandler = (msg: Omit<ToastMessage, 'id'>) => void;
let _handler: ToastHandler | null = null;

export function toast(msg: Omit<ToastMessage, 'id'>) {
  _handler?.(msg);
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Register handler
  _handler = addToast;

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
