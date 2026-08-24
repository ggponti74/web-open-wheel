export function NewsList({ items }) {
  return (
    <ul class="news-list">
      {items.map((item) => (
        <li key={item.link} class="news-list__item">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function NewsCard({ article }) {
  return (
    <div className="news-card">
      <div className="news-source">{article.source}</div>
      <h3 className="news-title">{article.title}</h3>
      <p className="news-excerpt">{article.excerpt}</p>
      <div className="news-footer">
        <span className="news-date">{formatDate(article.pubDate)}</span>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="news-readmore"
        />
      </div>
    </div>
  );
}
