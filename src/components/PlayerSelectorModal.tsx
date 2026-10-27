import React, { useState, useEffect } from 'react';
import { X, Check, Users, Search, CheckSquare, Square } from 'lucide-react';
import { RegisteredPlayer } from '../types/player';

interface PlayerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredPlayers: RegisteredPlayer[];
  selectedPlayerNames: string[];
  onConfirm: (selectedNames: string[]) => void;
}

export const PlayerSelectorModal: React.FC<PlayerSelectorModalProps> = ({
  isOpen,
  onClose,
  registeredPlayers,
  selectedPlayerNames,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelected(selectedPlayerNames);
      setSearchQuery('');
    }
  }, [isOpen, selectedPlayerNames]);

  if (!isOpen) return null;

  const togglePlayer = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => n !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  const handleSelectAll = () => {
    setSelected(registeredPlayers.map((p) => p.name));
  };

  const handleClearAll = () => {
    setSelected([]);
  };

  const handleApply = () => {
    onConfirm(selected);
    onClose();
  };

  const filtered = registeredPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="انتخاب بازیکنان برای گردونه"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">انتخاب بازیکنان برای گردونه</h3>
              <span className="text-xs text-emerald-400 font-medium">
                {selected.length} بازیکن انتخاب شده
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Quick Actions */}
        <div className="p-3 border-b border-white/10 space-y-2 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام بازیکن..."
              className="w-full py-2 px-3 pl-9 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>انتخاب همه ({registeredPlayers.length})</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-zinc-400 hover:text-rose-400 font-medium flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" />
              <span>پاک کردن انتخاب‌ها</span>
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-400">
              هیچ بازیکنی با این نام یافت نشد.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filtered.map((player) => {
                const isChecked = selected.includes(player.name);

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => togglePlayer(player.name)}
                    className={`p-2.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0 overflow-hidden">
                        {player.avatarUrl ? (
                          <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{player.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-white truncate">
                        {player.name}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-emerald-400 text-black'
                          : 'border border-white/30 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Apply Button */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>تایید و انتقال به گردونه ({selected.length} بازیکن)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
