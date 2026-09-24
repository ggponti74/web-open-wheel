import { writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { fetchExcerpt, isLowContent, isLabelledTitle } from "./lib/news-excerpt.mjs";

// fiaformulae.com is a different platform from the FIA F2/F3 sites (Contentful-
// backed, not the same CMS), so this doesn't reuse fia-news-listing.mjs — that
// module is specific to the F2/F3 template. No RSS feed here either.
const BASE_URL = "https://www.fiaformulae.com";
const LISTING_URL = `${BASE_URL}/en/news`;
const MAX_ITEMS = 25;
const MAX_PAGES = 3; // ~12 items/page — enough to comfortably reach MAX_ITEMS
const UA = "Mozilla/5.0 (compatible; web-open-wheel/1.0)";

// Article links look like /en/news/<category>/<slug> (two segments after
// /news/). Bare category pages (/en/news/drivers) and the category-filter
// nav (/en/news/listing/racing-news) only have one matching segment or the
// "listing" segment, so requiring exactly two non-"listing" segments filters
// them out without needing to touch any class name.
const ARTICLE_PATH_RE = /^\/en\/news\/(?!listing\/)([a-z0-9-]+)\/([a-z0-9-]+)$/i;

function extractArticleLinks(html) {
  const doc = new JSDOM(html, { url: BASE_URL }).window.document;
  const anchors = Array.from(doc.querySelectorAll('a[href*="/en/news/"]'));

  const byHref = new Map();
  for (const a of anchors) {
    const href = a.getAttribute("href");
    const path = href.startsWith("http") ? new URL(href).pathname : href;
    if (!ARTICLE_PATH_RE.test(path)) continue;

    const absHref = new URL(href, BASE_URL).toString();
    const title = a.textContent.replace(/\s+/g, " ").trim();
    if (!title) continue;

    const existing = byHref.get(absHref);
    if (!existing || title.length > existing.title.length) {
      byHref.set(absHref, { title, link: absHref });
    }
  }
  return Array.from(byHref.values()).filter((i) => !isLabelledTitle(i.title));
}

async function fetchListingPage(pageNum) {
  const url = `${LISTING_URL}?page=${pageNum}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.error(`  ⚠ listing page ${pageNum} returned ${res.status}`);
      return [];
    }
    return extractArticleLinks(await res.text());
  } catch (e) {
    console.error(`  ⚠ failed to fetch listing page ${pageNum}: ${e.message}`);
    return [];
  }
}

// Pass 1: collect article links across listing pages (cheap — no article
// fetches yet), deduping as pages can repeat items.
const seen = new Map();
for (let page = 1; page <= MAX_PAGES && seen.size < MAX_ITEMS; page++) {
  const items = await fetchListingPage(page);
  for (const item of items) {
    if (!seen.has(item.link)) seen.set(item.link, item);
  }
}
const candidates = Array.from(seen.values()).slice(0, MAX_ITEMS);

// Pass 2: fetch each article once for excerpt. The site doesn't expose a
// machine-readable publish date (only a display string like "18 Sep '26"
// in the page body), so pubDate stays null — same as F2/F3, the frontend
// doesn't render it and listing order already reflects newest-first.
for (const item of candidates) {
  const { excerpt } = await fetchExcerpt(item.link, { userAgent: UA });
  item.excerpt = excerpt;
  item.pubDate = null;
  item.source = "FIA Formula E";
}

// Pass 3: drop low-content items (video-only pages with little body text,
// promo stubs, etc).
const finalItems = candidates.filter((item) => !isLowContent(item.excerpt));
const droppedCount = candidates.length - finalItems.length;

writeFileSync(
  "public/data/fe-news.json",
  JSON.stringify(finalItems, null, 2),
);

console.log(`Successfully wrote ${finalItems.length} items to fe-news.json`);

process.exit(0);
