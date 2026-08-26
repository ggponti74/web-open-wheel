import Parser from 'rss-parser';
import { writeFileSync } from 'fs';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

async function fetchExcerpt(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; web-open-wheel/1.0)' }
    });
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article || !article.textContent) return null;
    const text = article.textContent.trim().replace(/\s+/g, ' ');
    return text; //text.length > 600 ? text.slice(0, 600) + '…' : text;
  } catch (e) {
    console.error(`  ⚠ excerpt fetch failed for ${url}: ${e.message}`);
    return null;
  }
}

const parser = new Parser();
const sources = [
  'https://www.formula1.com/en/latest/all.xml',
  'https://www.motorsport.com/rss/f1/news/',
  'https://www.autosport.com/rss/f1/news/',
];

const allItems = [];
for (const url of sources) {
  const feed = await parser.parseURL(url);
  const source = feed.title || new URL(url).hostname;
  for (const i of feed.items) {
    //console.log(`Fetching excerpt: ${i.title}`);
    const excerpt = await fetchExcerpt(i.link);
    allItems.push({
      title: i.title,
      link: i.link,
      pubDate: i.pubDate,
      source,
      excerpt,
    });
  }
}

allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)); // newest first

writeFileSync('public/data/f1-news.json', JSON.stringify(allItems, null, 2));
