import { getFlagUrl } from "../utils/countryFlags.js";
import { VenueMap } from "./VenueMap.jsx";

function guessCountry(location) {
  if (!location) return null;
  return location.includes("Ontario") ? "Canada" : "USA";
}

// F2/F3 next-race scrapes fold the session type into race.name
// (e.g. "F2 Sprint Race", "F3 Feature Race"). Split it out so it renders
// as its own line instead of being buried in the heading.
const SESSION_SUFFIX_RE = /\s+(Sprint Race|Feature Race)$/i;

export function NextRaceCard({ race }) {
  if (!race) {
    return <p class="status-text">No races left in the current season.</p>;
  }

  const country = race.country || guessCountry(race.location);
  const flagUrl = country && getFlagUrl(country);

  const sessionMatch = race.name?.match(SESSION_SUFFIX_RE);
  const heading = sessionMatch ? race.name.slice(0, sessionMatch.index) : race.name;
  const sessionLabel = sessionMatch?.[1] ?? null;
  const isSprint = /sprint/i.test(sessionLabel ?? "");

  return (
    <div class="next-race-card">
      <h2>
        {flagUrl && <img src={flagUrl} alt={country} width="24" height="18" />}{" "}
        {heading}
      </h2>
      {sessionLabel && (
        <p
          class={`next-race-session${isSprint ? " next-race-session--sprint" : ""}`}
        >
          {sessionLabel}
        </p>
      )}
      {race.circuit && <p>{race.circuit}</p>}
      {race.location && <p>{race.location}</p>}
      {race.dateTime && <p>{new Date(race.dateTime).toLocaleString()}</p>}
      {race.city && country && <VenueMap city={race.city} country={country} />}
    </div>
  );
}
