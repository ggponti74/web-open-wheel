import { getFlagUrl } from "../utils/countryFlags.js";
import { VenueMap } from "./VenueMap.jsx";

function guessCountry(location) {
  if (!location) return null;
  return location.includes("Ontario") ? "Canada" : "USA";
}

export function NextRaceCard({ race }) {
  if (!race) {
    return <p class="status-text">No races left in the current season.</p>;
  }

  const country = race.country || guessCountry(race.location);
  const flagUrl = country && getFlagUrl(country);

  return (
    <div class="next-race-card">
      <h2>
        {flagUrl && <img src={flagUrl} alt={country} width="24" height="18" />}{" "}
        {race.name}
      </h2>
      {race.circuit && <p>{race.circuit}</p>}
      <p>
        {race.Circuit.Location.locality}, {race.Circuit.Location.country}
      </p>
      <p>{dateTime.toLocaleString()}</p>
      <VenueMap
        city={race.Circuit.Location.locality}
        country={race.Circuit.Location.country}
      />
    </div>
  );
}
