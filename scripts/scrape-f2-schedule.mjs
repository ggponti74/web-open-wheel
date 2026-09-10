import { writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const HOME_URL = "https://www.fiaformula2.com/";
const OUTPUT_PATH = "public/data/f2-next-race.json";

// Country string (as shown in the widget) -> IANA timezone for the venue.
// NOTE: verify the exact country strings against real scrape output —
// e.g. it may say "United States of America" rather than "USA".
const VENUE_TIMEZONES = {
  Australia: "Australia/Melbourne",
  Bahrain: "Asia/Bahrain",
  "Saudi Arabia": "Asia/Riyadh",
  "United States of America": "America/New_York",
  Canada: "America/Toronto",
  Monaco: "Europe/Monaco",
  Spain: "Europe/Madrid",
  Austria: "Europe/Vienna",
  "Great Britain": "Europe/London",
  Belgium: "Europe/Brussels",
  Hungary: "Europe/Budapest",
  Italy: "Europe/Rome",
  Azerbaijan: "Asia/Baku",
  Qatar: "Asia/Qatar",
  "United Arab Emirates": "Asia/Dubai",
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Converts a wall-clock date/time in a given IANA zone to a UTC ISO string,
// using Node's built-in ICU data (no extra tz library needed).
function zonedTimeToUtcISO(year, month, day, hour, minute, timeZone) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(utcGuess).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute,
    +parts.second,
  );
  const diffMs = asUTC - utcGuess.getTime();
  return new Date(utcGuess.getTime() - diffMs).toISOString();
}

// Finds the next real-world date (today or later, in the venue's timezone)
// that falls on the given weekday name.
function nextDateForWeekday(weekdayName, timeZone) {
  const targetDow = WEEKDAYS.indexOf(weekdayName);
  if (targetDow === -1) return null;

  const now = new Date();
  const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(now)
    .reduce((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  const todayUTC = new Date(
    Date.UTC(+todayParts.year, +todayParts.month - 1, +todayParts.day),
  );
  const offset = (targetDow - todayUTC.getUTCDay() + 7) % 7;
  todayUTC.setUTCDate(todayUTC.getUTCDate() + offset);

  return {
    year: todayUTC.getUTCFullYear(),
    month: todayUTC.getUTCMonth() + 1,
    day: todayUTC.getUTCDate(),
  };
}

function sessionDateTime(session, timeZone) {
  const dateInfo = nextDateForWeekday(session.weekday, timeZone);
  if (!dateInfo) return null;
  const [hour, minute] = session.startTime.split(":").map(Number);
  return zonedTimeToUtcISO(
    dateInfo.year,
    dateInfo.month,
    dateInfo.day,
    hour,
    minute,
    timeZone,
  );
}

async function scrapeF2Schedule() {
  try {
    const res = await fetch(HOME_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; web-open-wheel/1.0)" },
    });
    const html = await res.text();
    const doc = new JSDOM(html).window.document;

    const sessionsContainer = doc.querySelector('[class*="_sessions"]');
    const locationContainer = doc.querySelector('[class*="_location"]');
    const city = locationContainer
      ?.querySelector('[class*="_country"] > span')
      ?.textContent.trim();
    const country = locationContainer
      ?.querySelector('[class*="_meeting-location"] > span')
      ?.textContent.trim();

    if (!sessionsContainer || !city || !country) {
      console.error(
        "Could not find the next-race widget on fiaformula3.com homepage",
      );
      writeFileSync(OUTPUT_PATH, "null");
      return;
    }

    const timeZone = VENUE_TIMEZONES[country];
    if (!timeZone) {
      console.error(
        `No timezone mapping for country "${country}" — add it to VENUE_TIMEZONES`,
      );
      writeFileSync(OUTPUT_PATH, "null");
      return;
    }

    const children = Array.from(sessionsContainer.children);
    const sessions = [];
    for (let i = 0; i + 2 < children.length; i += 3) {
      const name = children[i].textContent.trim();
      const weekday = children[i + 1].textContent.trim();
      const times = children[i + 2].querySelectorAll("time");
      const startTime = times[0]?.textContent.trim();
      if (name && weekday && startTime)
        sessions.push({ name, weekday, startTime });
    }

    const racedSessions = sessions.filter((s) => {
      const n = s.name.toLowerCase();
      return !n.includes("practice") && !n.includes("qualifying");
    });

    const upcoming = racedSessions
      .map((s) => ({ ...s, dateTime: sessionDateTime(s, timeZone) }))
      .filter((s) => s.dateTime && new Date(s.dateTime).getTime() > Date.now())
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    const next = upcoming[0];
    if (!next) {
      console.error("No upcoming sessions found in the widget");
      writeFileSync(OUTPUT_PATH, "null");
      return;
    }

    const race = {
      name: `F2 ${next.name}`,
      circuit: city,
      location: country,
      dateTime: next.dateTime,
    };
    writeFileSync(OUTPUT_PATH, JSON.stringify(race, null, 2));
    console.log("Wrote f2-next-race.json:", race);
  } catch (e) {
    console.error("F2 schedule scrape failed:", e.message);
  }
}

await scrapeF2Schedule();

process.exit(0);
