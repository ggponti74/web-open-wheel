// Shared by the FIA F2 and F3 sites (fiaformula2.com / fiaformula3.com) —
// same underlying platform (same Cloudinary bucket, same markup), neither
// exposes an RSS feed for news. Scrapes the "Latest News" listing instead.
//
// Article links follow a stable /en/latest/article/<slug>.<id> pattern even
// though surrounding class names are hashed and rotate on redeploy (same
// issue as the F2/F3 standings tables), so we select on the href pattern
// rather than any class.
import { JSDOM } from "jsdom";

const DEFAULT_UA = "Mozilla/5.0 (compatible; web-open-wheel/1.0)";

function extractArticleLinks(html, baseUrl) {
  const doc = new JSDOM(html, { url: baseUrl }).window.document;
  const anchors = Array.from(
    doc.querySelectorAll('a[href*="/en/latest/article/"]'),
  );

  const byHref = new Map();
  for (const a of anchors) {
    const href = new URL(a.getAttribute("href"), baseUrl).toString();
    let title = a.textContent.replace(/\s+/g, " ").trim();
    // Strip badge labels that share the anchor with the title text.
    title = title.replace(/^(BREAKING)\s*/i, "").replace(/\s*(Gallery|Video)$/i, "").trim();
    if (!title) continue;

    const existing = byHref.get(href);
    if (!existing || title.length > existing.title.length) {
      byHref.set(href, { title, link: href });
    }
  }
  // Map preserves insertion order, which matches the page's newest-first order.
  return Array.from(byHref.values());
}

// Collects up to maxItems unique {title, link} entries across listing pages,
// deduping (the "Load more" pages can repeat items).
export async function fetchNewsLinks({
  baseUrl,
  maxItems = 25,
  maxPages = 2,
  userAgent = DEFAULT_UA,
}) {
  const seen = new Map();
  for (let page = 1; page <= maxPages && seen.size < maxItems; page++) {
    const url = `${baseUrl}/en/latest/page_${page}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": userAgent } });
      if (!res.ok) {
        console.error(`  ⚠ listing page ${page} returned ${res.status}`);
        continue;
      }
      const items = extractArticleLinks(await res.text(), baseUrl);
      for (const item of items) {
        if (!seen.has(item.link)) seen.set(item.link, item);
      }
    } catch (e) {
      console.error(`  ⚠ failed to fetch listing page ${page}: ${e.message}`);
    }
  }
  return Array.from(seen.values()).slice(0, maxItems);
}

// Best-effort publish date from a page already fetched for its excerpt —
// checked against meta tag, <time> element, and JSON-LD, in that order.
// Callers should treat a null result as fine to write through: the frontend
// doesn't render pubDate, and item order already reflects the site's own
// newest-first listing order.
export function extractPublishedDate(html) {
  if (!html) return null;

  const metaMatch = html.match(
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
  );
  if (metaMatch) return metaMatch[1];

  const timeMatch = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (timeMatch) return timeMatch[1];

  const ldMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/i);
  if (ldMatch) return ldMatch[1];

  return null;
}
