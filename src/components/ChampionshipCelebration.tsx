import React, { useEffect, useRef } from 'react';
import { Trophy, X, Share2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEffects';

interface ChampionshipCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  championName: string;
  championTeam: string;
  leagueName: string;
  avatarUrl?: string;
  onOpenStoryPoster?: () => void;
}

export const ChampionshipCelebration: React.FC<ChampionshipCelebrationProps> = ({
  isOpen,
  onClose,
  championName,
  championTeam,
  leagueName,
  avatarUrl,
  onOpenStoryPoster,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Play fanfare and cheering sounds
    soundEngine.playFanfare();

    // Canvas Confetti & Fireworks Simulation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      vRot: number;
      shape: 'rect' | 'circle';
    }

    const particles: Particle[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#34d399', '#10b981', '#38bdf8', '#f43f5e', '#a855f7', '#ffffff'];

    for (let i = 0; i < 220; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Reset if fell below bottom
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="جشن قهرمانی لیگ"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
    >
      {/* Confetti Canvas in background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Main Celebration Card */}
      <div className="relative z-10 w-full max-w-md rounded-[2.5rem] bg-gradient-to-b from-[#1a1305] via-[#0d1c0f] to-[#041208] border-2 border-amber-400/60 p-6 sm:p-8 text-white shadow-[0_0_80px_rgba(245,158,11,0.5)] flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Rotating 3D Golden Trophy with light rays */}
        <div className="relative my-3 flex items-center justify-center">
          {/* Radial light halo */}
          <div className="absolute w-44 h-44 rounded-full bg-amber-400/30 blur-2xl animate-pulse" />
          
          <div className="relative p-6 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.7)] animate-bounce duration-1000">
            <Trophy className="w-20 h-20 text-black stroke-[2.2]" />
          </div>
        </div>

        {/* League Title */}
        <span className="text-xs font-black tracking-widest text-amber-300 uppercase py-1 px-3.5 rounded-full bg-amber-400/20 border border-amber-400/30 mb-2">
          {leagueName}
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-md">
          🏆 قهرمان جدید مسابقات 🏆
        </h2>

        {/* Champion Avatar & Name */}
        <div className="mt-5 mb-3 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-2">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-black text-3xl text-amber-300">
              {avatarUrl ? (
                <img src={avatarUrl} alt={championName} className="w-full h-full object-cover" />
              ) : (
                <span>{championName.charAt(0)}</span>
              )}
            </div>
          </div>

          <h3 className="text-3xl font-black text-white tracking-wide">{championName}</h3>
          <span className="text-sm font-bold text-emerald-400 mt-1">با تیم قدرتمند {championTeam}</span>
        </div>

        {/* Congratulation Message */}
        <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mt-1 mb-5">
          تبریک ویژه به {championName} برای نمایش بی‌نظیر، صلابت در تمام بازی‌ها و کسب مقتدرانه جام قهرمانی دورهمی! 🎉
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          {onOpenStoryPoster && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStoryPoster();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
            >
              <Share2 className="w-4 h-4 text-black stroke-[2.5]" />
              <span>ساخت پوستر قهرمانی برای استوری 📸</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-bold transition-all"
          >
            مشاهده جدول نهایی و بایگانی
          </button>
        </div>
      </div>
    </div>
  );
};
