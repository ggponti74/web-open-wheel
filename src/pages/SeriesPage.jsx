import { getSeries } from "../series.js";
import { DriverStandings } from "../components/DriverStandings.jsx";
import { TeamStandings } from "../components/TeamStandings.jsx";
import { NextRace } from "../components/NextRace.jsx";
import { FileBackedCategory } from "../components/FileBackedCategory.jsx";

export function SeriesPage({ seriesId, categoryId }) {
  const series = getSeries(seriesId);
  const categoryLabel =
    series.id === "teams" ? series.teamsLabel : series.label;

  if (seriesId === "f1") {
    if (categoryId === "next-race")
      //return <NextRace />;
      return (
        <div class="series-page">
          <NextRace />
        </div>
      );

    if (categoryId === "drivers")
      //return <DriverStandings />;
      return (
        <div class="series-page">
          <DriverStandings />
        </div>
      );

    if (categoryId === "teams")
      //return <TeamStandings />;
      return (
        <div class="series-page">
          <TeamStandings />
        </div>
      );

    // f1 news also goes through the file-backed path below
  }

  return (
    <div class="series-page">
      <FileBackedCategory
        key={`${seriesId}-${categoryId}`}
        seriesId={seriesId}
        categoryId={categoryId}
      />
    </div>
  );
}
