// Single source of truth for which series exist, and what to label
// their second-standings category (Teams vs Manufacturers).
// Every series exposes the same 4 categories so the secondary nav
// bar never has to change shape.

// Formula E's season runs December through June, spanning two calendar
// years, so during the off-season it should read e.g. "2025/2026" rather
// than a single year. Everyone else just uses the current year.
export function getSeasonLabel(seriesId, date = new Date()) {
  const year = date.getFullYear();
  if (seriesId === 'fe') {
    const month = date.getMonth(); // 0 = Jan, 11 = Dec
    return month === 11 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  }
  return String(year);
}

export const SERIES = [
  {
    id: "f1",
    label: "Formula 1",
    teamsLabel: "Teams",
    officialName: "FIA Formula 1",
  },
  {
    id: "f2",
    label: "Formula 2",
    teamsLabel: "Teams",
    officialName: "FIA Formula 2 Championship",
  },
  {
    id: "f3",
    label: "Formula 3",
    teamsLabel: "Teams",
    officialName: "FIA Formula 3 Championship",
  },
  {
    id: "indycar",
    label: "IndyCar",
    teamsLabel: "Manufacturers",
    officialName: "NTT IndyCar Series",
  },
  {
    id: "fe",
    label: "Formula E",
    teamsLabel: "Teams", // includes manufacturer sub-section within this view
    officialName: "ABB FIA Formula E World Championship",
  },
];

export const CATEGORIES = [
  { id: "news", label: "News" },
  { id: "next-race", label: "Next Race" },
  { id: "drivers", label: "Drivers" },
  { id: "teams", label: "Teams" }, // label overridden per-series via teamsLabel
];

export function getSeries(id) {
  return SERIES.find((s) => s.id === id);
}
