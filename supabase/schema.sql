-- ====================================================================
-- eFootball Friends League Schema
-- Adhering to Supabase Postgres Best Practices:
-- - UUID Primary Keys with gen_random_uuid()
-- - Lowercase snake_case identifiers
-- - Explicit foreign key indexes (schema-foreign-key-indexes)
-- - Check constraints on scores and players (schema-constraints)
-- - Row Level Security (RLS) enabled on all tables (security-rls-basics)
-- - Realtime publication configured
-- ====================================================================

-- 1. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    rating INTEGER NOT NULL DEFAULT 1200 CHECK (rating >= 0),
    favorite_team TEXT NOT NULL DEFAULT 'FC Barcelona',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    team1 TEXT NOT NULL DEFAULT 'رئال مادرید',
    team2 TEXT NOT NULL DEFAULT 'بارسلونا',
    score1 INTEGER NOT NULL CHECK (score1 >= 0),
    score2 INTEGER NOT NULL CHECK (score2 >= 0),
    played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_different_players CHECK (player1_id <> player2_id)
);

-- Foreign key indexes (rule: schema-foreign-key-indexes)
CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON public.matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON public.matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON public.matches(played_at DESC);

-- 3. WHEEL SPINS TABLE (History of Lucky Wheel picks)
CREATE TABLE IF NOT EXISTS public.wheel_spins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    prize TEXT NOT NULL,
    spun_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wheel_spins_player_id ON public.wheel_spins(player_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_spun_at ON public.wheel_spins(spun_at DESC);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

-- Friendly league policies (allow read and create with anon public key)
CREATE POLICY "Allow public read players" ON public.players
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert players" ON public.players
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update players" ON public.players
    FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow public read matches" ON public.matches
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert matches" ON public.matches
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public read wheel_spins" ON public.wheel_spins
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert wheel_spins" ON public.wheel_spins
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. REALTIME REPLICATION PUBLICATION
-- Enables mobile devices to receive real-time updates upon match submissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wheel_spins;

-- 6. STANDINGS VIEW (Dynamic League Standings Calculation)
CREATE OR REPLACE VIEW public.league_standings AS
WITH match_results AS (
    -- Player 1 perspective
    SELECT 
        player1_id AS player_id,
        1 AS played,
        CASE WHEN score1 > score2 THEN 1 ELSE 0 END AS won,
        CASE WHEN score1 = score2 THEN 1 ELSE 0 END AS drawn,
        CASE WHEN score1 < score2 THEN 1 ELSE 0 END AS lost,
        score1 AS goals_for,
        score2 AS goals_against,
        CASE 
            WHEN score1 > score2 THEN 3 
            WHEN score1 = score2 THEN 1 
            ELSE 0 
        END AS points
    FROM public.matches
    
    UNION ALL
    
    -- Player 2 perspective
    SELECT 
        player2_id AS player_id,
        1 AS played,
        CASE WHEN score2 > score1 THEN 1 ELSE 0 END AS won,
        CASE WHEN score1 = score2 THEN 1 ELSE 0 END AS drawn,
        CASE WHEN score2 < score1 THEN 1 ELSE 0 END AS lost,
        score2 AS goals_for,
        score1 AS goals_against,
        CASE 
            WHEN score2 > score1 THEN 3 
            WHEN score1 = score2 THEN 1 
            ELSE 0 
        END AS points
    FROM public.matches
)
SELECT 
    p.id AS player_id,
    p.name AS player_name,
    p.rating,
    p.favorite_team,
    COALESCE(COUNT(mr.played), 0)::INTEGER AS played,
    COALESCE(SUM(mr.won), 0)::INTEGER AS won,
    COALESCE(SUM(mr.drawn), 0)::INTEGER AS drawn,
    COALESCE(SUM(mr.lost), 0)::INTEGER AS lost,
    COALESCE(SUM(mr.goals_for), 0)::INTEGER AS goals_for,
    COALESCE(SUM(mr.goals_against), 0)::INTEGER AS goals_against,
    (COALESCE(SUM(mr.goals_for), 0) - COALESCE(SUM(mr.goals_against), 0))::INTEGER AS goal_diff,
    COALESCE(SUM(mr.points), 0)::INTEGER AS points
FROM public.players p
LEFT JOIN match_results mr ON p.id = mr.player_id
GROUP BY p.id, p.name, p.rating, p.favorite_team
ORDER BY points DESC, goal_diff DESC, goals_for DESC;

-- 7. OPTIONAL INITIAL SEED DATA
-- Schema is clean and ready. Players and matches can be registered directly by the Admin from the app UI.

