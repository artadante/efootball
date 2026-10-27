import React from 'react';
import { ArrowUp, ArrowUpRight, ArrowRight, ArrowDownRight, ArrowDown } from 'lucide-react';
import { calculatePlayerForm } from '../utils/playerForm';

export const PlayerFormBadge: React.FC<{
  results: ('W' | 'D' | 'L')[];
  showLabel?: boolean;
  className?: string;
}> = ({ results, showLabel = false, className = '' }) => {
  const form = calculatePlayerForm(results);

  const renderArrow = () => {
    switch (form.level) {
      case 'excellent':
        return <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />;
      case 'good':
        return <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />;
      case 'normal':
        return <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />;
      case 'poor':
        return <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />;
      case 'terrible':
        return <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />;
    }
  };

  return (
    <span
      title={`فرم: ${form.labelFa} (${form.streakDescription})`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-xs font-bold transition-all cursor-help ${form.bgClass} ${className}`}
    >
      {renderArrow()}
      {showLabel && <span className="text-[10px] hidden sm:inline">{form.labelFa}</span>}
    </span>
  );
};
