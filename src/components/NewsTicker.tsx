import React from 'react';
import { Radio, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEffects';

export interface NewsItem {
  id: string;
  category: string;
  headline: string;
  subtitle: string;
}

export interface NewsTickerProps {
  latestNews: NewsItem | null;
  onDismissNews: (id: string) => void;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({
  latestNews,
  onDismissNews,
}) => {
  if (!latestNews) return null;

  return (
    <div className="mt-1.5 p-2 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md flex items-center justify-between gap-2 text-xs shadow-lg animate-fadeIn">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="py-1 px-2.5 rounded-xl bg-rose-500/20 text-rose-300 font-black shrink-0 border border-rose-500/30 flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>{latestNews.category}</span>
        </div>
        <div className="flex-1 min-w-0 truncate">
          <span className="font-extrabold text-white truncate block">{latestNews.headline}</span>
          <span className="text-[10px] text-zinc-400 truncate block">{latestNews.subtitle}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          soundEngine.playClick();
          onDismissNews(latestNews.id);
        }}
        title="حذف و عدم نمایش مجدد این خبر"
        aria-label="حذف خبر"
        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
