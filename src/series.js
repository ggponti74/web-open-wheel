// Single source of truth for which series exist, and what to label
// their second-standings category (Teams vs Manufacturers).
// Every series exposes the same 4 categories so the secondary nav
// bar never has to change shape.

export const SERIES = [
  {
    id: 'f1',
    label: 'F1',
    teamsLabel: 'Teams',
  },
  {
    id: 'f2',
    label: 'F2',
    teamsLabel: 'Teams',
  },
  {
    id: 'f3',
    label: 'F3',
    teamsLabel: 'Teams',
  },
  {
    id: 'indycar',
    label: 'IndyCar',
    teamsLabel: 'Manufacturers',
  },
  {
    id: 'formulae',
    label: 'Formula E',
    teamsLabel: 'Teams', // includes manufacturer sub-section within this view
  },
];

export const CATEGORIES = [
  { id: 'drivers', label: 'Drivers' },
  { id: 'teams', label: 'Teams' }, // label overridden per-series via teamsLabel
  { id: 'next-race', label: 'Next Race' },
  { id: 'news', label: 'News' },
];

export function getSeries(id) {
  return SERIES.find((s) => s.id === id);
}
