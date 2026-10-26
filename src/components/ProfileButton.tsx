import React, { useState } from 'react';
import { User, X, Shield, Award, Flame } from 'lucide-react';

interface ProfileButtonProps {
  userName?: string;
  rating?: number;
  avatarUrl?: string;
  favoriteTeam?: string;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  userName = 'کاربر لیگ',
  rating = 1350,
  avatarUrl,
  favoriteTeam = 'FC Barcelona',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const initial = userName ? userName.trim().charAt(0) : 'ک';

  return (
    <>
      {/* Top Corner Circular Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`پروفایل ${userName}`}
          className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-600 via-emerald-400 to-green-300 shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
        >
          <div className="w-full h-full rounded-full bg-emerald-950/90 backdrop-blur-md flex items-center justify-center text-emerald-300 font-bold text-base border border-white/20 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          {/* Active / Online Glow Indicator */}
          <span className="absolute bottom-0 end-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#041308] shadow-[0_0_8px_#34d399]" />
        </button>
      </div>

      {/* Liquid Glass Profile Drawer / Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="پروفایل کاربر"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/80 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.2)] text-white"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9), inset 0 1px 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Top Gloss highlight */}
            <div className="absolute inset-x-6 top-1 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                <span>اطلاعات کاربری</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="بستن پروفایل"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center mt-5">
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-green-300 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center text-3xl font-extrabold text-emerald-300 border border-white/20">
                  {initial}
                </div>
              </div>
              <h4 className="mt-3 text-xl font-bold text-white">{userName}</h4>
              <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                امتیاز eFootball: {rating}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              <div className="rounded-2xl p-2.5 bg-black/40 border border-white/10 text-center">
                <Award className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                <span className="block text-xs text-zinc-400">بردها</span>
                <span className="font-bold text-sm text-white">۱۲</span>
              </div>
              <div className="rounded-2xl p-2.5 bg-black/40 border border-white/10 text-center">
                <Flame className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <span className="block text-xs text-zinc-400">تفاضل گل</span>
                <span className="font-bold text-sm text-emerald-400">+۸</span>
              </div>
              <div className="rounded-2xl p-2.5 bg-black/40 border border-white/10 text-center">
                <Shield className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                <span className="block text-xs text-zinc-400">تیم اصلی</span>
                <span className="font-bold text-[11px] text-zinc-200 truncate">{favoriteTeam}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
              >
                تایید و بازگشت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
