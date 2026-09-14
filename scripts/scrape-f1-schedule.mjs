// scripts/scrape-f1-schedule.mjs
import { writeFileSync } from "fs";

const BASE = "https://api.jolpi.ca/ergast/f1";

async function main() {
  const res = await fetch(`${BASE}/current/next.json`);
  if (!res.ok) throw new Error(`Jolpica fetch failed: ${res.status}`);
  const data = await res.json();
  const race = data.MRData.RaceTable.Races[0];

  const record = {
    city: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    raceName: race.raceName,
    date: race.date,
  };

  writeFileSync("public/data/f1-schedule.json", JSON.stringify([record], null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });