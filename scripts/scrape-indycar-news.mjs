import Parser from 'rss-parser';
import { writeFileSync } from 'fs';

const parser = new Parser();

const sources = [
  'https://www.motorsport.com/rss/indycar/news/',
  'https://www.racefans.net/category/motorsport/indycar/feed/',
];

const allItems = [];
for (const url of sources) {
  const feed = await parser.parseURL(url);
  allItems.push(...feed.items.map(i => ({
    title: i.title,
    link: i.link,
    pubDate: i.pubDate, // needed for sorting
  })));
}

allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)); // newest first

writeFileSync('public/data/f1-news.json', JSON.stringify(allItems, null, 2));
