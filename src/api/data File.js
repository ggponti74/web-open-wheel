export async function getDataFile(path) {
  const res = await fetch(`/data/${path}`);
  if (!res.ok) return null; // file doesn't exist yet — scraper hasn't run
  return res.json();
}