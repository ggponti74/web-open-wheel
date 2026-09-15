// src/components/VenueMap.jsx
import { useState, useEffect } from "preact/hooks";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function VenueMap({ city, country }) {
  const [iso, setIso] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/venue-geo-cache.json`)
      .then((res) => res.json())
      .then((cache) => {
        const entry = cache[`${city}, ${country}`];
        if (entry) setIso(entry.iso);
      })
      .catch(() => {});
  }, [city, country]);

  if (!iso) return null; // not geocoded/rendered yet — fail quietly rather than show a broken image

  const slug = slugify(city);
  const base = `${import.meta.env.BASE_URL}images/maps/${iso}-${slug}`;

  return (
    <picture class="venue-map">
      <source
        srcSet={`${base}-dark.jpg`}
        media="(prefers-color-scheme: dark)"
      />
      <img
        src={`${base}-light.jpg`}
        alt={`Map showing ${city}, ${country}`}
        loading="lazy"
      />
    </picture>
  );
}
