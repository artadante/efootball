import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PlayerPerformanceGraphProps {
  performancePoints: number[]; // Points (3, 1, 0) per match in chronological order
}

export const PlayerPerformanceGraph: React.FC<PlayerPerformanceGraphProps> = ({
  performancePoints,
}) => {
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
  const height = 120;
  const paddingX = 20;
  const paddingY = 20;

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

  return (
    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>نمودار روند امتیازگیری و عملکرد</span>
        </span>
        <span className="text-[11px] font-mono text-zinc-400">
          مجموع: <strong className="text-white font-bold">{running}</strong> امتیاز
        </span>
      </div>

      <div className="relative w-full overflow-hidden flex justify-center py-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 overflow-visible"
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

          {/* Data Points */}
          {cumulativePoints.map((val, idx) => (
            <circle
              key={idx}
              cx={getX(idx)}
              cy={getY(val)}
              r={idx === cumulativePoints.length - 1 ? 4 : 2.5}
              fill={idx === cumulativePoints.length - 1 ? '#34d399' : '#10b981'}
              stroke="#041308"
              strokeWidth="1.5"
            />
          ))}
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
