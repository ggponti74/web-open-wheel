import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const STANDINGS_URL = 'https://www.indycar.com/Standings?standings=EngineManufacturer';

async function scrapeIndyCarManufacturers() {
  try {
    const res = await fetch(STANDINGS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; web-open-wheel/1.0)' },
    });
    const html = await res.text();
    const doc = new JSDOM(html).window.document;

    const rows = doc.querySelectorAll('tr.data-table-driver-row');
    const standings = Array.from(rows)
      .map((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return null;

        const position = parseInt(cells[0].textContent.trim(), 10);
        const name = row.querySelector('.data-table-grouped-container p')?.textContent.trim();
        const pointsText = cells[4].querySelector('b')?.textContent.trim();
        const points = pointsText ? parseInt(pointsText, 10) : null;

        if (!name || Number.isNaN(position) || points === null) return null;
        return { position, name, points };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    if (standings.length === 0) {
      console.error('No manufacturer standings found');
      writeFileSync('public/data/indycar-teams.json', 'null');
      return;
    }

    writeFileSync('public/data/indycar-teams.json', JSON.stringify(standings, null, 2));
    console.log(`Wrote ${standings.length} manufacturers to indycar-teams.json`);
  } catch (e) {
    console.error('IndyCar manufacturer scrape failed:', e.message);
  }
}

scrapeIndyCarManufacturers();

process.exit(0);
