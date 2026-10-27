import { ActiveLeague, ArchivedLeague } from '../types/league';
import { RegisteredPlayer, DEFAULT_FIXED_PLAYERS } from '../types/player';
import { supabase } from '../lib/supabase';

const STORAGE_ACTIVE_KEY = 'efootball_active_league';
const STORAGE_ARCHIVED_KEY = 'efootball_archived_leagues';
const STORAGE_ARCHIVED_BACKUP_KEY = 'efootball_archived_leagues_backup';
const STORAGE_PLAYERS_KEY = 'efootball_registered_players';
const DB_SYNC_NAME = '__EFOOTBALL_GLOBAL_STATE__';

export interface LeagueAppState {
  activeLeague: ActiveLeague | null;
  archivedLeagues: ArchivedLeague[];
  registeredPlayers?: RegisteredPlayer[];
  updatedAt?: string;
}

// 1. Load initial state from local storage for instantaneous render
export function getLocalLeagueState(): {
  activeLeague: ActiveLeague | null;
  archivedLeagues: ArchivedLeague[];
  registeredPlayers: RegisteredPlayer[];
} {
  try {
    const activeRaw = localStorage.getItem(STORAGE_ACTIVE_KEY);
    const archivedRaw = localStorage.getItem(STORAGE_ARCHIVED_KEY);
    const backupRaw = localStorage.getItem(STORAGE_ARCHIVED_BACKUP_KEY);
    const playersRaw = localStorage.getItem(STORAGE_PLAYERS_KEY);

    let parsedArchived: ArchivedLeague[] = [];
    if (archivedRaw) {
      try {
        parsedArchived = JSON.parse(archivedRaw);
      } catch {
        parsedArchived = [];
      }
    }

    // Safety net: If archived is empty but backup has saved leagues, recover from backup
    if ((!parsedArchived || parsedArchived.length === 0) && backupRaw) {
      try {
        const backupParsed = JSON.parse(backupRaw);
        if (Array.isArray(backupParsed) && backupParsed.length > 0) {
          parsedArchived = backupParsed;
        }
      } catch {
        // ignore
      }
    }

    return {
      activeLeague: activeRaw ? JSON.parse(activeRaw) : null,
      archivedLeagues: parsedArchived,
      registeredPlayers: playersRaw ? JSON.parse(playersRaw) : DEFAULT_FIXED_PLAYERS,
    };
  } catch (err) {
    console.error('Error loading local state:', err);
    return {
      activeLeague: null,
      archivedLeagues: [],
      registeredPlayers: DEFAULT_FIXED_PLAYERS,
    };
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

      if (parsed.archivedLeagues && Array.isArray(parsed.archivedLeagues)) {
        if (parsed.archivedLeagues.length > 0) {
          localStorage.setItem(STORAGE_ARCHIVED_KEY, JSON.stringify(parsed.archivedLeagues));
          localStorage.setItem(STORAGE_ARCHIVED_BACKUP_KEY, JSON.stringify(parsed.archivedLeagues));
        } else {
          // If remote is empty, check if we have a valid local backup before wiping
          const backupRaw = localStorage.getItem(STORAGE_ARCHIVED_BACKUP_KEY);
          if (backupRaw) {
            try {
              const localBackup = JSON.parse(backupRaw);
              if (Array.isArray(localBackup) && localBackup.length > 0) {
                parsed.archivedLeagues = localBackup;
              }
            } catch {
              // ignore
            }
          }
        }
      }

      if (parsed.registeredPlayers && parsed.registeredPlayers.length > 0) {
        localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(parsed.registeredPlayers));
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
  archivedLeagues: ArchivedLeague[],
  registeredPlayers?: RegisteredPlayer[]
): Promise<void> {
  // Always update local cache immediately
  try {
    if (activeLeague) {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(activeLeague));
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
    }
    localStorage.setItem(STORAGE_ARCHIVED_KEY, JSON.stringify(archivedLeagues));
    if (archivedLeagues && archivedLeagues.length > 0) {
      localStorage.setItem(STORAGE_ARCHIVED_BACKUP_KEY, JSON.stringify(archivedLeagues));
    }
    if (registeredPlayers) {
      localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(registeredPlayers));
    }
  } catch (err) {
    console.error('Local save error:', err);
  }

  // Push to Supabase Cloud for live cross-device sync
  if (supabase) {
    try {
      const currentPlayers = registeredPlayers || getLocalLeagueState().registeredPlayers;
      const payload: LeagueAppState = {
        activeLeague,
        archivedLeagues,
        registeredPlayers: currentPlayers,
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
              if (parsed.archivedLeagues && Array.isArray(parsed.archivedLeagues)) {
                if (parsed.archivedLeagues.length > 0) {
                  localStorage.setItem(STORAGE_ARCHIVED_KEY, JSON.stringify(parsed.archivedLeagues));
                  localStorage.setItem(STORAGE_ARCHIVED_BACKUP_KEY, JSON.stringify(parsed.archivedLeagues));
                } else {
                  const backupRaw = localStorage.getItem(STORAGE_ARCHIVED_BACKUP_KEY);
                  if (backupRaw) {
                    try {
                      const localBackup = JSON.parse(backupRaw);
                      if (Array.isArray(localBackup) && localBackup.length > 0) {
                        parsed.archivedLeagues = localBackup;
                      }
                    } catch {
                      // ignore
                    }
                  }
                }
              }
              if (parsed.registeredPlayers && parsed.registeredPlayers.length > 0) {
                localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(parsed.registeredPlayers));
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
