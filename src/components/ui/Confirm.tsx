'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, HelpCircle, Trash2, X } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

const typeStyles = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    buttonBg: 'bg-red-600 hover:bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    buttonBg: 'bg-orange-600 hover:bg-orange-500',
  },
  info: {
    icon: HelpCircle,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-400',
    buttonBg: 'bg-sky-600 hover:bg-sky-500',
  },
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolver?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolver?.(false);
  };

  const type = options?.type || 'info';
  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Confirm Dialog */}
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${style.iconBg}`}>
                  <Icon className={`w-6 h-6 ${style.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {options.title || 'Confirm'}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {options.message}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-zinc-800 rounded-lg transition -mt-1 -mr-1"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 pt-2 border-t border-zinc-800/50">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition ${style.buttonBg}`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
