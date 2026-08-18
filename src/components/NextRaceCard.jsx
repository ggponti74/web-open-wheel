export function NextRaceCard({ race }) {
  if (!race) {
    return <p class="status-text">No races left in the current season.</p>;
  }

  return (
    <div class="next-race-card">
      <h2>{race.name}</h2>
      {race.circuit && <p>{race.circuit}</p>}
      {race.location && <p>{race.location}</p>}
      {race.dateTime && <p>{new Date(race.dateTime).toLocaleString()}</p>}
    </div>
  );
}
