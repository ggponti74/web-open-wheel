import { getSeries } from '../series.js';
import { DriverStandings } from '../components/DriverStandings.jsx';
import { TeamStandings } from '../components/TeamStandings.jsx';
import { NextRace } from '../components/NextRace.jsx';
import { FileBackedCategory } from '../components/FileBackedCategory.jsx';

export function SeriesPage({ seriesId, categoryId }) {
  const series = getSeries(seriesId);

  if (seriesId === 'f1') {
    if (categoryId === 'drivers') return <DriverStandings />;
    if (categoryId === 'teams') return <TeamStandings />;
    if (categoryId === 'next-race') return <NextRace />;
    // f1 news also goes through the file-backed path below
  }

  return (
    <div class="series-page">
      <h1>{series.label}</h1>
      <FileBackedCategory seriesId={seriesId} categoryId={categoryId} />
    </div>
  );
}
