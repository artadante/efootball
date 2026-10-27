import React, { useState } from 'react';
import { Sparkles, Lock, CheckCircle2, User, Shield, AlertCircle } from 'lucide-react';
import { ActiveLeague } from '../types/league';

interface DualWheelProps {
  activeLeague: ActiveLeague | null;
  onSlotAssigned: (slotNumber: number, playerName: string, teamName: string) => void;
}

export const DualWheel: React.FC<DualWheelProps> = ({
  activeLeague,
  onSlotAssigned,
}) => {
  // Empty by default as requested: "هیچ متن پیشفرضی نزار همرو باید دستی وارد کنم"
  const [playersInput, setPlayersInput] = useState('');
  const [teamsInput, setTeamsInput] = useState('');

  // Rotation states for 2 wheels
  const [wheel1Angle, setWheel1Angle] = useState(0);
  const [wheel2Angle, setWheel2Angle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastAssigned, setLastAssigned] = useState<{ slot: number; name: string; team: string } | null>(null);

  // Parse items from input strings
  const playerList = playersInput
    .split(/[\n,،]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const teamList = teamsInput
    .split(/[\n,،]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // If no league created yet
  if (!activeLeague) {
    return (
      <div className="p-6 rounded-3xl bg-emerald-950/60 border border-white/15 backdrop-blur-2xl shadow-xl text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">هنوز لیگی آغاز نشده است</h3>
        <p className="text-sm text-zinc-300">
          برای قرعه‌کشی و تخصیص تیم‌ها، ابتدا با زدن دکمه <span className="font-bold text-emerald-400">+</span> در بالای صفحه لیگ را بسازید.
        </p>
      </div>
    );
  }

  // Find next unassigned slot in the active league
  const nextUnassignedSlot = activeLeague.players.find((p) => !p.name || !p.team);

  // Check if all players are assigned and wheel should be locked
  const isLocked = activeLeague.wheelCompleted || !nextUnassignedSlot;

  if (isLocked) {
    return (
      <div className="p-6 rounded-3xl bg-emerald-950/60 border border-amber-500/30 backdrop-blur-2xl shadow-xl text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">گردونه قفل است 🔒</h3>
          <p className="text-sm text-zinc-300 mt-1">
            تمامی بازیکنان و تیم‌های <span className="font-bold text-emerald-400">{activeLeague.name}</span> تعیین شده‌اند. تا اتمام کامل بازی‌های لیگ، گردونه قفل خواهد بود.
          </p>
        </div>

        {/* Assigned list overview */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-sm text-start space-y-2">
          <span className="text-xs text-zinc-400 font-bold block mb-1">بازیکنان و تیم‌های تعیین‌شده:</span>
          {activeLeague.players.map((p) => (
            <div key={p.slot} className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="font-bold text-white">بازیکن {p.slot}: {p.name}</span>
              <span className="text-emerald-400 font-semibold">{p.team}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentSlotNumber = nextUnassignedSlot.slot;

  const handleDualSpin = () => {
    if (isSpinning) return;
    if (playerList.length === 0 || teamList.length === 0) {
      alert('لطفاً در هر دو کادر زیر حداقل ۱ بازیکن و ۱ تیم وارد کنید.');
      return;
    }

    setIsSpinning(true);
    setLastAssigned(null);

    // Random rotations for Wheel 1 (Players)
    const spins1 = 5 + Math.floor(Math.random() * 4);
    const extraDeg1 = Math.floor(Math.random() * 360);
    const newAngle1 = wheel1Angle + spins1 * 360 + extraDeg1;
    setWheel1Angle(newAngle1);

    // Random rotations for Wheel 2 (Teams)
    const spins2 = 6 + Math.floor(Math.random() * 4);
    const extraDeg2 = Math.floor(Math.random() * 360);
    const newAngle2 = wheel2Angle + spins2 * 360 + extraDeg2;
    setWheel2Angle(newAngle2);

    setTimeout(() => {
      setIsSpinning(false);

      // Calculate picked player
      const norm1 = (360 - (newAngle1 % 360)) % 360;
      const segSize1 = 360 / playerList.length;
      const playerIdx = Math.floor(norm1 / segSize1);
      const chosenPlayer = playerList[playerIdx] || playerList[0];

      // Calculate picked team
      const norm2 = (360 - (newAngle2 % 360)) % 360;
      const segSize2 = 360 / teamList.length;
      const teamIdx = Math.floor(norm2 / segSize2);
      const chosenTeam = teamList[teamIdx] || teamList[0];

      // Assign to current slot
      onSlotAssigned(currentSlotNumber, chosenPlayer, chosenTeam);
      setLastAssigned({ slot: currentSlotNumber, name: chosenPlayer, team: chosenTeam });

      // Remove the chosen player and team from the input so they don't get picked twice!
      const remainingPlayers = playerList.filter((_, idx) => idx !== playerIdx);
      const remainingTeams = teamList.filter((_, idx) => idx !== teamIdx);
      setPlayersInput(remainingPlayers.join(', '));
      setTeamsInput(remainingTeams.join(', '));
    }, 3400);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Container Box */}
      <div className="p-4 rounded-3xl bg-emerald-950/60 border border-white/15 backdrop-blur-2xl shadow-xl">
        
        {/* Progress & Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-amber-400" />
              <span>قرعه‌کشی اختصاص بازیکن و تیم</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
              در حال انتخاب برای: <span className="font-bold text-emerald-400">بازیکن {currentSlotNumber}</span> (از {activeLeague.playerCount} نفر)
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            اسلات {currentSlotNumber} / {activeLeague.playerCount}
          </span>
        </div>

        {/* Manual Input Section (No default text as requested) */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              اسم بازیکنا (با ویرگول جدا کنید):
            </label>
            <textarea
              rows={2}
              value={playersInput}
              onChange={(e) => setPlayersInput(e.target.value)}
              placeholder="مثال: آرتا، علی، رضا، مهران..."
              disabled={isSpinning}
              className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 resize-none"
            />
            <span className="text-xs text-zinc-400 mt-0.5 block">{playerList.length} بازیکن</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">
              اسم تیم‌ها (با ویرگول جدا کنید):
            </label>
            <textarea
              rows={2}
              value={teamsInput}
              onChange={(e) => setTeamsInput(e.target.value)}
              placeholder="مثال: چلسی، رئال، بارسا، اینتر..."
              disabled={isSpinning}
              className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 resize-none"
            />
            <span className="text-xs text-zinc-400 mt-0.5 block">{teamList.length} تیم</span>
          </div>
        </div>

        {/* 2 Graphical Wheels Display */}
        <div className="grid grid-cols-2 gap-3 my-4">
          
          {/* Wheel 1: Players */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-emerald-300 font-bold mb-2">
              <User className="w-4 h-4" />
              <span>چرخونه ۱: بازیکن</span>
            </div>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              {/* Pointer */}
              <div className="absolute -top-2 z-30 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400 drop-shadow-[0_2px_5px_rgba(245,158,11,0.8)]" />

              <div
                className="relative w-full h-full rounded-full border-2 border-amber-400/80 shadow-[0_0_20px_rgba(34,197,94,0.3)] overflow-hidden transition-all duration-[3400ms] ease-out flex items-center justify-center"
                style={{
                  transform: `rotate(${wheel1Angle}deg)`,
                  background: playerList.length > 0
                    ? `conic-gradient(${playerList.map((_, i) => `${i % 2 === 0 ? '#064e3b' : '#022c22'} ${(i * 360) / playerList.length}deg ${((i + 1) * 360) / playerList.length}deg`).join(', ')})`
                    : '#042111',
                }}
              >
                <div className="absolute z-20 w-8 h-8 rounded-full bg-emerald-950 border border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-300">
                  بازیکن
                </div>
                {playerList.map((p, idx) => {
                  const deg = (360 / playerList.length) * idx + (180 / playerList.length);
                  return (
                    <div
                      key={idx}
                      className="absolute text-[8px] font-bold text-white truncate max-w-[45px] select-none"
                      style={{ transform: `rotate(${deg}deg) translate(46px) rotate(90deg)` }}
                    >
                      {p}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Wheel 2: Teams */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-emerald-300 font-bold mb-2">
              <Shield className="w-4 h-4" />
              <span>چرخونه ۲: تیم</span>
            </div>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              {/* Pointer */}
              <div className="absolute -top-2 z-30 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400 drop-shadow-[0_2px_5px_rgba(245,158,11,0.8)]" />

              <div
                className="relative w-full h-full rounded-full border-2 border-amber-400/80 shadow-[0_0_20px_rgba(34,197,94,0.3)] overflow-hidden transition-all duration-[3400ms] ease-out flex items-center justify-center"
                style={{
                  transform: `rotate(${wheel2Angle}deg)`,
                  background: teamList.length > 0
                    ? `conic-gradient(${teamList.map((_, i) => `${i % 2 === 0 ? '#047857' : '#065f46'} ${(i * 360) / teamList.length}deg ${((i + 1) * 360) / teamList.length}deg`).join(', ')})`
                    : '#042111',
                }}
              >
                <div className="absolute z-20 w-8 h-8 rounded-full bg-emerald-950 border border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-300">
                  تیم
                </div>
                {teamList.map((t, idx) => {
                  const deg = (360 / teamList.length) * idx + (180 / teamList.length);
                  return (
                    <div
                      key={idx}
                      className="absolute text-[8px] font-bold text-white truncate max-w-[45px] select-none"
                      style={{ transform: `rotate(${deg}deg) translate(46px) rotate(90deg)` }}
                    >
                      {t}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Announcement of Pick */}
        {lastAssigned && (
          <div className="p-3 my-3 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-center animate-bounce">
            <span className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>بازیکن {lastAssigned.slot}: «{lastAssigned.name}» با تیم «{lastAssigned.team}» ثبت شد!</span>
            </span>
          </div>
        )}

        {/* Dual Spin Action Button */}
        <button
          type="button"
          onClick={handleDualSpin}
          disabled={isSpinning || playerList.length === 0 || teamList.length === 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black font-extrabold text-base shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSpinning ? 'در حال چرخش دو گردونه...' : `چرخش برای بازیکن ${currentSlotNumber} 🎡`}</span>
        </button>
      </div>
    </div>
  );
};
