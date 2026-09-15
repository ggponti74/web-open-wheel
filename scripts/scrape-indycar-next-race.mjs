import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const SCHEDULE_URL = 'https://www.indycar.com/Schedule';

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Rough US Eastern Time DST heuristic (mid-Mar to early Nov = EDT, else EST).
// Good enough for display purposes; not exact around the DST transition days.
function etOffsetForMonth(monthIndex) {
  return monthIndex >= 2 && monthIndex <= 10 ? '-04:00' : '-05:00';
}

function parseDateTime(dateLabel, timeLabel, year) {
  const [monAbbr, dayStr] = dateLabel.trim().split(' ');
  const month = MONTHS[monAbbr];
  const day = parseInt(dayStr, 10);

  const timeMatch = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (month === undefined || !timeMatch) return null;

  let hour = parseInt(timeMatch[1], 10);
  const minute = timeMatch[2];
  const ampm = timeMatch[3];
  if (/PM/i.test(ampm) && hour !== 12) hour += 12;
  if (/AM/i.test(ampm) && hour === 12) hour = 0;

  const pad = (n) => String(n).padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${minute}:00${etOffsetForMonth(month)}`;
}

async function scrapeIndyCarSchedule() {
  try {
    const res = await fetch(SCHEDULE_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; web-open-wheel/1.0)' },
    });
    const html = await res.text();
    const doc = new JSDOM(html).window.document;

    // Scope to the megamenu header literally labeled "Next Race" to avoid
    // matching the near-identical "Previous Race" card, which reuses the
    // same .event-card classes elsewhere on the page.
    const header = Array.from(doc.querySelectorAll('p.megamenu-header'))
      .find((h) => h.textContent.trim() === 'Next Race');
    const card = header?.nextElementSibling?.querySelector('.event-card');

    if (!card) {
      console.error('Could not find Next Race card on indycar.com/Schedule');
      writeFileSync('public/data/indycar-next-race.json', 'null');
      return;
    }

    const dateLabel = card.querySelector('.event-card-header-date')?.textContent.trim();
    const timeLabel = card.querySelector('.event-card-header-time')?.textContent.trim();
    const name = card.querySelector('.event-card-title')?.textContent.trim();
    const circuit = card.querySelector('.event-card-track-name')?.textContent.trim();
    const location = card.querySelector('.event-card-track-location')?.textContent.trim();

    const year = new Date().getFullYear();
    const dateTime = dateLabel && timeLabel ? parseDateTime(dateLabel, timeLabel, year) : null;

    const race = { name, circuit, location, dateTime };
    writeFileSync('public/data/indycar-next-race.json', JSON.stringify(race, null, 2));
    console.log('Wrote indycar-next-race.json:', race);
  } catch (e) {
    console.error('IndyCar schedule scrape failed:', e.message);
  }
}

await scrapeIndyCarSchedule();

process.exit(0);