# Green Habits Tracker (PWA)

[PT-BR](README-pt-br.md) | EN

## About
Green Habits Tracker is a gamified, offline-first web app that helps people build sustainable routines. It rewards daily eco-friendly actions with points, streaks, and badges while visualizing environmental impact.

## What's New
- Unified single-page experience: Home, Badges, Analysis, and Profile sections now live in one continuous page.
- Sticky top navigation with smooth-scroll anchors and active section highlighting.
- Redesigned visual style inspired by futuristic eco dashboards (glassmorphism cards, richer glow layers, stronger typography).
- Improved weekly chart: now rendered as an SVG line + area chart with glowing points and vertical guides.
- Refined responsive behavior for tablet/mobile (menu wrapping, stacked hero panels, adaptive habit rows).

## Highlights
- Offline-ready PWA with IndexedDB persistence
- Daily habits checklist with points and streaks
- Badges and levels for gamification
- Impact dashboard (CO2, water, waste)
- Interactive 3D hero cube rendered with Three.js
- Weekly completion trend chart (SVG line + glow area)
- Single-page section navigation with smooth scrolling

## Tech Stack
HTML, CSS, and vanilla JavaScript  
Three.js (CDN) for hero 3D scene  
IndexedDB for local storage  
Service Worker + Web App Manifest for offline usage

## Project Structure
- [index.html](index.html): Single-page layout and section anchors
- [styles.css](styles.css): Theme, glass UI, responsive design, chart styles
- [app.js](app.js): IndexedDB logic, stats/badges, SVG weekly chart, smooth nav behavior
- [three-scene.js](three-scene.js): 3D cube scene setup and animation
- [sw.js](sw.js): Service worker cache strategy

## Running locally
Use any static server:

```
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Offline usage
Open the app once, then add it to your home screen. It works offline and keeps your data locally in the browser.

## Data
All data stays on your device. There is no backend or external API.
