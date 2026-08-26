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
    if (!article || !article.content) return null;

    // Mark block-level boundaries before stripping tags, since some sites
    // separate paragraphs with <br> inside one container rather than
    // using distinct <p> elements.
    const markedHtml = article.content
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n\n');

    const textDom = new JSDOM(`<div>${markedHtml}</div>`);
    const paragraphs = textDom.window.document.body.textContent
      .split(/\n\s*\n/)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    if (paragraphs.length === 0) return null;
    return paragraphs.join('\n\n');
  } catch (e) {
    console.error(`  ⚠ excerpt fetch failed for ${url}: ${e.message}`);
    return null;
  }
}

const parser = new Parser();

const sources = [
  'https://www.motorsport.com/rss/indycar/news/',
  'https://www.racefans.net/category/motorsport/indycar/feed/',
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

writeFileSync('public/data/indycar-news.json', JSON.stringify(allItems, null, 2));
