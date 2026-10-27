import { ActiveLeague } from '../types/league';

export interface SportsHeadline {
  id: string;
  category: 'فوری 🚨' | 'تحلیل بازی ⚽' | 'حاشیه و کل‌کل 🔥' | 'بیانیه 🎙️';
  headline: string;
  subtitle: string;
  tag: string;
  timeAgo: string;
}

export function generateMatchdayNews(activeLeague: ActiveLeague | null): SportsHeadline[] {
  const news: SportsHeadline[] = [];

  if (!activeLeague || !activeLeague.matches || activeLeague.matches.length === 0) {
    return [
      {
        id: 'news-welcome',
        category: 'بیانیه 🎙️',
        headline: 'فصل جدید مسابقات دوستانه eFootball کلید خورد!',
        subtitle: 'کارشناسان پیش‌بینی می‌کنند شاهد یکی از فشرده‌ترین رقابت‌های تاریخ این لیگ خواهیم بود.',
        tag: 'آغاز مسابقات',
        timeAgo: 'امروز',
      },
    ];
  }

  // Find played matches
  const playedMatches = activeLeague.matches
    .filter((m) => m.isPlayed && typeof m.score1 === 'number' && typeof m.score2 === 'number')
    .reverse();

  if (playedMatches.length === 0) {
    news.push({
      id: 'news-ready',
      category: 'فوری 🚨',
      headline: `سوت آغاز ${activeLeague.name} به صدا درآمد`,
      subtitle: 'تمام بازیکنان با تیم‌های قرعه‌کشی‌شده در رختکن حاضر هستند؛ اولین نبرد به زودی آغاز می‌شود.',
      tag: 'پیش‌بازی',
      timeAgo: 'چند دقیقه پیش',
    });
    return news;
  }

  // Generate news from latest played matches
  for (let i = 0; i < Math.min(4, playedMatches.length); i++) {
    const m = playedMatches[i];
    const s1 = activeLeague.players.find((p) => p.slot === m.player1Slot);
    const s2 = activeLeague.players.find((p) => p.slot === m.player2Slot);
    const name1 = s1?.name || `بازیکن ${m.player1Slot}`;
    const name2 = s2?.name || `بازیکن ${m.player2Slot}`;
    const team1 = s1?.team || `تیم ${m.player1Slot}`;
    const team2 = s2?.team || `تیم ${m.player2Slot}`;
    const score1 = m.score1 ?? 0;
    const score2 = m.score2 ?? 0;

    const diff = Math.abs(score1 - score2);
    const totalGoals = score1 + score2;

    if (diff >= 3) {
      const winner = score1 > score2 ? name1 : name2;
      const loser = score1 > score2 ? name2 : name1;
      const winTeam = score1 > score2 ? team1 : team2;
      news.push({
        id: `news-thrashing-${m.id}`,
        category: 'فوری 🚨',
        headline: `طوفان ${winner} در زمین! شکست سنگین ${loser} با اختلاف ${diff} گل!`,
        subtitle: `خط آتشین ${winTeam} فرصتی برای تنفس حریف باقی نگذاشت؛ زنگ خطر در رختکن ${loser} به صدا درآمد.`,
        tag: 'زلزله در جدول',
        timeAgo: `هفته ${m.round}`,
      });
    } else if (score1 === score2) {
      news.push({
        id: `news-draw-${m.id}`,
        category: 'تحلیل بازی ⚽',
        headline: `توقف نفس‌گیر ${name1} و ${name2} در شبی پر از هیجان (${score1} - ${score2})`,
        subtitle: `تقسیم امتیازات در نبرد حساس ${team1} و ${team2}، فرصت طلایی را به رقبای صدر جدول هدیه داد.`,
        tag: 'تساوی مصلحتی',
        timeAgo: `هفته ${m.round}`,
      });
    } else if (totalGoals >= 5) {
      news.push({
        id: `news-fiesta-${m.id}`,
        category: 'حاشیه و کل‌کل 🔥',
        headline: `جشنواره گل در دورهمی! تماشاگران از بازی دیوانه‌وار ${name1} و ${name2} به وجد آمدند`,
        subtitle: `ثبت ${totalGoals} گل در یک مسابقه؛ دفاع هر دو تیم مرخصی رفته بود!`,
        tag: 'فوتبال تهاجمی',
        timeAgo: `هفته ${m.round}`,
      });
    } else {
      const winner = score1 > score2 ? name1 : name2;
      const loser = score1 > score2 ? name2 : name1;
      news.push({
        id: `news-close-${m.id}`,
        category: 'حاشیه و کل‌کل 🔥',
        headline: `پیروزی میلی‌متری ${winner} در ثانیه‌های پایانی مقابل ${loser}`,
        subtitle: `${winner} با چنگ و دندان سه امتیاز ارزشمند را از چنگ ${loser} بیرون کشید.`,
        tag: 'نبرد شانه به شانه',
        timeAgo: `هفته ${m.round}`,
      });
    }
  }

  return news;
}
