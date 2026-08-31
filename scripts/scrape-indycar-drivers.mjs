import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const STANDINGS_URL = 'https://www.indycar.com/Standings';

function decodeEntities(str) {
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function scrapeIndyCarDrivers() {
  try {
    const res = await fetch(STANDINGS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; web-open-wheel/1.0)' },
    });
    const html = await res.text();
    const doc = new JSDOM(html).window.document;

    const buttons = doc.querySelectorAll('button.data-table-driver-container');
    const standings = Array.from(buttons)
      .map((btn) => {
        const raw = btn.getAttribute('data-driver-data');
        if (!raw) return null;
        try {
          const d = JSON.parse(raw);
          return {
            position: d.rank,
            name: decodeEntities(`${d.firstName} ${d.lastName}`),
            points: d.points,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    if (standings.length === 0) {
      console.error('No driver standings found on indycar.com/Standings');
      writeFileSync('public/data/indycar-drivers.json', 'null');
      return;
    }

    writeFileSync('public/data/indycar-drivers.json', JSON.stringify(standings, null, 2));
    console.log(`Wrote ${standings.length} drivers to indycar-drivers.json`);
  } catch (e) {
    console.error('IndyCar drivers scrape failed:', e.message);
  }
}

await scrapeIndyCarDrivers();

process.exit(0);
