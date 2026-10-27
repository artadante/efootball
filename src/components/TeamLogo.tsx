import React, { useState } from 'react';
import { findTeam } from '../data/teams';
import { Shield } from 'lucide-react';

interface TeamLogoProps {
  teamName?: string;
  className?: string;
  showNameFallback?: boolean;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  className = 'w-5 h-5',
  showNameFallback = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const team = findTeam(teamName);

  if (!teamName) {
    return <Shield className={`${className} text-emerald-500/50 inline-block`} />;
  }

  if (team && team.logo && !imageError) {
    return (
      <img
        src={team.logo}
        alt={team.name}
        loading="lazy"
        onError={() => setImageError(true)}
        className={`${className} object-contain inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
      />
    );
  }

  // Fallback badge
  const initial = team ? team.name.charAt(0) : teamName.trim().charAt(0);
  const bg = team?.primaryColor || '#064e3b';
  const border = team?.secondaryColor || '#22c55e';

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 border border-white/20 shadow-sm inline-flex`}
      style={{
        backgroundColor: bg,
        borderColor: border,
      }}
      title={teamName}
    >
      <span>{initial}</span>
      {showNameFallback && <span className="sr-only">{teamName}</span>}
    </div>
  );
};
