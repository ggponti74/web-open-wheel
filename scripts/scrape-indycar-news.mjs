import Parser from "rss-parser";
import { writeFileSync } from "fs";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

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

const parser = new Parser();

const sources = [

"https://www.indycar.com/News", 

"https://racer.com/category/IndyCar/feed",
  "https://www.racefans.net/category/motorsport/indycar/feed/",
];

const allItems = [];

// Pass 1: Collect metadata from all sources
for (const url of sources) {
  try {
    const feed = await parser.parseURL(url);
    const source = feed.title || new URL(url).hostname;
    for (const i of feed.items) {
      allItems.push({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        source,
      });
    }
  } catch (e) {
    console.error(`  ⚠ failed to parse RSS feed ${url}: ${e.message}`);
  }
}

// Sort newest first & limit top items
allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
const limitedItems = allItems.slice(0, 25);

// Pass 2: Fetch excerpts only for the 25 newest items
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
