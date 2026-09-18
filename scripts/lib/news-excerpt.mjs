// Shared across all news scrapers (F1, F2, F3, FE, IndyCar): fetches a
// single article URL and pulls a readable excerpt out of it via Readability,
// plus the low-content filter used to drop promo stubs / paywalled snippets.
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const DEFAULT_UA = "Mozilla/5.0 (compatible; web-open-wheel/1.0)";

export function isLowContent(excerpt, minLength = 300) {
  if (!excerpt) return true;
  return excerpt.trim().length < minLength;
}

// Returns { excerpt, html } — html is the raw page source in case a caller
// also needs to pull other metadata (e.g. a publish date) out of it without
// fetching the page twice.
export async function fetchExcerpt(url, { userAgent = DEFAULT_UA } = {}) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": userAgent } });
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article || !article.content) return { excerpt: null, html };

    const markedHtml = article.content
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n\n");

    const textDom = new JSDOM(`<div>${markedHtml}</div>`);
    const paragraphs = textDom.window.document.body.textContent
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    return { excerpt: paragraphs.length ? paragraphs.join("\n\n") : null, html };
  } catch (e) {
    console.error(`  ⚠ excerpt fetch failed for ${url}: ${e.message}`);
    return { excerpt: null, html: null };
  }
}
