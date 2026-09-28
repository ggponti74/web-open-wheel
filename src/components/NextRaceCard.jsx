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

  const country = race.country || guessCountry(race.location ?? race.city);
  const flagUrl = country && getFlagUrl(country);

  const fullName = race.raceName ?? race.name;
  const sessionMatch = fullName?.match(SESSION_SUFFIX_RE);
  const heading = sessionMatch
    ? fullName.slice(0, sessionMatch.index).trim()
    : fullName;
  const sessionLabel = sessionMatch?.[1] ?? null;
  const isSprint = /sprint/i.test(sessionLabel ?? "");

  const placeLine = [race.city, country].filter(Boolean).join(", ");
  const when = race.dateTime ?? race.date;

  return (
    <div class="next-race-card">
      {race.circuit && race.circuit !== race.city && <p>{race.circuit}</p>}
      {placeLine && <p>{placeLine}</p>}
      {when && (
        <p>
          {race.dateTime
            ? new Date(when).toLocaleString()
            : new Date(when).toLocaleDateString(undefined, { timeZone: "UTC" })}
        </p>
      )}
      <VenueMap city={race.city} country={country} />
    </div>
  );
}
