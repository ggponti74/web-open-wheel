import { writeFileSync } from "fs";
import { fetchExcerpt, isLowContent } from "./lib/news-excerpt.mjs";
import { fetchNewsLinks, extractPublishedDate } from "./lib/fia-news-listing.mjs";

const BASE_URL = "https://www.fiaformula3.com";
const MAX_ITEMS = 25;

// Pass 1: collect article links from the listing pages (cheap — no article
// fetches yet).
const candidates = await fetchNewsLinks({ baseUrl: BASE_URL, maxItems: MAX_ITEMS });

// Pass 2: fetch each article once for excerpt + best-effort pubDate.
for (const item of candidates) {
  const { excerpt, html } = await fetchExcerpt(item.link);
  item.excerpt = excerpt;
  item.pubDate = extractPublishedDate(html);
  item.source = "FIA Formula 3";
}

// Pass 3: drop low-content items (app promo stubs, paywalled snippets, etc).
const finalItems = candidates.filter((item) => !isLowContent(item.excerpt));
const droppedCount = candidates.length - finalItems.length;

writeFileSync(
  "public/data/f3-news.json",
  JSON.stringify(finalItems, null, 2),
);

console.log(`Successfully wrote ${finalItems.length} items to f3-news.json`);

process.exit(0);
