import { getSeries } from '../series.js';

// Placeholder content for now — real data components (DriverStandings,
// TeamStandings, NextRace, News) get wired in one at a time next.
export function SeriesPage({ seriesId, categoryId }) {
  const series = getSeries(seriesId);
  const label = categoryId === 'teams' ? series.teamsLabel : categoryId;

  return (
    <div class="series-page">
      <h1>{series.label}</h1>
      <p class="series-page__placeholder">
        {label} view — data wiring comes next.
      </p>
    </div>
  );
}
