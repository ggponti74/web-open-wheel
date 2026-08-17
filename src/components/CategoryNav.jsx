import { CATEGORIES, getSeries } from '../series.js';

export function CategoryNav({ seriesId, activeCategory, onSelect }) {
  const series = getSeries(seriesId);

  return (
    <nav class="category-nav">
      {CATEGORIES.map((c) => {
        // "Teams" becomes "Manufacturers" for IndyCar, etc.
        const label = c.id === 'teams' ? series.teamsLabel : c.label;
        return (
          <button
            key={c.id}
            class={`category-nav__item ${c.id === activeCategory ? 'is-active' : ''}`}
            onClick={() => onSelect(c.id)}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
