export function NewsList({ items, onSelect }) {
  return (
    <ul class="news-list">
      {items.map((item, index) => (
        <li key={item.link} class="news-list__item">
          {item.excerpt ? (
            <button
              type="button"
              class="news-list__link"
              onClick={() => onSelect(index)}
            >
              {item.title}
            </button>
          ) : (
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
