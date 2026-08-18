import { useState, useEffect } from 'preact/hooks';
import { getConstructorStandings } from '../api/f1.js';

export function TeamStandings() {
  const [standings, setStandings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getConstructorStandings().then(setStandings).catch(() => setError(true));
  }, []);

  if (error) return <p class="status-text">Couldn't load standings.</p>;
  if (!standings) return <p class="status-text">Loading…</p>;

  return (
    <ol class="standings-list">
      {standings.map((s) => (
        <li key={s.Constructor.constructorId} class="standings-list__item">
          <span class="standings-list__pos">{s.position}</span>
          <span class="standings-list__name">{s.Constructor.name}</span>
          <span class="standings-list__points">{s.points}</span>
        </li>
      ))}
    </ol>
  );
}