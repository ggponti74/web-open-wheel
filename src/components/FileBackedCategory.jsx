import { useState, useEffect } from "preact/hooks";
import { getDataFile } from "../api/dataFile.js";
import { StandingsList } from "./StandingsList.jsx";
import { NextRaceCard } from "./NextRaceCard.jsx";
import { NewsList } from "./NewsList.jsx";
import { ArticleReader } from "./ArticleReader.jsx";

export function FileBackedCategory({ seriesId, categoryId }) {
  const [data, setData] = useState(undefined); // undefined = loading
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    setData(undefined);
    setOpenIndex(null);
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

  if (categoryId === "news") {
    return (
      <>
        <NewsList items={data} onSelect={setOpenIndex} />
        {openIndex !== null && (
          <ArticleReader
            article={data[openIndex]}
            onClose={() => setOpenIndex(null)}
            onPrev={openIndex > 0 ? () => setOpenIndex(openIndex - 1) : null}
            onNext={
              openIndex < data.length - 1
                ? () => setOpenIndex(openIndex + 1)
                : null
            }
          />
        )}
      </>
    );
  }

  return null;
}
