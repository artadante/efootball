import React, { useState } from 'react';
import { User, X, Shield, KeyRound, Crown, LogOut, Settings2, Plus, Sparkles, UserCheck } from 'lucide-react';
import { RegisteredPlayer } from '../types/player';
import { soundEngine } from '../utils/soundEffects';

export interface ProfileButtonProps {
  userName?: string;
  rating?: number;
  avatarUrl?: string;
  favoriteTeam?: string;
  isAdmin?: boolean;
  registeredPlayers?: RegisteredPlayer[];
  onAdminLogin?: (pin: string) => boolean | void;
  onAdminLogout?: () => void;
  onOpenLeagueControl?: () => void;
  onCreateLeague?: () => void;
  onSelectActiveUser?: (player: RegisteredPlayer | null) => void;
  onOpenPlayerProfile?: (playerName: string) => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  userName = 'کاربر مهمان',
  rating = 1200,
  avatarUrl,
  favoriteTeam = 'eFootball Club',
  isAdmin = false,
  registeredPlayers = [],
  onAdminLogin,
  onAdminLogout,
  onOpenLeagueControl,
  onCreateLeague,
  onSelectActiveUser,
  onOpenPlayerProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const effectiveAvatar = avatarUrl || (isAdmin ? '/admin-avatar.png' : undefined);
  const initial = userName ? userName.trim().charAt(0) : 'ک';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    
    if (onAdminLogin) {
      const result = onAdminLogin(pinInput);
      if (result === false) {
        soundEngine.playClick();
        setLoginError('رمز عبور مدیر اشتباه است.');
      } else {
        soundEngine.playClick();
        setLoginError('');
        setPinInput('');
        // Automatically switch to Arta
        const artaPlayer = registeredPlayers.find((p) => p.name === 'آرتا');
        if (artaPlayer && onSelectActiveUser) {
          onSelectActiveUser(artaPlayer);
        }
      }
    }
  };

  const handleSelectPlayer = (player: RegisteredPlayer | null) => {
    soundEngine.playClick();
    if (!player) {
      // Guest mode
      if (isAdmin && onAdminLogout) {
        onAdminLogout();
      }
      if (onSelectActiveUser) onSelectActiveUser(null);
      return;
    }

    if (onSelectActiveUser) {
      onSelectActiveUser(player);
    }
  };

  // Only show password box if user is on Guest mode and not yet admin
  const isGuestMode = !isAdmin && userName === 'کاربر مهمان';

  return (
    <>
      {/* Top Corner Circular Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setIsOpen(true);
          }}
          aria-label={`پروفایل ${userName}`}
          className={`relative w-11 h-11 rounded-full p-0.5 shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer ${
            isAdmin
              ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 ring-2 ring-amber-400/60'
              : 'bg-gradient-to-tr from-emerald-600 via-emerald-400 to-green-300'
          }`}
        >
          <div className="w-full h-full rounded-full bg-emerald-950/90 backdrop-blur-md flex items-center justify-center text-emerald-300 font-bold text-base border border-white/20 overflow-hidden">
            {effectiveAvatar ? (
              <img src={effectiveAvatar} alt={userName} className="w-full h-full object-cover" />
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

      {/* Liquid Glass Profile Drawer / Modal - Elevated pb-24 on mobile to prevent phone navbar overlap */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="پروفایل کاربر"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          style={{
            paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
            paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom, 0px) + 6rem))',
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-5 sm:p-6 bg-emerald-950/95 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.2)] text-white max-h-[85vh] overflow-y-auto no-scrollbar"
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
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center mt-3">
              <div 
                className={`w-20 h-20 rounded-full p-1 shadow-lg shrink-0 overflow-hidden flex items-center justify-center ${
                  isAdmin
                    ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 shadow-amber-500/30'
                    : 'bg-gradient-to-tr from-emerald-500 to-green-300 shadow-emerald-500/30'
                }`}
              >
                <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center text-2xl font-extrabold text-emerald-300 border border-white/20 overflow-hidden">
                  {effectiveAvatar ? (
                    <img src={effectiveAvatar} alt={userName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{initial}</span>
                  )}
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
              <p className="text-xs text-emerald-400 font-medium">
                امتیاز فوتبال من: {rating} • {favoriteTeam}
              </p>

              {/* View Personal Career Button if player is chosen */}
              {userName !== 'کاربر مهمان' && onOpenPlayerProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenPlayerProfile(userName);
                  }}
                  className="mt-2 py-1 px-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مشاهده کارنامه و کارت اختصاصی من</span>
                </button>
              )}
            </div>

            {/* User Switcher / Selection Grid: Arta is removed from regular list */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="text-xs font-bold text-zinc-300 block mb-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ورود به عنوان کاربر یا بازیکن:</span>
              </span>

              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {/* Guest option */}
                <button
                  type="button"
                  onClick={() => handleSelectPlayer(null)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                    userName === 'کاربر مهمان' && !isAdmin
                      ? 'bg-emerald-500 text-black shadow-md font-black'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-zinc-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate w-full text-[11px]">مهمان</span>
                </button>

                {/* Registered Players (excluding Arta who enters via Admin password) */}
                {registeredPlayers
                  .filter((player) => player.name !== 'آرتا')
                  .map((player) => {
                    const isCurrent = userName === player.name;

                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => handleSelectPlayer(player)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-500 text-black shadow-md font-black'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-black/40 overflow-hidden flex items-center justify-center text-[10px] shrink-0">
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{player.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="truncate w-full text-[11px]">{player.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Admin status vs Visitor status: Password box ONLY visible on Guest mode */}
            <div className="mt-4">
              {isAdmin ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Crown className="w-4 h-4" />
                    <span>دسترسی مدیر لیگ فعال است (آرتا)</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    شما دسترسی کامل به ثبت نتایج مسابقات و کنترل لیگ جاری را دارید.
                  </p>
                  
                  {/* Admin Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    {onCreateLeague && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onCreateLeague();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:brightness-110 text-black font-extrabold text-sm flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>ایجاد مسابقات جدید و قرعه‌کشی</span>
                      </button>
                    )}

                    {onOpenLeagueControl && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onOpenLeagueControl();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Settings2 className="w-4 h-4" />
                        <span>کنترل لیگ در حال جریان</span>
                      </button>
                    )}

                    {onAdminLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          onAdminLogout();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج از حساب مدیر</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : isGuestMode ? (
                /* Password box ONLY appears when user is in Guest mode */
                <div className="p-3.5 rounded-2xl border text-sm bg-black/40 border-white/10 transition-all">
                  <div className="flex items-center gap-2 text-zinc-300 mb-1 font-bold">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>ورود به حساب مدیر کل (آرتا)</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2.5">
                    برای دسترسی به پنل مدیریت لیگ و حساب آرتا، رمز عبور را وارد کنید:
                  </p>

                  <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                    <div className="relative">
                      <input
                        type="password"
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setLoginError('');
                        }}
                        placeholder="رمز عبور مدیر"
                        className="w-full py-2.5 px-3 pl-8 rounded-xl bg-emerald-950/70 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                      />
                      <KeyRound className="w-4 h-4 text-zinc-400 absolute left-2.5 top-3" />
                    </div>

                    {loginError && (
                      <p className="text-xs text-rose-400 font-medium">{loginError}</p>
                    )}

                    <button
                      type="submit"
                      aria-label="ورود مدیر"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      ورود به عنوان آرتا
                    </button>
                  </form>
                </div>
              ) : null}
            </div>

            {/* Prominently elevated close button */}
            <div className="mt-4 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setIsOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
              >
                بستن منو
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
