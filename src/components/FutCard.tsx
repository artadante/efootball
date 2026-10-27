import React, { useState } from 'react';
import { Trophy, Award, Shield, Zap, Sparkles } from 'lucide-react';
import { PlayerCareerStats } from '../types/player';
import { soundEngine } from '../utils/soundEffects';

interface FutCardProps {
  stats: PlayerCareerStats;
  eloRating?: number;
  nickname?: string;
  className?: string;
}

export const FutCard: React.FC<FutCardProps> = ({
  stats,
  eloRating = 1200,
  nickname = 'ستاره مسابقات',
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Calculate dynamic FIFA attributes (scaled 60 - 99)
  const matches = Math.max(1, stats.totalMatches);
  const winRate = stats.winRate; // 0 - 100
  const goalsPerMatch = stats.goalsFor / matches;
  const goalsConcededPerMatch = stats.goalsAgainst / matches;

  // Attributes:
  // PAC: Pace & win speed
  const pac = Math.min(99, Math.max(65, Math.round(70 + (winRate / 100) * 26)));
  // SHO: Shooting & scoring
  const sho = Math.min(99, Math.max(60, Math.round(68 + Math.min(30, goalsPerMatch * 10))));
  // PAS: Passing & control
  const pas = Math.min(99, Math.max(62, Math.round(72 + (stats.wins / matches) * 24)));
  // DRI: Dribbling & skill
  const dri = Math.min(99, Math.max(65, Math.round(74 + (winRate / 100) * 22)));
  // DEF: Defense & clean sheets
  const def = Math.min(99, Math.max(55, Math.round(92 - Math.min(30, goalsConcededPerMatch * 8))));
  // PHY: Physical & durability
  const phy = Math.min(99, Math.max(60, Math.round(70 + Math.min(25, matches * 2))));

  // Overall Rating (OVR)
  const ovr = Math.min(99, Math.max(75, Math.round((pac + sho + pas + dri + def + phy) / 6)));

  const handleCardClick = () => {
    soundEngine.playClick();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      onClick={handleCardClick}
      title="برای چرخش کارت کلیک کنید"
      className={`relative w-64 sm:w-72 h-[380px] sm:h-[420px] cursor-pointer perspective-[1000px] select-none mx-auto ${className}`}
    >
      <div
        className={`w-full h-full relative transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT OF THE CARD */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-[2.5rem] p-4 text-amber-100 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.35)] border-2 border-amber-300/60 bg-gradient-to-b from-[#3a2806] via-[#1a1202] to-[#0d0901]"
        >
          {/* Card Metallic Foil Pattern & Holographic Sheen */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/25 via-yellow-600/10 to-transparent pointer-events-none" />
          <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent transform rotate-45 pointer-events-none" />

          {/* Top Row: OVR, Position, Club */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]">
                {ovr}
              </span>
              <span className="text-xs sm:text-sm font-black tracking-widest text-amber-200/90 -mt-1">
                {stats.wins >= stats.losses ? 'CF' : 'MF'}
              </span>
              <span className="mt-1 text-[10px] py-0.5 px-2 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-bold">
                ELO {eloRating}
              </span>
            </div>

            {/* Emblem badge */}
            <div className="flex flex-col items-center gap-1">
              <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              </div>
              <span className="text-[10px] font-black text-amber-300/80 tracking-wider">SPECIAL</span>
            </div>
          </div>

          {/* Player Avatar */}
          <div className="relative z-10 flex justify-center -mt-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center font-black text-4xl text-amber-300">
                {stats.avatarUrl ? (
                  <img src={stats.avatarUrl} alt={stats.playerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{stats.playerName.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Player Name & Auto Nickname */}
          <div className="relative z-10 text-center -mt-2">
            <h3 className="text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {stats.playerName}
            </h3>
            <span className="inline-block mt-0.5 text-xs font-black text-amber-300 py-0.5 px-3 rounded-full bg-amber-500/20 border border-amber-400/30">
              {nickname}
            </span>
          </div>

          {/* FIFA 6 Attributes Grid */}
          <div className="relative z-10 pt-2 pb-1 border-t border-amber-400/30 grid grid-cols-6 gap-1 text-center font-mono">
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">{pac}</span>
              <span className="text-[9px] font-bold text-amber-300/80">PAC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">{sho}</span>
              <span className="text-[9px] font-bold text-amber-300/80">SHO</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">{pas}</span>
              <span className="text-[9px] font-bold text-amber-300/80">PAS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">{dri}</span>
              <span className="text-[9px] font-bold text-amber-300/80">DRI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">{def}</span>
              <span className="text-[9px] font-bold text-amber-300/80">DEF</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">{phy}</span>
              <span className="text-[9px] font-bold text-amber-300/80">PHY</span>
            </div>
          </div>

          {/* Card Footer Hint */}
          <div className="relative z-10 text-center text-[10px] text-amber-300/60 pb-1">
            <span>↺ برای مشاهده افتخارات کلیک کنید</span>
          </div>
        </div>

        {/* BACK OF THE CARD */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[2.5rem] p-5 text-white flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] border-2 border-amber-300/50 bg-gradient-to-b from-[#1c1404] via-[#0f0b02] to-[#050401]"
        >
          <div className="relative z-10 text-center border-b border-amber-400/20 pb-3">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block">تالار کارنامه شخصی</span>
            <h4 className="text-xl font-black text-white mt-0.5">{stats.playerName}</h4>
          </div>

          <div className="relative z-10 space-y-2.5 my-auto text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>جام‌های قهرمانی:</span>
              </span>
              <span className="font-mono font-black text-amber-300 text-sm">{stats.championships} جام</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>تعداد بازی رسمی:</span>
              </span>
              <span className="font-mono font-black text-white text-sm">{stats.totalMatches} مسابقه</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>نرخ پیروزی:</span>
              </span>
              <span className="font-mono font-black text-cyan-300 text-sm">%{stats.winRate}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>تفاضل گل کل:</span>
              </span>
              <span className={`font-mono font-black text-sm dir-ltr ${
                stats.goalDifference > 0 ? 'text-emerald-400' : stats.goalDifference < 0 ? 'text-rose-400' : 'text-zinc-300'
              }`}>
                {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
              </span>
            </div>
          </div>

          <div className="relative z-10 text-center pt-2 border-t border-amber-400/20">
            <span className="text-[11px] text-amber-300/80 font-bold block">« eFootball Ultimate Card »</span>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">↺ کلیک برای برگشت به روی کارت</span>
          </div>
        </div>
      </div>
    </div>
  );
};
