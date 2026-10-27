import React, { useState } from 'react';
import { Flame, X } from 'lucide-react';
import { TeamLogo } from './TeamLogo';

export interface ScoreEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveScore: (score1: number, score2: number) => void;
  p1: { name: string; team: string };
  p2: { name: string; team: string };
  initialScore1?: number;
  initialScore2?: number;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  isOpen,
  onClose,
  onSaveScore,
  p1,
  p2,
  initialScore1 = 0,
  initialScore2 = 0,
}) => {
  const [score1, setScore1] = useState<number>(initialScore1);
  const [score2, setScore2] = useState<number>(initialScore2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScore(score1, score2);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-sm rounded-3xl p-5 bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
            <Flame className="w-4.5 h-4.5 text-amber-400" />
            <span>ثبت منویی نتیجه مسابقه</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3 text-center">
            {/* Player 1 Dropdown */}
            <div className="flex-1 flex flex-col items-center">
              <TeamLogo teamName={p1.team} className="w-10 h-10 mb-2" />
              <span className="block text-sm font-bold text-white mb-0.5 truncate max-w-[100px]">
                {p1.name}
              </span>
              <span className="text-xs text-zinc-400 mb-2 truncate max-w-[100px]">
                {p1.team}
              </span>
              <label className="text-[11px] text-zinc-400 mb-1 font-medium block">تعداد گل:</label>
              <select
                value={score1}
                onChange={(e) => setScore1(Number(e.target.value))}
                className="w-full py-2.5 px-3 text-center rounded-xl bg-black/60 border border-white/15 font-mono text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {Array.from({ length: 21 }, (_, i) => (
                  <option key={i} value={i} className="bg-slate-900 text-white font-mono text-base">
                    {i} گل
                  </option>
                ))}
              </select>
            </div>

            <span className="text-lg font-black text-zinc-500 font-mono mt-8">-</span>

            {/* Player 2 Dropdown */}
            <div className="flex-1 flex flex-col items-center">
              <TeamLogo teamName={p2.team} className="w-10 h-10 mb-2" />
              <span className="block text-sm font-bold text-white mb-0.5 truncate max-w-[100px]">
                {p2.name}
              </span>
              <span className="text-xs text-zinc-400 mb-2 truncate max-w-[100px]">
                {p2.team}
              </span>
              <label className="text-[11px] text-zinc-400 mb-1 font-medium block">تعداد گل:</label>
              <select
                value={score2}
                onChange={(e) => setScore2(Number(e.target.value))}
                className="w-full py-2.5 px-3 text-center rounded-xl bg-black/60 border border-white/15 font-mono text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {Array.from({ length: 21 }, (_, i) => (
                  <option key={i} value={i} className="bg-slate-900 text-white font-mono text-base">
                    {i} گل
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            ثبت قطعی در جدول
          </button>
        </form>
      </div>
    </div>
  );
};
