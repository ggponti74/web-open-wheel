import { getSeries } from '../series.js';
import { DriverStandings } from '../components/DriverStandings.jsx';
import { TeamStandings } from '../components/TeamStandings.jsx';
import { NextRace } from '../components/NextRace.jsx';

export function SeriesPage({ seriesId, categoryId }) {
  const series = getSeries(seriesId);
  const label = categoryId === 'teams' ? series.teamsLabel : categoryId;

  if (seriesId === 'f1') {
    if (categoryId === 'drivers') return <DriverStandings />;
    if (categoryId === 'teams') return <TeamStandings />;
    if (categoryId === 'next-race') return <NextRace />;
    // news falls through to placeholder until the scraper exists
  }

  return (
    <div class="series-page">
      <h1>{series.label}</h1>
      <p class="series-page__placeholder">
        {label} view — data wiring comes next.
      </p>
    </div>
  );
}