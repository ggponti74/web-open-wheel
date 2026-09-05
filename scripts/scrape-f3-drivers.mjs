import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const YEAR = new Date().getFullYear();
const STANDINGS_URL = `https://www.fiaformula3.com/en/standings/${YEAR}/drivers`;

async function scrapeF3Drivers() {
  try {
    const res = await fetch(STANDINGS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; web-open-wheel/1.0)' },
    });
    const html = await res.text();
    const doc = new JSDOM(html).window.document;

    const table = doc.querySelector('table');
    if (!table) {
      console.error(`No standings table found on ${STANDINGS_URL}`);
      writeFileSync('public/data/f3-drivers.json', 'null');
      return;
    }

    let rows = Array.from(table.querySelectorAll('tbody tr'));
    if (rows.length === 0) rows = Array.from(table.querySelectorAll('tr'));

    const standings = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 2) return null;

        // First cell is like "1F. Slater" — leading digits are the position,
        // the rest (no space after the digits) is the driver name.
        const firstCellText = cells[0].textContent.replace(/\s+/g, ' ').trim();
        const match = firstCellText.match(/^(\d+)\s*(.+)$/);
        if (!match) return null;

        const position = parseInt(match[1], 10);
        const name = match[2].trim();

        // Last cell is the total Points column.
        const pointsText = cells[cells.length - 1].textContent.replace(/\s+/g, '').trim();
        const points = parseInt(pointsText, 10);

        if (!name || Number.isNaN(position) || Number.isNaN(points)) return null;

        return { position, name, points };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    if (standings.length === 0) {
      console.error('No driver rows parsed from F3 standings table');
      writeFileSync('public/data/f3-drivers.json', 'null');
      return;
    }

    writeFileSync('public/data/f3-drivers.json', JSON.stringify(standings, null, 2));
    console.log(`Wrote ${standings.length} drivers to f3-drivers.json`);
  } catch (e) {
    console.error('F3 drivers scrape failed:', e.message);
  }
}

await scrapeF3Drivers();

process.exit(0);
