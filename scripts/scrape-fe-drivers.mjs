import { writeFileSync } from 'fs';

const CHAMPIONSHIP_ID = '8088703b-96c1-410d-a48b-77fca322334f';
const API_URL = `https://api.formula-e.pulselive.com/formula-e/v1/standings/drivers?championshipId=${CHAMPIONSHIP_ID}`;

async function scrapeFEDrivers() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; web-open-wheel/1.0)',
        'Origin': 'https://www.fiaformulae.com',
        'Referer': 'https://www.fiaformulae.com/',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`FE standings API returned ${res.status}`);
      writeFileSync('public/data/formulae-drivers.json', 'null');
      return;
    }

    const data = await res.json();

    // Response is a flat array of driver entries, no wrapper object.
    const standings = data
      .map((d) => {
        const position = d.driverPosition;
        const name = `${d.driverFirstName ?? ''} ${d.driverLastName ?? ''}`.trim();
        const points = d.driverPoints;

        if (!name || typeof position !== 'number' || typeof points !== 'number') return null;

        return { position, name, points };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    if (standings.length === 0) {
      console.error('No driver entries parsed from FE standings response');
      writeFileSync('public/data/formulae-drivers.json', 'null');
      return;
    }

    writeFileSync('public/data/formulae-drivers.json', JSON.stringify(standings, null, 2));
    console.log(`Wrote ${standings.length} drivers to formulae-drivers.json`);
  } catch (e) {
    console.error('FE drivers scrape failed:', e.message);
  }
}

await scrapeFEDrivers();

process.exit(0);
