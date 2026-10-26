import React from 'react';

export const PitchBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-[#041308]">
      {/* Stadium Floodlights Glow Overlays */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-[100px]" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-green-400/15 blur-[100px]" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-emerald-600/10 blur-[120px]" />

      {/* Mowed Turf Lawn Stripes (Horizontal Grass Shades) */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full flex flex-col justify-between">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`w-full flex-1 ${
                i % 2 === 0 ? 'bg-emerald-950/40' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scaled Pitch Markings SVG */}
      <div className="absolute inset-0 flex items-center justify-center p-4 opacity-35">
        <svg
          data-testid="football-pitch"
          viewBox="0 0 680 1050"
          className="w-full h-full max-w-lg object-contain text-emerald-400/40 stroke-current"
          fill="none"
          strokeWidth="3.5"
        >
          {/* Outer Boundary */}
          <rect x="25" y="25" width="630" height="1000" rx="8" />

          {/* Halfway Line */}
          <line x1="25" y1="525" x2="655" y2="525" />

          {/* Center Circle & Center Spot */}
          <circle
            data-testid="center-circle"
            cx="340"
            cy="525"
            r="91.5"
            strokeDasharray="none"
          />
          <circle cx="340" cy="525" r="4" fill="currentColor" />

          {/* Top Penalty Area */}
          <rect
            data-testid="penalty-box"
            x="138.5"
            y="25"
            width="403"
            height="165"
          />
          {/* Top Goal Area */}
          <rect x="248.5" y="25" width="183" height="55" />
          {/* Top Penalty Spot */}
          <circle cx="340" cy="135" r="3.5" fill="currentColor" />
          {/* Top Penalty Arc */}
          <path d="M 270 190 A 91.5 91.5 0 0 0 410 190" />

          {/* Bottom Penalty Area */}
          <rect
            data-testid="penalty-box"
            x="138.5"
            y="860"
            width="403"
            height="165"
          />
          {/* Bottom Goal Area */}
          <rect x="248.5" y="970" width="183" height="55" />
          {/* Bottom Penalty Spot */}
          <circle cx="340" cy="915" r="3.5" fill="currentColor" />
          {/* Bottom Penalty Arc */}
          <path d="M 270 860 A 91.5 91.5 0 0 1 410 860" />

          {/* Corner Arcs */}
          <path d="M 25 45 A 20 20 0 0 0 45 25" />
          <path d="M 635 25 A 20 20 0 0 0 655 45" />
          <path d="M 25 1005 A 20 20 0 0 1 45 1025" />
          <path d="M 635 1025 A 20 20 0 0 1 655 1005" />
        </svg>
      </div>

      {/* Vignette Overlay for Readability */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#041308]/50 to-[#041308]/90" />
    </div>
  );
};
