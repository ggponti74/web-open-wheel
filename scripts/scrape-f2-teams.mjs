import { writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const YEAR = new Date().getFullYear();
const STANDINGS_URL = `https://www.fiaformula2.com/en/standings/${YEAR}/teams`;

async function scrapeF2Teams() {
  try {
    const res = await fetch(STANDINGS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; web-open-wheel/1.0)" },
    });
    const html = await res.text();
    const doc = new JSDOM(html).window.document;

    const table = doc.querySelector("table");
    if (!table) {
      console.error(`No standings table found on ${STANDINGS_URL}`);
      writeFileSync("public/data/f2-teams.json", "null");
      return;
    }

    let rows = Array.from(table.querySelectorAll("tbody tr"));
    if (rows.length === 0) rows = Array.from(table.querySelectorAll("tr"));

    const standings = rows
      .map((row) => {
        // Same sticky-column layout as the drivers table: position+name
        // frozen on the left as <th>, total points frozen on the right.
        const ths = row.querySelectorAll("th");
        if (ths.length < 2) return null;

        const nameCell = ths[0];
        const pointsCell = ths[ths.length - 1];

        const spans = nameCell.querySelectorAll("span");
        let position, name;
        if (spans.length >= 2) {
          position = parseInt(spans[0].textContent.trim(), 10);
          name = spans[1].textContent.trim();
        } else {
          // Team name cell may not use the same two-span markup as
          // drivers — fall back to splitting the leading rank number
          // off the raw cell text.
          const raw = nameCell.textContent.trim();
          const match = raw.match(/^(\d+)\s*(.+)$/);
          position = match ? parseInt(match[1], 10) : NaN;
          name = match ? match[2].trim() : raw;
        }

        const points = parseInt(
          pointsCell.textContent.replace(/\s+/g, "").trim(),
          10,
        );

        if (!name || Number.isNaN(position) || Number.isNaN(points))
          return null;

        return { position, name, points };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    if (standings.length === 0) {
      console.error("No team rows parsed from F2 standings table");
      writeFileSync("public/data/f2-teams.json", "null");
      return;
    }

    writeFileSync(
      "public/data/f2-teams.json",
      JSON.stringify(standings, null, 2),
    );
    console.log(`Wrote ${standings.length} teams to f2-teams.json`);
  } catch (e) {
    console.error("F2 teams scrape failed:", e.message);
  }
}

await scrapeF2Teams();

process.exit(0);
