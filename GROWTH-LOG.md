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
