import { useEffect } from 'preact/hooks';

export default function ArticleReader({ article, onClose }) {
  useEffect(() => {
    // Prevent background scroll while reader is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!article) return null;

  const openExternal = () => {
    window.open(article.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div class="article-reader">
      <div class="article-reader-header">
        <button
          class="article-reader-icon-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <button
          class="article-reader-icon-btn"
          onClick={openExternal}
          aria-label="Open in browser"
        >
          ↗
        </button>
      </div>
      <div class="article-reader-content">
        <h1>{article.title}</h1>
        {article.source && <div class="article-reader-source">{article.source}</div>}
        <div class="article-reader-body">
          {article.excerpt.split('\n').map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : null
          )}
        </div>
      </div>
    </div>
  );
}