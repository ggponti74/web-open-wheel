import Parser from "rss-parser";
import { writeFileSync } from "fs";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const MIN_EXCERPT_LENGTH = 300;

function isLowContent(excerpt) {
  if (!excerpt) return true;
  return excerpt.trim().length < MIN_EXCERPT_LENGTH;
}

const parser = new Parser();

async function fetchExcerpt(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; web-open-wheel/1.0)" },
    });
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article || !article.content) return null;

    const markedHtml = article.content
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n\n");

    const textDom = new JSDOM(`<div>${markedHtml}</div>`);
    const paragraphs = textDom.window.document.body.textContent
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (paragraphs.length === 0) return null;
    return paragraphs.join("\n\n");
  } catch (e) {
    console.error(`  ⚠ excerpt fetch failed for ${url}: ${e.message}`);
    return null;
  }
}

function extractExcerpt(html) {
  if (!html) return null;
  const dom = new JSDOM(`<div>${html}</div>`);
  const p = dom.window.document.querySelector("p");
  return p ? p.textContent.replace(/\s+/g, " ").trim() : null;
}

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
  "https://www.foxnews.com/rss.xml?tag=indycar",
  "https://feedfry.com/rss/11f1a57b543724cd8cd7e8b18079dc2c",
  "https://www.yardbarker.com/rss/sport_merged/15",
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
        excerpt: null,
      });
    }
  } catch (e) {
    console.error(`  ⚠ failed to parse RSS feed ${url}: ${e.message}`);
  }
}

// Pass 3: drop low-content items and log how many were dropped
const limitedItems = allItems.slice(0, 25);
const finalItems = limitedItems.filter((item) => !isLowContent(item.excerpt));
const droppedCount = limitedItems.length - finalItems.length;

// Pass 4: Sort newest first & limit top items
allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

// Pass 5: Fetch excerpts only for the 25 newest items
for (const item of limitedItems) {
  item.excerpt = await fetchExcerpt(item.link);
}

// Write file once after all processing completes
writeFileSync(
  "public/data/indycar-news.json",
  JSON.stringify(limitedItems, null, 2),
);

console.log(
  `Successfully wrote ${limitedItems.length} items to indycar-news.json`,
);

process.exit(0);
