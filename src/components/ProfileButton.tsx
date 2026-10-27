import React, { useState } from 'react';
import { User, X, Shield, KeyRound, Crown, LogOut, Settings2 } from 'lucide-react';

interface ProfileButtonProps {
  userName?: string;
  rating?: number;
  avatarUrl?: string;
  favoriteTeam?: string;
  isAdmin?: boolean;
  onAdminLogin?: (pin: string) => boolean | void;
  onAdminLogout?: () => void;
  onOpenLeagueControl?: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  userName = 'کاربر مهمان',
  rating = 1200,
  avatarUrl,
  favoriteTeam = 'eFootball Club',
  isAdmin = false,
  onAdminLogin,
  onAdminLogout,
  onOpenLeagueControl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const initial = userName ? userName.trim().charAt(0) : 'ک';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    
    if (onAdminLogin) {
      const result = onAdminLogin(pinInput);
      if (result === false) {
        setLoginError('رمز عبور مدیر اشتباه است.');
      } else {
        setLoginError('');
        setPinInput('');
      }
    }
  };

  return (
    <>
      {/* Top Corner Circular Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`پروفایل ${userName}`}
          className={`relative w-11 h-11 rounded-full p-0.5 shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none ${
            isAdmin
              ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 ring-2 ring-amber-400/60'
              : 'bg-gradient-to-tr from-emerald-600 via-emerald-400 to-green-300'
          }`}
        >
          <div className="w-full h-full rounded-full bg-emerald-950/90 backdrop-blur-md flex items-center justify-center text-emerald-300 font-bold text-base border border-white/20 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          {/* Active / Online Glow Indicator (Gold for admin, Green for visitor) */}
          <span 
            className={`absolute bottom-0 end-0 w-3.5 h-3.5 rounded-full border-2 border-[#041308] ${
              isAdmin 
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
                : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
            }`} 
          />
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
            className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/85 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.2)] text-white"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9), inset 0 1px 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Top Gloss highlight */}
            <div className="absolute inset-x-6 top-1 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
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
            <div className="flex flex-col items-center mt-4">
              <div 
                className={`w-18 h-18 rounded-full p-1 shadow-lg ${
                  isAdmin
                    ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 shadow-amber-500/30'
                    : 'bg-gradient-to-tr from-emerald-500 to-green-300 shadow-emerald-500/30'
                }`}
              >
                <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center text-2xl font-extrabold text-emerald-300 border border-white/20">
                  {initial}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <h4 className="text-lg font-bold text-white">{userName}</h4>
                {isAdmin && (
                  <span className="p-1 rounded-full bg-amber-400/20 text-amber-300" title="مدیر کل">
                    <Crown className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-400/90 font-medium">
                امتیاز eFootball: {rating} • {favoriteTeam}
              </p>
            </div>

            {/* Admin status vs Visitor status */}
            <div className="mt-4">
              {isAdmin ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Crown className="w-4 h-4" />
                    <span>دسترسی مدیر لیگ فعال است</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    شما دسترسی کامل به ثبت نتایج مسابقات و کنترل لیگ جاری را دارید.
                  </p>
                  
                  {/* Admin Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    {onOpenLeagueControl && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onOpenLeagueControl();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                      >
                        <Settings2 className="w-4 h-4" />
                        <span>کنترل لیگ در حال جریان ⚙️</span>
                      </button>
                    )}

                    {onAdminLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          onAdminLogout();
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-xs flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج از حساب مدیر</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300 mb-2 font-medium">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>حالت مهمان / تماشاگر</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-3">
                    کاربران عادی فقط امکان مشاهده جدول و تاریخچه را دارند. برای مدیریت مسابقات، با رمز ادمین وارد شوید.
                  </p>

                  <form onSubmit={handleLoginSubmit} className="space-y-2">
                    <div className="relative">
                      <input
                        type="password"
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setLoginError('');
                        }}
                        placeholder="رمز عبور مدیر"
                        className="w-full py-2 px-3 pl-8 rounded-xl bg-emerald-950/70 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                      />
                      <KeyRound className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                    </div>

                    {loginError && (
                      <p className="text-[11px] text-rose-400 font-medium">{loginError}</p>
                    )}

                    <button
                      type="submit"
                      aria-label="ورود مدیر"
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all"
                    >
                      ورود مدیر
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
