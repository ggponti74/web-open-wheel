import { useState, useEffect } from 'preact/hooks';
import { getDriverStandings } from '../api/f1.js';

export function DriverStandings() {
  const [standings, setStandings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDriverStandings().then(setStandings).catch(() => setError(true));
  }, []);

  if (error) return <p class="status-text">Couldn't load standings.</p>;
  if (!standings) return <p class="status-text">Loading…</p>;

  return (
    <ol class="standings-list">
      {standings.map((s) => (
        <li key={s.Driver.driverId} class="standings-list__item">
          <span class="standings-list__pos">{s.position}</span>
          <span class="standings-list__name">
            {s.Driver.givenName} {s.Driver.familyName}
          </span>
          <span class="standings-list__points">{s.points}</span>
        </li>
      ))}
    </ol>
  );
}