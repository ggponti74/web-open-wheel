import { getFlagUrl } from '../utils/countryFlags.js';

function guessCountry(location) {
  if (!location) return null;
  return location.includes('Ontario') ? 'Canada' : 'USA';
}

export function NextRaceCard({ race }) {
  if (!race) {
    return <p class="status-text">No races left in the current season.</p>;
  }

  const country = guessCountry(race.location);
  const flagUrl = country && getFlagUrl(country);

  return (
    <div class="next-race-card">
      <h2>{race.name}</h2>
      {race.circuit && <p>{race.circuit}</p>}
      {race.location && (
        <p class="next-race-location">
          {flagUrl && <img src={flagUrl} alt={country} class="next-race-flag" />}
          {race.location}
        </p>
      )}
      {race.dateTime && <p>{new Date(race.dateTime).toLocaleString()}</p>}
    </div>
  );
}