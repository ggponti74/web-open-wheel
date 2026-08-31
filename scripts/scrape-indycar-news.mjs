import Parser from "rss-parser";
import { writeFileSync } from "fs";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

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

const sources = [
  "https://www.indycar.com/news/rss/", // blocked: serves a bot-check/consent page instead of the feed, even with browser headers
  //"https://racer.com/category/indycar/feed/",
];

const allItems = [];

// Pass 1: Collect metadata from all sources
for (const url of sources) {
  try {
    const feed = await parseFeed(url);
    const source = feed.title || new URL(url).hostname;
    for (const i of feed.items) {
      allItems.push({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        source,
        excerpt: i.contentSnippet || i.description || null,
      });
    }
  } catch (e) {
    console.error(`  ⚠ failed to parse RSS feed ${url}: ${e.message}`);
  }
}

// Sort newest first & limit top items
allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
const limitedItems = allItems.slice(0, 25);

/*

// Pass 2: Fetch excerpts only for the 25 newest items
for (const item of limitedItems) {
  item.excerpt = await fetchExcerpt(item.link);
}

*/

// Write file once after all processing completes
writeFileSync(
  "public/data/indycar-news.json",
  JSON.stringify(limitedItems, null, 2),
);

console.log(
  `Successfully wrote ${limitedItems.length} items to indycar-news.json`,
);

process.exit(0);
