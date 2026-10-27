export interface RegisteredPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export const DEFAULT_FIXED_PLAYERS: RegisteredPlayer[] = [
  { id: 'arta', name: 'آرتا', avatarUrl: '/admin-avatar.png', isDefault: true },
  { id: 'pedram', name: 'پدرام', isDefault: true },
  { id: 'payam', name: 'پیام', isDefault: true },
  { id: 'sahand', name: 'سهند', isDefault: true },
  { id: 'babak', name: 'بابک', isDefault: true },
  { id: 'karen', name: 'کارن', isDefault: true },
];

export interface PlayerMatchRecord {
  id: string;
  leagueId: string;
  leagueName: string;
  date?: string;
  isArchived: boolean;
  myTeam: string;
  opponentName: string;
  opponentTeam: string;
  myScore: number;
  opponentScore: number;
  result: 'W' | 'D' | 'L'; // Win, Draw, Loss
  points: number; // 3 for W, 1 for D, 0 for L
}

export interface PlayerCareerStats {
  playerName: string;
  avatarUrl?: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number; // percentage 0-100
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  championships: number;
  teamsPlayed: string[];
  matches: PlayerMatchRecord[];
  performancePoints: number[]; // sequence of points for performance graph
}
