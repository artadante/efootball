import React from 'react';
import { X, Award, Flame, Sparkles } from 'lucide-react';
import { GuinnessRecordItem } from '../utils/guinnessRecords';

interface GuinnessRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: GuinnessRecordItem[];
}

export const GuinnessRecordsModal: React.FC<GuinnessRecordsModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تالار رکوردهای گینس مسابقات"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-emerald-950/95 border border-white/20 p-5 sm:p-6 text-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white">تالار رکوردهای جاودانه دورهمی 🎖️</h3>
              <p className="text-xs text-zinc-400">ثبت رسمی برترین دستاوردها و رکوردهای گینس مسابقات</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Records Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 space-y-2">
              <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto" />
              <p className="text-sm">هنوز مسابقه‌ای برای محاسبه رکوردها ثبت نشده است.</p>
              <p className="text-xs text-zinc-500">با انجام بازی‌ها، رکوردهای جدید به‌صورت خودکار در این تالار ثبت می‌شوند.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-3xl bg-black/45 border border-white/15 hover:border-amber-400/40 transition-all shadow-xl flex items-start gap-3.5 relative overflow-hidden group"
              >
                {/* Glow accent bar */}
                <div className={`absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b ${rec.badgeColor}`} />

                {/* Emoji Emblem */}
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  <span>{rec.emoji}</span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-300/90 font-bold block">
                      {rec.title}
                    </span>
                    <span className="text-xs py-0.5 px-2.5 rounded-full bg-white/10 text-white font-mono font-black">
                      {rec.recordValue}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>رکورددار: {rec.holderName}</span>
                  </h4>

                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 text-center shrink-0">
          <p className="text-[11px] text-zinc-400">
            ⭐ رکوردهای بالا به‌صورت زنده و بر اساس دیتابیس کل لیگ‌ها به‌روزرسانی می‌شوند.
          </p>
        </div>
      </div>
    </div>
  );
};
