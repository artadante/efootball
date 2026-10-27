export type FormLevel = 'excellent' | 'good' | 'normal' | 'poor' | 'terrible';

export interface PlayerFormDetails {
  level: FormLevel;
  labelFa: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  streakDescription: string;
}

/**
 * Calculates player form based on recent match results (W / D / L)
 */
export function calculatePlayerForm(recentResults: ('W' | 'D' | 'L')[]): PlayerFormDetails {
  if (!recentResults || recentResults.length === 0) {
    return {
      level: 'normal',
      labelFa: 'معمولی',
      icon: '➡️',
      colorClass: 'text-yellow-400',
      bgClass: 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300',
      streakDescription: 'بدون بازی اخیر',
    };
  }

  // Look at last 3 to 5 matches
  const sample = recentResults.slice(0, 4);
  const total = sample.length;
  let points = 0;
  let winStreak = 0;
  let loseStreak = 0;

  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 'W') points += 3;
    else if (sample[i] === 'D') points += 1;
  }

  // Check streaks starting from most recent
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 'W') winStreak++;
    else break;
  }
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 'L') loseStreak++;
    else break;
  }

  const maxPoints = total * 3;
  const ratio = points / maxPoints;

  if (winStreak >= 2 || ratio >= 0.85) {
    return {
      level: 'excellent',
      labelFa: 'آتشین (On Fire 🔥)',
      icon: '⬆️',
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]',
      streakDescription: `${winStreak > 0 ? winStreak + ' برد پیاپی' : 'آمادگی عالی'}`,
    };
  }

  if (ratio >= 0.6) {
    return {
      level: 'good',
      labelFa: 'خوب و آماده',
      icon: '↗️',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
      streakDescription: 'روند صعودی و مثبت',
    };
  }

  if (loseStreak >= 2 || ratio <= 0.2) {
    return {
      level: 'terrible',
      labelFa: 'بحرانی و یخ‌زده (Cold ❄️)',
      icon: '⬇️',
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
      streakDescription: `${loseStreak > 0 ? loseStreak + ' باخت متوالی' : 'افت شدید'}`,
    };
  }

  if (ratio < 0.45) {
    return {
      level: 'poor',
      labelFa: 'رو به افت',
      icon: '↘️',
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-500/20 border-orange-400/40 text-orange-300',
      streakDescription: 'نتایج ناپایدار اخیر',
    };
  }

  return {
    level: 'normal',
    labelFa: 'معمولی و یکنواخت',
    icon: '➡️',
    colorClass: 'text-yellow-400',
    bgClass: 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300',
    streakDescription: 'فرم استاندارد',
  };
}
