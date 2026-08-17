# Motorsport Dashboard

A PWA showing driver/team standings, next race, and news for F1, F2, F3,
IndyCar, and Formula E.

## Status: app shell only

This first pass is just the navigation skeleton:
- Bottom nav (series): F1 / F2 / F3 / IndyCar / Formula E
- Secondary nav above it (category): Drivers / Teams (or Manufacturers) / Next Race / News
- Per-series tab memory (switching series keeps your place)
- No real data yet — that's wired in next, series by series

## Local setup

```
npm install
npm run dev
```

## Structure

```
src/
  series.js          -- config: which series exist, category labels
  App.jsx            -- root component, holds nav state
  components/
    SeriesNav.jsx     -- bottom-most bar (series)
    CategoryNav.jsx   -- bar above it (category)
  pages/
    SeriesPage.jsx    -- renders content for current series+category
data/                 -- will hold scraped/fetched JSON (F2/F3/IndyCar/FE)
.github/workflows/    -- will hold the scraper cron job
```
