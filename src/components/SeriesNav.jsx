import { SERIES } from '../series.js';

export function SeriesNav({ activeSeries, onSelect }) {
  return (
    <nav class="series-nav">
      {SERIES.map((s) => (
        <button
          key={s.id}
          class={`series-nav__item ${s.id === activeSeries ? 'is-active' : ''}`}
          onClick={() => onSelect(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
