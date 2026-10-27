export type CompetitionMode = 'league' | 'cup';

export interface LeaguePlayer {
  slot: number; // 1, 2, ...
  name?: string; // Assigned via wheel 1
  team?: string; // Assigned via wheel 2
}

export interface ScheduledMatch {
  id: string;
  leg: 1 | 2; // 1 = نیم‌فصل اول (رفت), 2 = نیم‌فصل دوم (برگشت)
  round: number; // هفته مسابقه
  player1Slot: number;
  player2Slot: number;
  score1?: number | null;
  score2?: number | null;
  isPlayed: boolean;
  playedAt?: string;
}

export interface ActiveLeague {
  id: string;
  name: string;
  mode: CompetitionMode;
  playerCount: number;
  players: LeaguePlayer[];
  matches: ScheduledMatch[];
  wheelCompleted: boolean;
  isFinished: boolean;
  createdAt: string;
}

export interface StandingRow {
  rank: number;
  name: string;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface ArchivedLeague {
  id: string;
  name: string;
  mode: CompetitionMode;
  finishedAt: string;
  championName: string;
  championTeam: string;
  standings: StandingRow[];
  matches: {
    id: string;
    leg: 1 | 2;
    round: number;
    player1: string;
    team1: string;
    score1: number;
    score2: number;
    player2: string;
    team2: string;
  }[];
}
