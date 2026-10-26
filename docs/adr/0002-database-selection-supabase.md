# ADR-0002: Cloud Database Architecture using Supabase & PostgreSQL

**Date**: 2026-10-27  
**Status**: Accepted  
**Deciders**: Engineering & Product Team

---

## Context
The eFootball Friends League web application needs a persistent cloud database that:
1. Works seamlessly when hosted statically on GitHub Pages / Cloudflare Pages (no custom Node.js/Express backend allowed).
2. Supports real-time updates (WebSockets) so that when any player submits a match result, all connected mobile devices update instantly without refreshing.
3. Provides a reliable relational model for standings, goals, match records, and head-to-head statistics.
4. Complies with the `supabase-postgres-best-practices` standard (proper constraints, indexed foreign keys, automated standings calculation view, Row Level Security).

## Decision
We choose **Supabase (Managed PostgreSQL BaaS)**:
1. **Direct Client Access**: Accessible safely from the browser via `@supabase/supabase-js` using public anonymous keys (`anon_key`) secured with Row Level Security (RLS).
2. **Realtime Engine**: Built-in postgres-changes replication stream notifies clients of newly inserted matches in sub-100ms.
3. **Calculated Standings View**: A PostgreSQL View (`league_standings`) computes points, goal difference, games won/drawn/lost in real-time, eliminating redundant client computation.
4. **Offline / Local Fallback**: Client service layer gracefully falls back to local storage and mock fixtures if Supabase credentials are not yet configured in `.env`.

## Alternatives Considered

### Alternative 1: Google Firebase (Firestore)
- **Pros**: Good real-time listener SDK.
- **Cons**: NoSQL document store makes sorting, aggregation, and relational integrity complex for football league standings.
- **Why not**: PostgreSQL relational capabilities and standard SQL views are substantially better suited for sports tables and goal statistics.

### Alternative 2: Local SQLite / Embedded JSON
- **Pros**: Zero third-party dependency.
- **Cons**: Cannot synchronize results across friends' individual phones when hosted statically on GitHub Pages or Cloudflare.

## Consequences

### Positive
- Cross-device instant sync across friends' phones.
- Strict PostgreSQL schema constraints preventing negative scores or orphaned match records.
- Zero server maintenance cost (fits well within Supabase's generous free tier).
- Fully compatible with static deployments (Cloudflare Pages, GitHub Pages, Vercel).

### Negative / Trade-offs
- Requires users to set up a free Supabase project and provide `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
