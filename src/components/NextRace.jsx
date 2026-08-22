import { useState, useEffect } from 'preact/hooks';
import { getNextRace } from '../api/f1.js';
import { getFlagEmoji } from '../utils/countryFlags.js';
import { getFlagUrl } from '../utils/countryFlags.js';

export function NextRace() {
  const [race, setRace] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getNextRace().then(setRace).catch(() => setError(true));
  }, []);

  if (error) return <p class="status-text">Couldn't load the next race.</p>;
  if (!race) return <p class="status-text">Loading…</p>;
  
  const dateTime = new Date(`${race.date}T${race.time ?? '00:00:00Z'}`);

  return (
    <div class="next-race-card">
      <h2>{race.raceName}</h2>
      <p>{race.Circuit.circuitName}</p>
      <p>
        {getFlagUrl(race.Circuit.Location.country) && (
          <img
            src={getFlagUrl(race.Circuit.Location.country)}
            alt={race.Circuit.Location.country}
            width="24"
            height="18"
          />
        )}{' '}
        {race.Circuit.Location.locality}, {race.Circuit.Location.country}
      </p>
      <p>{dateTime.toLocaleString()}</p>
    </div>
  );
}
