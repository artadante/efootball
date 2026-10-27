import React, { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';

interface PlayerPerformanceGraphProps {
  performancePoints: number[]; // Points (3, 1, 0) per match in chronological order
}

export const PlayerPerformanceGraph: React.FC<PlayerPerformanceGraphProps> = ({
  performancePoints,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!performancePoints || performancePoints.length === 0) {
    return (
      <div className="py-6 px-4 rounded-2xl bg-black/30 border border-white/10 text-center text-xs text-zinc-400">
        <TrendingUp className="w-5 h-5 mx-auto mb-1.5 text-zinc-500 opacity-60" />
        هنوز مسابقه‌ای برای نمایش نمودار عملکرد ثبت نشده است.
      </div>
    );
  }

  // Calculate cumulative points over career matches
  const cumulativePoints: number[] = [0];
  let running = 0;
  for (const pt of performancePoints) {
    running += pt;
    cumulativePoints.push(running);
  }

  const width = 340;
  const height = 130;
  const paddingX = 20;
  const paddingY = 25;

  const maxPoints = Math.max(...cumulativePoints, 3);
  const minPoints = 0;

  const getX = (index: number) => {
    if (cumulativePoints.length <= 1) return paddingX;
    return paddingX + (index / (cumulativePoints.length - 1)) * (width - 2 * paddingX);
  };

  const getY = (val: number) => {
    const range = maxPoints - minPoints || 1;
    return height - paddingY - ((val - minPoints) / range) * (height - 2 * paddingY);
  };

  const pointsString = cumulativePoints.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');

  // Create SVG path for the area fill
  const firstX = getX(0);
  const lastX = getX(cumulativePoints.length - 1);
  const bottomY = height - paddingY + 6;
  const areaPath = `M ${firstX},${bottomY} L ${pointsString} L ${lastX},${bottomY} Z`;

  // Handle Mouse/Touch Move to find closest index
  const handlePointerMove = (clientX: number, target: SVGSVGElement) => {
    const rect = target.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    let closestIdx = 0;
    let minDiff = Infinity;
    cumulativePoints.forEach((_, idx) => {
      const diff = Math.abs(getX(idx) - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIdx(closestIdx);
  };

  const activePointIndex = hoveredIdx !== null ? hoveredIdx : cumulativePoints.length - 1;
  const activePointScore = cumulativePoints[activePointIndex];
  const activeMatchResult = activePointIndex > 0 ? performancePoints[activePointIndex - 1] : null;

  return (
    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
      {/* Header with Title and Current Hover Value */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>نمودار روند امتیازگیری و عملکرد</span>
        </span>
        <span className="text-[11px] font-mono text-zinc-300">
          مجموع: <strong className="text-emerald-400 font-bold">{running}</strong> امتیاز
        </span>
      </div>

      {/* Floating Interactive Hover Info Card */}
      {hoveredIdx !== null ? (
        <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-center animate-fadeIn text-xs flex items-center justify-between px-3">
          <span className="font-bold text-white">
            {hoveredIdx === 0 ? 'نقطه شروع مسابقات' : `مسابقه شماره ${hoveredIdx}`}
          </span>
          {activeMatchResult !== null && (
            <span className={`font-bold px-2 py-0.5 rounded-md ${
              activeMatchResult === 3
                ? 'bg-emerald-500/25 text-emerald-300'
                : activeMatchResult === 1
                ? 'bg-amber-400/25 text-amber-300'
                : 'bg-rose-500/25 text-rose-300'
            }`}>
              {activeMatchResult === 3 ? 'پیروزی (+۳ امتیاز)' : activeMatchResult === 1 ? 'مساوی (+۱ امتیاز)' : 'شکست (۰ امتیاز)'}
            </span>
          )}
          <span className="font-mono font-black text-emerald-400">
            مجموع تا اینجا: {activePointScore} امتیاز
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 py-0.5">
          <Info className="w-3.5 h-3.5 text-emerald-400/70" />
          <span>برای مشاهده جزئیات هر مسابقه، موس را روی نمودار حرکت دهید</span>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden flex justify-center py-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-32 overflow-visible cursor-crosshair touch-none"
          onMouseMove={(e) => handlePointerMove(e.clientX, e.currentTarget)}
          onMouseLeave={() => setHoveredIdx(null)}
          onTouchMove={(e) => {
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.currentTarget);
          }}
          onTouchEnd={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#34d399" />
            </filter>
          </defs>

          {/* Grid horizontal guidelines */}
          <line
            x1={paddingX}
            y1={getY(maxPoints)}
            x2={width - paddingX}
            y2={getY(maxPoints)}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={getY(0)}
            x2={width - paddingX}
            y2={getY(0)}
            stroke="rgba(255,255,255,0.12)"
          />

          {/* Area Fill */}
          <path d={areaPath} fill="url(#performanceGradient)" />

          {/* Glowing Line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
            filter="url(#glow)"
          />

          {/* Vertical Indicator on Hover */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={paddingY - 5}
              x2={getX(hoveredIdx)}
              y2={height - paddingY + 6}
              stroke="#34d399"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
          )}

          {/* Data Points */}
          {cumulativePoints.map((val, idx) => {
            const isHovered = hoveredIdx === idx;
            const isLast = idx === cumulativePoints.length - 1;

            return (
              <circle
                key={idx}
                cx={getX(idx)}
                cy={getY(val)}
                r={isHovered ? 6 : isLast ? 4 : 2.5}
                fill={isHovered ? '#fbbf24' : isLast ? '#34d399' : '#10b981'}
                stroke={isHovered ? '#ffffff' : '#041308'}
                strokeWidth={isHovered ? 2 : 1.5}
                filter={isHovered ? 'url(#glow)' : undefined}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 font-mono">
        <span>شروع سوابق</span>
        <span>{performancePoints.length} بازی ثبت‌شده</span>
        <span className="text-emerald-400 font-bold">وضعیت فعلی</span>
      </div>
    </div>
  );
};
