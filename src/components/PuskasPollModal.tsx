import React, { useState } from 'react';
import { X, Award, Plus, Sparkles, Check, Flame } from 'lucide-react';
import { soundEngine } from '../utils/soundEffects';

interface PuskasNominee {
  id: string;
  scorerName: string;
  teamName: string;
  matchDescription: string;
  votes: string[]; // array of voter user names
  createdAt: string;
}

interface PuskasPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: string[];
  currentUserName: string;
}

const STORAGE_PUSKAS_KEY = 'efootball_puskas_nominees';

export const PuskasPollModal: React.FC<PuskasPollModalProps> = ({
  isOpen,
  onClose,
  players,
  currentUserName,
}) => {
  const [nominees, setNominees] = useState<PuskasNominee[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PUSKAS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [scorer, setScorer] = useState(players[0] || '');
  const [team, setTeam] = useState('');
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  const handleVote = (nomineeId: string) => {
    soundEngine.playClick();
    const updated = nominees.map((nom) => {
      if (nom.id === nomineeId) {
        const hasVoted = nom.votes.includes(currentUserName);
        const newVotes = hasVoted
          ? nom.votes.filter((v) => v !== currentUserName)
          : [...nom.votes, currentUserName];
        return { ...nom, votes: newVotes };
      }
      return nom;
    });

    setNominees(updated);
    try {
      localStorage.setItem(STORAGE_PUSKAS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleAddNomination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorer || !desc.trim()) return;

    soundEngine.playClick();
    const newNominee: PuskasNominee = {
      id: `puskas-${Date.now()}`,
      scorerName: scorer,
      teamName: team.trim() || 'تیم مشخص‌نشده',
      matchDescription: desc.trim(),
      votes: [currentUserName],
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    const updated = [newNominee, ...nominees];
    setNominees(updated);
    try {
      localStorage.setItem(STORAGE_PUSKAS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setIsAdding(false);
    setDesc('');
    setTeam('');
  };

  const totalVotesCount = nominees.reduce((sum, n) => sum + n.votes.length, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="جایزه پوشکاش و گل برتر دورهمی"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-emerald-950/95 border border-white/20 p-5 sm:p-6 text-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-black text-lg text-white">نظرسنجی جایزه پوشکاش مسابقات</h3>
              <p className="text-xs text-zinc-400">رأی‌گیری برای زیباترین و خاطره‌انگیزترین گل فصل</p>
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

        {/* Action Button: Nominate a goal */}
        <div className="py-3 flex justify-between items-center shrink-0">
          <span className="text-xs text-amber-300 font-bold">
            کاربر رأی‌دهنده: «{currentUserName}»
          </span>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-xs flex items-center gap-1 shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>ثبت نامزد جدید گل برتر</span>
          </button>
        </div>

        {/* Nomination Form Drawer */}
        {isAdding && (
          <form onSubmit={handleAddNomination} className="p-3.5 rounded-2xl bg-black/50 border border-white/15 space-y-3 mb-3 shrink-0 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">زننده گل:</label>
                <select
                  value={scorer}
                  onChange={(e) => setScorer(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-white focus:outline-none"
                >
                  {players.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">نام تیم:</label>
                <input
                  type="text"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="مثال: رئال مادرید"
                  className="w-full p-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">توصیف گل (شوت از راه دور، برگردون، دریبل و...):</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="توضیح کوتاه درباره صحنه گل..."
                rows={2}
                className="w-full p-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-1.5 px-3 rounded-xl bg-white/10 text-zinc-300 text-xs"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl bg-emerald-500 text-black font-black text-xs hover:brightness-110"
              >
                ثبت نامزد
              </button>
            </div>
          </form>
        )}

        {/* Nominees List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 py-1">
          {nominees.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 space-y-2">
              <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto" />
              <p className="text-xs">هنوز هیچ گلی برای جایزه پوشکاش نامزد نشده است.</p>
              <p className="text-[11px] text-zinc-500">اولین گلی که در دورهمی به وجدتان آورد را ثبت کنید!</p>
            </div>
          ) : (
            nominees.map((nom, idx) => {
              const hasVoted = nom.votes.includes(currentUserName);
              const votePercent = totalVotesCount > 0 ? Math.round((nom.votes.length / totalVotesCount) * 100) : 0;
              const isLeader = idx === 0 && nom.votes.length > 0;

              return (
                <div
                  key={nom.id}
                  className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isLeader
                      ? 'bg-amber-950/40 border-amber-400/50 shadow-amber-400/10'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isLeader && <Flame className="w-4 h-4 text-amber-400 animate-pulse" />}
                      <span className="font-black text-sm text-white">{nom.scorerName}</span>
                      <span className="text-[11px] text-emerald-300 font-bold">({nom.teamName})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVote(nom.id)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
                        hasVoted
                          ? 'bg-amber-400 text-black shadow-lg font-black'
                          : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                      }`}
                    >
                      {hasVoted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Award className="w-3.5 h-3.5" />}
                      <span>{hasVoted ? 'رأی داده‌اید' : 'رأی دادن'}</span>
                      <span className="font-mono mr-1">({nom.votes.length})</span>
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 leading-relaxed mb-2">
                    {nom.matchDescription}
                  </p>

                  {/* Vote Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                        style={{ width: `${votePercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>{nom.votes.length} رأی</span>
                      <span>%{votePercent} آرا</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
