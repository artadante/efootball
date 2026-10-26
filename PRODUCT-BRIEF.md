# Product Brief: eFootball Friends League Web App (PWA)

## 1. Executive Summary & Vision
A dedicated, mobile-first Progressive Web App (PWA) designed for a close group of friends playing eFootball. It replicates the tactile, native feel of an iOS/Android application ("Add to Home Screen"), providing an immersive football stadium atmosphere with pitch-green visual aesthetics, frosted liquid-glass navigation, and core modules for league standings, match history, and lucky wheel mechanics.

---

## 2. Product Diagnostic (YC-Style)

### Q1: Who is this for?
A group of competitive friends who play eFootball together and need a centralized, engaging, and beautiful hub to manage their private leagues, track results, and add excitement (like team/penalty spinning wheels).

### Q2: What is the pain?
Currently, friendly leagues are run in chat groups or spreadsheets. They are tedious to update, lack visual appeal, have no dedicated game-night rituals (like team picking wheels), and don't feel like a modern football gaming app.

### Q3: Why now?
Modern Web capabilities (PWA, Tailwind CSS 3/4, glassmorphism CSS backdrops, SVG rendering, fast client-side state) allow delivering a native-grade mobile experience without requiring App Store approval or native installs.

### Q4: What's the 10-star version?
- Live score broadcast to all friends during match nights.
- Sound effects (stadium chant, whistle, wheel click).
- Interactive wheel of fortune for assigning random club handicaps or tournament penalties.
- Detailed player stats (goals per match, clean sheets, head-to-head records).
- Automated knockout and round-robin schedule generation.

### Q5: What's the MVP (Current Milestone)?
- **Mobile PWA Architecture**: `manifest.json`, iOS touch icons, mobile viewport lock, standalone display mode.
- **Stadium Pitch Canvas Background**: Styled grass stripes, center spot, penalty boxes, ambient stadium lighting.
- **Liquid Glass Navigation Bar (iOS Style)**: High-blur frosted glass floating navbar with:
  - 🎡 چرخونه (Lucky Wheel / Selector)
  - ➕ دکمه ثبت مسابقه (Action Add button)
  - 🏆 لیگ (Standings & Fixtures)
  - 📜 تاریخچه (Match History & Logs)
- **Top Bar Profile Trigger**: Sleek circular profile button with avatar, online indicator, and slide-in drawer for user settings.
- **Interactive State Foundation**: Seamless view switching with active tab indicator and tactile haptic-like animations.

### Q6: Anti-Goals (What we are NOT building right now)
- No bloated backend or complex OAuth initially; prioritize zero-latency client-side interaction with local persistence, ready for Supabase/Firebase sync later.
- No heavy 3D assets that slow down mobile loading.

### Q7: How do we know it's working?
- PWA installs and opens in full-screen standalone mode on iOS/Android.
- Sub-100ms UI transitions and 60 FPS smooth animations.
- Friends can easily switch tabs and prepare for subsequent league features.

---

## 3. Go / No-Go Recommendation
**VERDICT: GO.**
The core technical and visual specifications are clear, achievable with Vite + React + Tailwind + Lucide, and provide an extensible foundation for the upcoming iterative features.
