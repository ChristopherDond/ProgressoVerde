# Green Habits Tracker (PWA)

[PT-BR](README-pt-br.md) | EN

## About
Green Habits Tracker is a gamified, offline-first web app that helps people build sustainable routines. It rewards daily eco-friendly actions with points, streaks, and badges while visualizing environmental impact.

## Highlights
- Offline-ready PWA with IndexedDB persistence
- Daily habits checklist with points and streaks
- Badges and levels for gamification
- Impact dashboard (CO2, water, waste)
- Weekly completion chart

## Tech Stack
HTML, CSS, and vanilla JavaScript  
IndexedDB for local storage  
Service Worker + Web App Manifest for offline usage

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
