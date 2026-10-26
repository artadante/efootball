# ADR-0001: Frontend Architecture & Tech Stack for Mobile-First PWA

**Date**: 2026-10-27  
**Status**: Accepted  
**Deciders**: Engineering & Product Team

---

## Context
We need to build a lightweight, highly responsive, mobile-first Progressive Web App (PWA) for friends playing eFootball. Key requirements include:
- Fast "Add to Home Screen" support on both iOS and Android.
- Ultra-smooth 60fps animations for an iOS-like "Liquid Glass" frosted navigation bar and football stadium pitch background.
- Test-driven development (TDD) workflow with instant test runner feedback.
- Clean component architecture to iteratively add modules (Standings, Lucky Wheel, Match History, Profiles) without technical debt.

## Decision
We select **Vite + React (TypeScript) + Tailwind CSS + Lucide Icons + Vitest**:
1. **Vite**: Provides lightning-fast compilation, hot module reloading (HMR), and lightweight bundle sizes suited for mobile devices.
2. **React + TypeScript**: Strong typing for league models (Players, Matches, Standings, Wheel prizes) and high maintainability.
3. **Tailwind CSS + Glassmorphism**: Utility-first CSS with backdrop-blur support (`backdrop-blur-xl`, custom RGBA gradients) for the liquid glass effect and football pitch SVG elements.
4. **PWA Manifest & Meta Tags**: Configured with `apple-mobile-web-app-capable`, `theme-color: #061e0e`, and SVG icon sets for home screen installation.
5. **Vitest + React Testing Library**: Enables the requested TDD workflow with instantaneous test feedback.

## Alternatives Considered

### Alternative 1: Next.js (App Router / SSR)
- **Pros**: Built-in API routes, SSR, full-stack out of the box.
- **Cons**: Extra server overhead, slower build times on initial setup, overkill for a zero-friction client-first PWA where all initial state can run client-side with IndexedDB/LocalStorage sync.
- **Why not**: The primary goal is a lightning-fast, offline-capable mobile web app that feels like a native phone app. Client-side Vite delivers faster mobile interaction.

### Alternative 2: Vanilla JavaScript / HTML
- **Pros**: Zero build tools.
- **Cons**: Complex state management for dynamic league tables, wheel spinning physics, and modal drawers. High risk of regression during rapid iterations.
- **Why not**: Lacks typing, component reusability, and modern TDD testing harnesses.

## Consequences

### Positive
- Instant developer feedback loop and easy deployment to static hosts (Vercel, Cloudflare Pages, GitHub Pages).
- Native-like app feel when added to iOS/Android home screens.
- Ready for seamless Vitest TDD unit tests.
- Straightforward path to attach Supabase or Firebase in future milestones.

### Negative / Trade-offs
- Static client requires client-side state handling or subsequent backend connection for real-time multi-device sync (planned for next phases).
