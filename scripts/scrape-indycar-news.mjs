import Parser from "rss-parser";
import { writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { fetchExcerpt, isLowContent } from "./lib/news-excerpt.mjs";

const MAX_ITEMS = 25;
const UA = "Mozilla/5.0 (compatible; web-open-wheel/1.0)";
const parser = new Parser();

async function parseFeed(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
  });
  const xml = await res.text();
  const sanitized = xml.replace(
    /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g,
    "&amp;",
  );
  return parser.parseString(sanitized);
}

// Feedfry was previously mirroring indycar.com's own news (no RSS feed
// there), but that mirror had gone stale. Scraping /news directly instead.
const RSS_SOURCES = [
  "https://racer.com/category/indycar/feed/",
  "https://www.yardbarker.com/rss/sport_merged/15",
];

// indycar.com/news is server-rendered and, unlike the FIA F2/F3/FE sites,
// doesn't need pagination — the same articles repeat across the page's
// "Top Stories"/"Featured"/"Driver News"/"Team News" sections, so deduping
// by link already yields a good-sized, genuinely current set. Article URLs
// also embed the publish date directly (/news/<year>/<month>/<MM>-<DD>-
// <slug>), which is more reliable than anything on the article page itself
// (no article:published_time meta tag), so pubDate is read from the URL.
const INDYCAR_BASE_URL = "https://www.indycar.com";
const ARTICLE_PATH_RE =
  /^\/news\/(\d{4})\/(\d{2})\/(\d{2})-(\d{2})-[a-z0-9-]+$/i;

function extractIndycarLinks(html) {
  const doc = new JSDOM(html, { url: INDYCAR_BASE_URL }).window.document;
  const anchors = Array.from(doc.querySelectorAll('a[href*="/news/"]'));

  const byHref = new Map();
  for (const a of anchors) {
    const href = a.getAttribute("href");
    const path = href.startsWith("http") ? new URL(href).pathname : href;
    const match = path.match(ARTICLE_PATH_RE);
    if (!match) continue;

    const [, year, , month, day] = match;
    const absHref = new URL(href, INDYCAR_BASE_URL).toString();
    // The "Featured"/"Driver News"/"Team News" cards mash thumbnail alt
    // text, byline, and blurb into one anchor, but they set a clean title
    // attribute; "Top Stories" links don't set one but their text content
    // is already just the title.
    const title = (a.getAttribute("title") || a.textContent)
      .replace(/\s+/g, " ")
      .trim();
    if (!title) continue;

    if (!byHref.has(absHref)) {
      byHref.set(absHref, {
        title,
        link: absHref,
        pubDate: `${year}-${month}-${day}`,
      });
    }
  }
  return Array.from(byHref.values());
}

async function fetchIndycarNews() {
  try {
    const res = await fetch(`${INDYCAR_BASE_URL}/news`, {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) {
      console.error(`  ⚠ indycar.com/news returned ${res.status}`);
      return [];
    }
    return extractIndycarLinks(await res.text());
  } catch (e) {
    console.error(`  ⚠ failed to fetch indycar.com/news: ${e.message}`);
    return [];
  }
}

const allItems = [];

// Pass 1: collect metadata from the RSS sources...
for (const url of RSS_SOURCES) {
  try {
    const feed = await parseFeed(url);
    const source = feed.title || new URL(url).hostname;
    for (const i of feed.items) {
      allItems.push({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        source,
        excerpt: null,
      });
    }
  } catch (e) {
    console.error(`  ⚠ failed to parse RSS feed ${url}: ${e.message}`);
  }
}

// ...and from indycar.com directly.
for (const item of await fetchIndycarNews()) {
  allItems.push({ ...item, source: "IndyCar.com", excerpt: null });
}

// Pass 2: sort newest first, then cap — sorting before slicing (a bug in
// the previous version sorted `allItems` after `limitedItems` had already
// been sliced from the unsorted array).
allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
const candidates = allItems.slice(0, MAX_ITEMS);

// Pass 3: fetch excerpts only for the items being kept.
for (const item of candidates) {
  const { excerpt } = await fetchExcerpt(item.link, { userAgent: UA });
  item.excerpt = excerpt;
}

// Pass 4: drop low-content items (the previous version filtered before
// excerpts were fetched, so isLowContent(null) was always true and nothing
// ever survived — finalItems went unused and unfiltered limitedItems was
// written instead).
const finalItems = candidates.filter((item) => !isLowContent(item.excerpt));
const droppedCount = candidates.length - finalItems.length;

writeFileSync(
  "public/data/indycar-news.json",
  JSON.stringify(finalItems, null, 2),
);

console.log(
  `Successfully wrote ${finalItems.length} items to indycar-news.json`,
);

process.exit(0);
