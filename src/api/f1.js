const BASE = 'https://api.jolpi.ca/ergast/f1';

export async function getDriverStandings() {
  const res = await fetch(`${BASE}/current/driverstandings.json`);
  const data = await res.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings() {
  const res = await fetch(`${BASE}/current/constructorstandings.json`);
  const data = await res.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

export async function getNextRace() {
  const res = await fetch(`${BASE}/current/next.json`);
  const data = await res.json();
  return data.MRData.RaceTable.Races[0] ?? null;
}