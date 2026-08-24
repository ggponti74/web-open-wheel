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

