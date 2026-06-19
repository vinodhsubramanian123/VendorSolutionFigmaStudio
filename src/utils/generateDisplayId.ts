export function generateDisplayId(year = 2026): string {
  const num = (crypto.getRandomValues(new Uint32Array(1))[0] % 90000) + 10000;
  return `UCID-${year}-${num}`;
}
