import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLogin: (pin: string) => boolean;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminLogin,
}) => {
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAdminLogin(unlockPinInput)) {
      setUnlockError('رمز عبور مدیر اشتباه است.');
    } else {
      setUnlockPinInput('');
      setUnlockError('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/95 border border-amber-500/30 backdrop-blur-2xl shadow-2xl text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>دسترسی مدیر لازم است</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 text-center">
          <p className="text-sm text-zinc-200">
            فقط مدیر لیگ امکان ساخت لیگ و ثبت نتایج را دارد. اگر شما مدیر هستید، رمز عبور را وارد کنید:
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              value={unlockPinInput}
              onChange={(e) => {
                setUnlockPinInput(e.target.value);
                setUnlockError('');
              }}
              placeholder="رمز عبور مدیر"
              className="w-full py-2.5 px-3 text-center rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              autoFocus
            />

            {unlockError && (
              <p className="text-xs text-rose-400 font-medium">{unlockError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              تایید رمز و ورود
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
