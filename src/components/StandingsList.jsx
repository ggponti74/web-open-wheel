export function StandingsList({ items }) {
  return (
    <ol class="standings-list">
      {items.map((item) => (
        <li key={item.name} class="standings-list__item">
          <span class="standings-list__pos">{item.position}</span>
          <span class="standings-list__name">{item.name}</span>
          <span class="standings-list__points">{item.points}</span>
        </li>
      ))}
    </ol>
  );
}
