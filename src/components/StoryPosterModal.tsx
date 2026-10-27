import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Share2, Sparkles, Check } from 'lucide-react';
import { soundEngine } from '../utils/soundEffects';
import { StandingRow } from '../types/league';

interface StoryPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterType?: 'match' | 'table';
  title?: string;
  player1Name?: string;
  player1Team?: string;
  player2Name?: string;
  player2Team?: string;
  score1?: number | null;
  score2?: number | null;
  isPlayed?: boolean;
  leagueName?: string;
  standings?: StandingRow[];
}

export const StoryPosterModal: React.FC<StoryPosterModalProps> = ({
  isOpen,
  onClose,
  posterType = 'match',
  title = 'MATCHDAY',
  player1Name = 'بازیکن ۱',
  player1Team = 'تیم ۱',
  player2Name = 'بازیکن ۲',
  player2Team = 'تیم ۲',
  score1,
  score2,
  isPlayed = false,
  leagueName = 'لیگ دوستانه eFootball',
  standings = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size for vertical story (9:16 aspect ratio, 720x1280)
    canvas.width = 720;
    canvas.height = 1280;

    // 1. Background: Deep OLED sports gaming dark gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 720, 1280);
    bgGradient.addColorStop(0, '#031409');
    bgGradient.addColorStop(0.3, '#020b05');
    bgGradient.addColorStop(0.7, '#041d0c');
    bgGradient.addColorStop(1, '#010502');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 720, 1280);

    // 2. Neon Stadium Glows
    const radialGlow = ctx.createRadialGradient(360, 480, 50, 360, 480, 450);
    radialGlow.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
    radialGlow.addColorStop(0.6, 'rgba(16, 185, 129, 0.06)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, 720, 1280);

    // 3. Pitch Lines Overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(360, 640, 180, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Header Top Brand
    ctx.textAlign = 'center';
    ctx.font = '900 24px Vazirmatn, system-ui, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('⚡ EFOOTBALL FRIENDS LEAGUE ⚡', 360, 95);

    ctx.font = 'bold 18px Vazirmatn, system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(leagueName, 360, 130);

    if (posterType === 'table') {
      // ===== STANDINGS TABLE POSTER =====
      // Title
      ctx.font = '900 52px Vazirmatn, system-ui, sans-serif';
      const goldGradient = ctx.createLinearGradient(160, 180, 560, 180);
      goldGradient.addColorStop(0, '#f59e0b');
      goldGradient.addColorStop(0.5, '#fef08a');
      goldGradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = goldGradient;
      ctx.fillText('جدول رده‌بندی مسابقات', 360, 205);

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, 230);
      ctx.lineTo(540, 230);
      ctx.stroke();

      // Table Column Headers
      const startY = 275;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 16px Vazirmatn, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('رتبه و بازیکن', 650, startY);
      ctx.textAlign = 'center';
      ctx.fillText('بازی', 290, startY);
      ctx.fillText('برد', 220, startY);
      ctx.fillText('تفاضل', 150, startY);
      ctx.fillText('امتیاز', 80, startY);

      // Rows (up to 8 rows)
      const rows = standings.slice(0, 8);
      let currentY = startY + 25;
      const rowHeight = 85;

      rows.forEach((s) => {
        // Row Box
        ctx.fillStyle = s.rank === 1 ? 'rgba(245, 158, 11, 0.16)' : 'rgba(6, 78, 59, 0.45)';
        ctx.beginPath();
        ctx.roundRect(50, currentY, 620, 72, 18);
        ctx.fill();
        ctx.strokeStyle = s.rank === 1 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(52, 211, 153, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Rank Badge
        let rankColor = '#ffffff';
        let rankText = `#${s.rank}`;
        if (s.rank === 1) {
          rankColor = '#fbbf24';
          rankText = '🥇';
        } else if (s.rank === 2) {
          rankColor = '#e2e8f0';
          rankText = '🥈';
        } else if (s.rank === 3) {
          rankColor = '#f97316';
          rankText = '🥉';
        }

        ctx.textAlign = 'center';
        ctx.font = '900 22px Vazirmatn, system-ui, sans-serif';
        ctx.fillStyle = rankColor;
        ctx.fillText(rankText, 630, currentY + 44);

        // Player Name & Team
        ctx.textAlign = 'right';
        ctx.font = '900 22px Vazirmatn, system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(s.name, 590, currentY + 34);

        ctx.font = '14px Vazirmatn, system-ui, sans-serif';
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText(s.team, 590, currentY + 58);

        // Stats
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px monospace, system-ui';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(String(s.played), 290, currentY + 45);
        ctx.fillText(String(s.won), 220, currentY + 45);

        // Goal Diff
        const gdText = s.goalDiff > 0 ? `+${s.goalDiff}` : String(s.goalDiff);
        ctx.fillStyle = s.goalDiff > 0 ? '#34d399' : s.goalDiff < 0 ? '#f87171' : '#cbd5e1';
        ctx.fillText(gdText, 150, currentY + 45);

        // Points
        ctx.font = '900 26px monospace, system-ui';
        ctx.fillStyle = s.rank === 1 ? '#fbbf24' : '#34d399';
        ctx.fillText(String(s.points), 80, currentY + 46);

        currentY += rowHeight;
      });

      // Bottom Callout
      if (standings.length > 0) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
        ctx.font = 'bold 18px Vazirmatn, system-ui, sans-serif';
        ctx.fillText(`👑 صدرنشین جدول: ${standings[0].name} (${standings[0].team})`, 360, 1080);
      }
    } else {
      // ===== MATCHDAY / MATCH RESULT POSTER =====
      // 5. Big Golden MATCHDAY Title
      ctx.font = '900 68px Vazirmatn, system-ui, sans-serif';
      const goldGradient = ctx.createLinearGradient(160, 210, 560, 210);
      goldGradient.addColorStop(0, '#f59e0b');
      goldGradient.addColorStop(0.5, '#fef08a');
      goldGradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = goldGradient;
      ctx.fillText(title, 360, 240);

      // Divider Line
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 270);
      ctx.lineTo(520, 270);
      ctx.stroke();

      // 6. Player 1 Card (Top)
      ctx.fillStyle = 'rgba(6, 78, 59, 0.5)';
      ctx.beginPath();
      ctx.roundRect(100, 320, 520, 180, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px Vazirmatn, system-ui, sans-serif';
      ctx.fillText(player1Name, 360, 390);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 24px Vazirmatn, system-ui, sans-serif';
      ctx.fillText(player1Team, 360, 440);

      // 7. Middle Score or VS Circle
      ctx.beginPath();
      ctx.arc(360, 640, 75, 0, Math.PI * 2);
      ctx.fillStyle = '#061c0d';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (isPlayed && typeof score1 === 'number' && typeof score2 === 'number') {
        ctx.fillStyle = '#34d399';
        ctx.font = '900 52px system-ui, monospace';
        ctx.fillText(`${score1} - ${score2}`, 360, 658);
      } else {
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 44px system-ui, sans-serif';
        ctx.fillText('VS', 360, 655);
      }

      // 8. Player 2 Card (Bottom)
      ctx.fillStyle = 'rgba(6, 78, 59, 0.5)';
      ctx.beginPath();
      ctx.roundRect(100, 780, 520, 180, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px Vazirmatn, system-ui, sans-serif';
      ctx.fillText(player2Name, 360, 850);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 24px Vazirmatn, system-ui, sans-serif';
      ctx.fillText(player2Team, 360, 900);
    }

    // Footer Info & Social Tag
    ctx.textAlign = 'center';
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 20px Vazirmatn, system-ui, sans-serif';
    ctx.fillText('🏆 رقابت دوستانه گیمرهای دورهمی 🏆', 360, 1160);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Vazirmatn, system-ui, sans-serif';
    ctx.fillText('@eFootball_Friends_Cup', 360, 1195);
  }, [
    isOpen,
    posterType,
    player1Name,
    player1Team,
    player2Name,
    player2Team,
    score1,
    score2,
    isPlayed,
    leagueName,
    title,
    standings,
  ]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEngine.playClick();
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download =
      posterType === 'table'
        ? `standings-story-${leagueName || 'league'}.png`
        : `matchday-${player1Name}-vs-${player2Name}.png`;
    link.href = imageUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="پوستر استوری مسابقه"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-emerald-950/90 border border-white/20 p-5 text-white shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-base text-white">
              {posterType === 'table' ? 'پوستر استوری جدول رده‌بندی' : 'پوستر استوری مسابقه'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="w-full flex justify-center py-2 overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner">
          <canvas
            ref={canvasRef}
            className="max-h-[50vh] w-auto aspect-[9/16] object-contain rounded-xl shadow-2xl"
          />
        </div>

        {/* Action Button */}
        <div className="w-full mt-4 space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-5 h-5 text-black stroke-[3]" />
                <span>پوستر با موفقیت ذخیره شد!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-black" />
                <span>دانلود عکس با کیفیت بالا (استوری)</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>آماده برای اشتراک‌گذاری در استوری اینستاگرام، واتساپ و تلگرام</span>
          </p>
        </div>
      </div>
    </div>
  );
};
