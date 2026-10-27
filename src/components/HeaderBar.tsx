import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';
import { ProfileButton } from './ProfileButton';
import { SoundToggle } from './SoundToggle';
import { ActiveLeague } from '../types/league';
import { RegisteredPlayer } from '../types/player';

export interface HeaderBarProps {
  activeLeague: ActiveLeague | null;
  isAdmin: boolean;
  activeUser: RegisteredPlayer | null;
  registeredPlayers: RegisteredPlayer[];
  onAdminLogin: (pin: string) => boolean;
  onAdminLogout: () => void;
  onOpenLeagueControl: () => void;
  onCreateLeague: () => void;
  onSelectActiveUser: (player: RegisteredPlayer | null) => void;
  onOpenProfilesModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeLeague,
  isAdmin,
  activeUser,
  registeredPlayers,
  onAdminLogin,
  onAdminLogout,
  onOpenLeagueControl,
  onCreateLeague,
  onSelectActiveUser,
  onOpenProfilesModal,
}) => {
  return (
    <header className="flex items-center justify-between py-2 gap-2">
      {/* Top-Right: Circular Profile Button & Sound Toggle */}
      <div className="flex items-center gap-2">
        <ProfileButton 
          userName={activeUser ? activeUser.name : (isAdmin ? 'مدیر کل لیگ' : 'کاربر مهمان')} 
          rating={isAdmin ? 1500 : (activeUser ? 1350 : 1200)}
          avatarUrl={activeUser ? activeUser.avatarUrl : (isAdmin ? '/admin-avatar.png' : undefined)}
          isAdmin={isAdmin}
          registeredPlayers={registeredPlayers}
          onAdminLogin={onAdminLogin}
          onAdminLogout={onAdminLogout}
          onOpenLeagueControl={onOpenLeagueControl}
          onCreateLeague={onCreateLeague}
          onSelectActiveUser={onSelectActiveUser}
          onOpenPlayerProfile={onOpenProfilesModal}
        />
        <SoundToggle />
      </div>

      {/* Center: Admin status / Active League Name */}
      <div className="text-center truncate flex-1 min-w-0">
        {activeLeague ? (
          <span className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 truncate block">
            {activeLeague.name}
          </span>
        ) : null}
        {isAdmin && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300 font-bold mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>پنل مدیریت فعال</span>
          </div>
        )}
      </div>

      {/* Top-Left: Player Profiles Directory Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenProfilesModal}
          aria-label="پروفایل و آمار بازیکنان"
          className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 text-black flex items-center justify-center shadow-[0_0_18px_rgba(34,197,94,0.4)] active:scale-95 hover:scale-105 transition-all focus:outline-none cursor-pointer"
          title="پروفایل و آمار بازیکنان"
        >
          <Users className="w-5.5 h-5.5 stroke-[2.2] text-slate-950" />
        </button>
      </div>
    </header>
  );
};
