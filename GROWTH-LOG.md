# Growth Log: eFootball Friends League

### Entry 001: Mobile PWA Viewport & Liquid Glass Rendering Constraints
- **Date**: 2026-10-27
- **Context**: Initial setup of mobile-first PWA with iOS liquid glassmorphism and pitch canvas background.
- **Signal**: On iOS Safari and standalone web apps, bottom bars can collide with the native home indicator bar, and `backdrop-filter` can produce GPU compositing artifacts if layer bounds are unconstrained.
- **Root Cause**: Mobile viewports without `viewport-fit=cover` and explicit negative safe-area margins either clip the glass navigation or overlap with system gesture areas. In addition, strict TypeScript `noUnusedLocals` will fail Vite builds unless unused library icon imports are pruned immediately.
- **Transferable Pattern / Rule**:
  1. Always add `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />` for all PWA deliverables.
  2. For floating glassmorphic navbars, use a floating pill (`fixed bottom-4 inset-x-0 mx-auto pointer-events-none` with inner `pointer-events-auto`) to float cleanly above system home bars across devices.
  3. Run `tsc --noEmit` as part of the TDD refactoring cycle before final build verification.


### Entry 002: Supabase Realtime & Dynamic Standings View Isolation
- **Date**: 2026-10-27
- **Context**: Connecting Supabase to a static PWA without backend dependencies while following `supabase-postgres-best-practices`.
- **Signal**: When calculating tournament standings on the client, race conditions and duplicate match tallies happen across devices.
- **Root Cause**: Client-side point calculation is brittle. Offloading points, goals for/against, and goal difference calculation to a Postgres View (`league_standings`) with explicit foreign key indexes (`schema-foreign-key-indexes`) guarantees ACID consistency and sub-5ms queries.
- **Transferable Pattern / Rule**:
  1. Define a SQL View in Postgres for aggregate sports tables instead of calculating on the frontend.
  2. Always add foreign key indexes on `player1_id` and `player2_id` to prevent table scans on joins.
  3. Keep client-side optimistic UI updates for instant touch responsiveness, followed by Supabase Realtime WebSocket synchronization.
