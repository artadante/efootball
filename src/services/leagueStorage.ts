import { ActiveLeague, ArchivedLeague } from '../types/league';
import { supabase } from '../lib/supabase';

const STORAGE_ACTIVE_KEY = 'efootball_active_league';
const STORAGE_ARCHIVED_KEY = 'efootball_archived_leagues';
const DB_SYNC_NAME = '__EFOOTBALL_GLOBAL_STATE__';

export interface LeagueAppState {
  activeLeague: ActiveLeague | null;
  archivedLeagues: ArchivedLeague[];
  updatedAt?: string;
}

// 1. Load initial state from local storage for instantaneous render
export function getLocalLeagueState(): LeagueAppState {
  try {
    const activeRaw = localStorage.getItem(STORAGE_ACTIVE_KEY);
    const archivedRaw = localStorage.getItem(STORAGE_ARCHIVED_KEY);
    return {
      activeLeague: activeRaw ? JSON.parse(activeRaw) : null,
      archivedLeagues: archivedRaw ? JSON.parse(archivedRaw) : [],
    };
  } catch (err) {
    console.error('Error loading local state:', err);
    return { activeLeague: null, archivedLeagues: [] };
  }
}

// 2. Fetch remote state from Supabase Cloud
export async function fetchRemoteLeagueState(): Promise<LeagueAppState | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('players')
      .select('favorite_team, created_at')
      .eq('name', DB_SYNC_NAME)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    if (data && data.favorite_team) {
      const parsed = JSON.parse(data.favorite_team) as LeagueAppState;
      // Cache locally
      if (parsed.activeLeague) {
        localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(parsed.activeLeague));
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_KEY);
      }
      if (parsed.archivedLeagues) {
        localStorage.setItem(STORAGE_ARCHIVED_KEY, JSON.stringify(parsed.archivedLeagues));
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Error fetching remote league state:', err);
  }

  return null;
}

// 3. Save state both locally and to Supabase Cloud
export async function syncSaveLeagueState(
  activeLeague: ActiveLeague | null,
  archivedLeagues: ArchivedLeague[]
): Promise<void> {
  // Always update local cache immediately
  try {
    if (activeLeague) {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(activeLeague));
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
    }
    localStorage.setItem(STORAGE_ARCHIVED_KEY, JSON.stringify(archivedLeagues));
  } catch (err) {
    console.error('Local save error:', err);
  }

  // Push to Supabase Cloud for live cross-device sync
  if (supabase) {
    try {
      const payload: LeagueAppState = {
        activeLeague,
        archivedLeagues,
        updatedAt: new Date().toISOString(),
      };

      await supabase.from('players').upsert(
        {
          name: DB_SYNC_NAME,
          favorite_team: JSON.stringify(payload),
          rating: 2000,
        },
        { onConflict: 'name' }
      );
    } catch (err) {
      console.warn('Supabase sync save error:', err);
    }
  }
}

// 4. Realtime cross-device listener
export function subscribeToRealtimeLeague(
  onUpdate: (state: LeagueAppState) => void
): () => void {
  if (!supabase) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('efootball-live-league-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `name=eq.${DB_SYNC_NAME}`,
        },
        (payload) => {
          try {
            const newRecord = payload.new as { favorite_team?: string };
            if (newRecord && newRecord.favorite_team) {
              const parsed = JSON.parse(newRecord.favorite_team) as LeagueAppState;
              // Cache locally
              if (parsed.activeLeague) {
                localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(parsed.activeLeague));
              } else {
                localStorage.removeItem(STORAGE_ACTIVE_KEY);
              }
              if (parsed.archivedLeagues) {
                localStorage.setItem(STORAGE_ARCHIVED_KEY, JSON.stringify(parsed.archivedLeagues));
              }
              onUpdate(parsed);
            }
          } catch (err) {
            console.error('Error handling realtime payload:', err);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}
