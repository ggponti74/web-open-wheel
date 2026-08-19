const VERSION = "1.0.2";

import { useState } from 'preact/hooks';
import { SeriesPage } from './pages/SeriesPage.jsx';
import { SeriesNav } from './components/SeriesNav.jsx';
import { CategoryNav } from './components/CategoryNav.jsx';
import { SERIES } from './series.js';

// Remembers, per series, which category tab you were last on
// so switching series and switching back doesn't reset your place.
const defaultCategoryBySeries = Object.fromEntries(
  SERIES.map((s) => [s.id, 'drivers'])
);

const categoryLabel = series.id === 'teams' ? series.teamsLabel : series.label;

export function App() {
  const [currentSeries, setCurrentSeries] = useState(SERIES[0].id);
  const [categoryBySeries, setCategoryBySeries] = useState(defaultCategoryBySeries);

  const currentCategory = categoryBySeries[currentSeries];

  function selectCategory(categoryId) {
    setCategoryBySeries((prev) => ({ ...prev, [currentSeries]: categoryId }));
  }

  return (
    <div class="app-shell">
      <main class="app-content">
        <SeriesPage seriesId={currentSeries} categoryId={currentCategory} />
      </main>

      <CategoryNav
        seriesId={currentSeries}
        activeCategory={currentCategory}
        onSelect={selectCategory}
      />
      <SeriesNav
        activeSeries={currentSeries}
        onSelect={setCurrentSeries}
      />
    </div>
  );
}
