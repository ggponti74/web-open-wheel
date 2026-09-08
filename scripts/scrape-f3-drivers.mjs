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
        // The table has two "sticky" frozen <th> columns: position+name on
        // the left, total points on the right. Everything in between
        // (per-round breakdown) is plain <td> and is ignored.
        const ths = row.querySelectorAll('th');
        if (ths.length < 2) return null;

        const nameCell = ths[0];
        const pointsCell = ths[ths.length - 1];

        const spans = nameCell.querySelectorAll('span');
        if (spans.length < 2) return null;

        const position = parseInt(spans[0].textContent.trim(), 10);
        const name = spans[1].textContent.trim();
        const points = parseInt(pointsCell.textContent.replace(/\s+/g, '').trim(), 10);

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
