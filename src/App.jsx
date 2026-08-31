const VERSION = "1.1.__BUILD_VERSION__.1";

import { useRef } from "preact/hooks";
import { useState } from "preact/hooks";
import { useEffect } from "preact/hooks";
import { SeriesPage } from "./pages/SeriesPage.jsx";
import { SeriesNav } from "./components/SeriesNav.jsx";
import { CategoryNav } from "./components/CategoryNav.jsx";
import { SERIES } from "./series.js";
import { CATEGORIES } from "./series.js";

const defaultCategoryBySeries = Object.fromEntries(
  SERIES.map((s) => [s.id, "news"]),
);

export function App() {
  const [currentSeries, setCurrentSeries] = useState(SERIES[0].id);
  const [categoryBySeries, setCategoryBySeries] = useState(
    defaultCategoryBySeries,
  );

  const currentCategory = categoryBySeries[currentSeries];

  const [logoTapCount, setLogoTapCount] = useState(0);
  const [showVersion, setShowVersion] = useState(false);

  const handleFerrariTap = () => {
    const next = logoTapCount + 1;
    if (next >= 5) {
      setShowVersion((v) => !v);
      setLogoTapCount(0);
    } else {
      setLogoTapCount(next);
    }
  };

  function selectCategory(categoryId) {
    setCategoryBySeries((prev) => ({ ...prev, [currentSeries]: categoryId }));
  }

  function goToCategory(direction) {
    const index = CATEGORIES.findIndex((c) => c.id === currentCategory);
    const newIndex = index + direction; // direction is +1 or -1

    if (newIndex < 0 || newIndex >= CATEGORIES.length) return; // clamp at ends

    selectCategory(CATEGORIES[newIndex].id); // <-- this line is missing
  }

  // inside App component, alongside your other state/refs
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const threshold = 50; // min px to count as an intentional swipe

    // ignore if the gesture was more vertical than horizontal (likely a scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        goToCategory(1); // swiped left → next category
      } else {
        goToCategory(-1); // swiped right → previous category
      }
    }

    //alert(Math.round(touchStartX.current) + " : " + Math.round(touchStartY.current) + ", " + Math.round(deltaX) + " : " + Math.round(deltaY));

    touchStartX.current = null;
    touchStartY.current = null;
  }

  return (
    <div class="app-shell">
      <main
        class="app-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SeriesPage
          seriesId={currentSeries}
          categoryId={currentCategory}
          onFerrariTap={handleFerrariTap}
        />
      </main>

      <CategoryNav
        seriesId={currentSeries}
        activeCategory={currentCategory}
        onSelect={selectCategory}
      />
      <SeriesNav activeSeries={currentSeries} onSelect={setCurrentSeries} />
    </div>
  );

  return (
    <div class="app-shell">
      <main
        class="app-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SeriesPage
          seriesId={currentSeries}
          categoryId={currentCategory}
          onFerrariTap={handleFerrariTap}
        />
      </main>
      <CategoryNav
        seriesId={currentSeries}
        activeCategory={currentCategory}
        onSelect={selectCategory}
      />
      <SeriesNav activeSeries={currentSeries} onSelect={setCurrentSeries} />
      {showVersion && (
        <div
          style={{
            position: "fixed",
            bottom: "4px",
            right: "4px",
            fontSize: "0.65rem",
            color: "var(--text)",
            opacity: 0.6,
            zIndex: 9999,
          }}
        >
          v{VERSION}
        </div>
      )}
    </div>
  );

  {
    showVersion && (
      <div
        style={{
          position: "fixed",
          bottom: "4px",
          right: "4px",
          fontSize: "0.65rem",
          color: "var(--text)",
          opacity: 0.6,
          zIndex: 9999,
        }}
      >
        v{VERSION}
      </div>
    );
  }
}
