import React, { useState } from 'react';
import { ActiveLeague } from '../types/league';

interface PositionProgressionChartProps {
  activeLeague: ActiveLeague;
}

export const PositionProgressionChart: React.FC<PositionProgressionChartProps> = ({ activeLeague }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    round: number;
    playerName: string;
    rank: number;
    points: number;
    x: number;
    y: number;
  } | null>(null);

  const players = activeLeague.players.filter((p) => p.name);
  if (players.length < 2) {
    return (
      <div className="p-4 rounded-3xl bg-black/40 border border-white/10 text-center text-xs text-zinc-400">
        برای رسم نمودار روند رتبه‌ها حداقل ۲ بازیکن نیاز است.
      </div>
    );
  }

  // Find maximum played round
  const playedMatches = activeLeague.matches.filter(
    (m) => m.isPlayed && typeof m.score1 === 'number' && typeof m.score2 === 'number'
  );
  if (playedMatches.length === 0) {
    return (
      <div className="p-4 rounded-3xl bg-black/40 border border-white/10 text-center text-xs text-zinc-400">
        هنوز مسابقه‌ای ثبت نشده است تا نمودار روند صعود و سقوط رسم شود.
      </div>
    );
  }

  const maxRound = Math.max(...playedMatches.map((m) => m.round));
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

  // Compute standings after each round
  // player -> array of ranks at round r
  interface RoundState {
    points: number;
    gd: number;
    gf: number;
  }

  const playerRanksByRound: Record<string, { round: number; rank: number; points: number }[]> = {};
  players.forEach((p) => {
    playerRanksByRound[p.name!] = [];
  });

  const cumulativeState: Record<string, RoundState> = {};
  players.forEach((p) => {
    cumulativeState[p.name!] = { points: 0, gd: 0, gf: 0 };
  });

  for (const r of rounds) {
    // Add matches of round r
    const roundMatches = playedMatches.filter((m) => m.round === r);
    for (const m of roundMatches) {
      const p1 = activeLeague.players.find((p) => p.slot === m.player1Slot)?.name;
      const p2 = activeLeague.players.find((p) => p.slot === m.player2Slot)?.name;
      const s1 = m.score1 ?? 0;
      const s2 = m.score2 ?? 0;

      if (p1 && cumulativeState[p1]) {
        cumulativeState[p1].gf += s1;
        cumulativeState[p1].gd += s1 - s2;
        if (s1 > s2) cumulativeState[p1].points += 3;
        else if (s1 === s2) cumulativeState[p1].points += 1;
      }
      if (p2 && cumulativeState[p2]) {
        cumulativeState[p2].gf += s2;
        cumulativeState[p2].gd += s2 - s1;
        if (s2 > s1) cumulativeState[p2].points += 3;
        else if (s2 === s1) cumulativeState[p2].points += 1;
      }
    }

    // Sort players at this round to find ranks
    const sorted = [...players].sort((a, b) => {
      const stA = cumulativeState[a.name!];
      const stB = cumulativeState[b.name!];
      if (stB.points !== stA.points) return stB.points - stA.points;
      if (stB.gd !== stA.gd) return stB.gd - stA.gd;
      return stB.gf - stA.gf;
    });

    sorted.forEach((p, idx) => {
      playerRanksByRound[p.name!].push({
        round: r,
        rank: idx + 1,
        points: cumulativeState[p.name!].points,
      });
    });
  }

  // Palette of distinct colors for each player
  const colors = [
    '#34d399', // Emerald
    '#38bdf8', // Sky
    '#fbbf24', // Amber
    '#f43f5e', // Rose
    '#a855f7', // Purple
    '#fb923c', // Orange
    '#ec4899', // Pink
    '#22c55e', // Green
  ];

  // SVG dimensions
  const width = 640;
  const height = 260;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const totalPlayers = players.length;

  const getX = (roundIndex: number) => {
    if (rounds.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (roundIndex / (rounds.length - 1)) * chartW;
  };

  const getY = (rank: number) => {
    // Rank 1 is at top (paddingTop), Rank totalPlayers is at bottom (paddingTop + chartH)
    if (totalPlayers <= 1) return paddingTop + chartH / 2;
    return paddingTop + ((rank - 1) / (totalPlayers - 1)) * chartH;
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-black/45 border border-white/10 space-y-3 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-black text-sm text-white">نمودار صعود و سقوط در طول فصل 📈</h4>
          <span className="text-[11px] text-zinc-400">تغییرات رتبه هر بازیکن هفته به هفته</span>
        </div>
      </div>

      {/* Responsive SVG Container */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px] h-auto select-none overflow-visible"
        >
          {/* Horizontal Grid lines for each rank */}
          {Array.from({ length: totalPlayers }, (_, i) => i + 1).map((r) => {
            const y = getY(r);
            return (
              <g key={`grid-rank-${r}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="end"
                  fontFamily="system-ui"
                >
                  {r === 1 ? '🥇 ۱' : `${r}`}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid lines for each round */}
          {rounds.map((r, idx) => {
            const x = getX(idx);
            return (
              <g key={`grid-round-${r}`}>
                <text
                  x={x}
                  y={height - 15}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Vazirmatn, system-ui"
                >
                  هفته {r}
                </text>
              </g>
            );
          })}

          {/* Player Lines */}
          {players.map((p, pIdx) => {
            const color = colors[pIdx % colors.length];
            const history = playerRanksByRound[p.name!] || [];
            if (history.length === 0) return null;

            const pathD = history
              .map((pt, idx) => {
                const x = getX(idx);
                const y = getY(pt.rank);
                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ');

            return (
              <g key={p.name}>
                {/* Glow shadow line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="5"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                />
                {/* Main line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Nodes */}
                {history.map((pt, idx) => {
                  const cx = getX(idx);
                  const cy = getY(pt.rank);

                  return (
                    <circle
                      key={`node-${p.name}-${pt.round}`}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill={color}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={() => {
                        setHoveredPoint({
                          round: pt.round,
                          playerName: p.name!,
                          rank: pt.rank,
                          points: pt.points,
                          x: cx,
                          y: cy,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Tooltip Popup on Hover */}
          {hoveredPoint && (
            <g
              transform={`translate(${Math.min(width - 120, Math.max(10, hoveredPoint.x - 60))}, ${Math.max(
                5,
                hoveredPoint.y - 45
              )})`}
              className="pointer-events-none transition-all"
            >
              <rect
                width="120"
                height="38"
                rx="8"
                fill="#0f172a"
                stroke="rgba(255,255,255,0.2)"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
              />
              <text
                x="60"
                y="16"
                fill="#ffffff"
                fontSize="11"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="Vazirmatn, system-ui"
              >
                {hoveredPoint.playerName}
              </text>
              <text
                x="60"
                y="30"
                fill="#34d399"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Vazirmatn, system-ui"
              >
                رتبه {hoveredPoint.rank} • {hoveredPoint.points} امتیاز
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend below chart */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-white/5">
        {players.map((p, idx) => (
          <div key={p.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="text-zinc-300 font-bold">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
