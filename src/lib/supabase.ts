import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://uzcuypdufieygrbkhnwe.supabase.co';
// Clean trailing slashes or /rest/v1 if accidentally included
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3V5cGR1ZmlleWdyYmtobndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNTYzMDMsImV4cCI6MjEwODYzMjMwM30.xqxdLZh7l7dzje6nhKkmx9NAj81hL1-056-eUOHJkWU';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DbPlayer {
  id: string;
  name: string;
  rating: number;
  favorite_team: string;
  avatar_url?: string;
  created_at?: string;
}

export interface DbMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  played_at: string;
  player1?: { name: string };
  player2?: { name: string };
}

export interface DbStanding {
  player_id: string;
  player_name: string;
  rating: number;
  favorite_team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}
