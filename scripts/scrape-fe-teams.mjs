import { writeFileSync } from "fs";

const CHAMPIONSHIP_ID = "8088703b-96c1-410d-a48b-77fca322334f";
const API_URL = `https://api.formula-e.pulselive.com/formula-e/v1/standings/teams?championshipId=${CHAMPIONSHIP_ID}`;

async function scrapeFETeams() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; web-open-wheel/1.0)",
        Origin: "https://www.fiaformulae.com",
        Referer: "https://www.fiaformulae.com/",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error(`FE team standings API returned ${res.status}`);
      writeFileSync("public/data/fe-teams.json", "null");
      return;
    }

    const data = await res.json();

    // Response is expected to be a flat array of team entries, mirroring
    // the drivers endpoint. Field names are guessed from the drivers
    // response convention (driverPosition/driverPoints -> teamPosition/
    // teamPoints) since this endpoint hasn't been inspected directly yet.
    // If parsing comes up empty, the raw shape of the first entry is
    // logged below so the field names can be corrected.
    const standings = data
      .map((t) => {
        const position = t.teamPosition ?? t.position;
        const name = t.teamName ?? t.name;
        const points = t.teamPoints ?? t.points;

        if (!name || typeof position !== "number" || typeof points !== "number")
          return null;

        return { position, name, points };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    if (standings.length === 0) {
      console.error("No team entries parsed from FE standings response");
      if (Array.isArray(data) && data.length > 0) {
        console.error(
          "Sample entry for field-name debugging:",
          JSON.stringify(data[0]),
        );
      }
      writeFileSync("public/data/fe-teams.json", "null");
      return;
    }

    writeFileSync(
      "public/data/fe-teams.json",
      JSON.stringify(standings, null, 2),
    );
    console.log(`Wrote ${standings.length} teams to fe-teams.json`);
  } catch (e) {
    console.error("FE teams scrape failed:", e.message);
  }
}

await scrapeFETeams();

process.exit(0);
