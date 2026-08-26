import { useState, useEffect } from "preact/hooks";
import { getDataFile } from "../api/dataFile.js";
import { StandingsList } from "./StandingsList.jsx";
import { NextRaceCard } from "./NextRaceCard.jsx";
import { NewsList } from "./NewsList.jsx";

export function FileBackedCategory({ seriesId, categoryId }) {
  const [data, setData] = useState(undefined); // undefined = loading
  const [openArticle, setOpenArticle] = useState(null);

  useEffect(() => {
    setData(undefined);
    getDataFile(`${seriesId}-${categoryId}.json`).then(setData);
  }, [seriesId, categoryId]);

  if (data === undefined) return <p class="status-text">Loading…</p>;

  if (data === null) {
    return (
      <p class="status-text">
        Data coming soon — this feed hasn't been scraped yet.
      </p>
    );
  }

  if (categoryId === "drivers" || categoryId === "teams") {
    return <StandingsList items={data} />;
  }
  
  if (categoryId === "next-race") {
    return <NextRaceCard race={data} />;
  }

    if (categoryId === 'news') {
    return (
      <>
        <NewsList items={data} onSelect={setOpenArticle} />
        {openArticle && (
          <ArticleReader
            article={openArticle}
            onClose={() => setOpenArticle(null)}
          />
        )}
      </>
    );
  }

  return null;
}
