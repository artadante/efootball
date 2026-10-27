import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/soundEffects';

export const SoundToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());

  const handleToggle = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isMuted ? 'فعال‌سازی افکت‌های صوتی' : 'قطع صدای افکت‌ها'}
      aria-label={isMuted ? 'فعال‌سازی افکت‌های صوتی' : 'قطع صدای افکت‌ها'}
      className={`p-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-zinc-300 hover:text-white flex items-center justify-center border border-white/10 shadow-sm cursor-pointer ${className}`}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 text-zinc-400" />
      ) : (
        <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
      )}
    </button>
  );
};
