export const clamp = value => Math.max(0, Math.min(1, value));
export const smooth = value => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ease = value => 1 - Math.pow(1 - clamp(value), 3);

export function fadeFor(page, y, time) {
  if (page.reveal === false) return 1;
  const firstY = page.revealTop ?? Math.min(...page.blocks.map(b => b.y));
  const lastY = page.revealBottom ?? (page.footer ? (page.zoom === 1 ? 1670 : 1880) : Math.max(...page.blocks.map(b => b.y)));
  const delay = (page.revealOffset ?? 0.4) + (y - firstY) / Math.max(1, lastY - firstY) * (page.revealSpan ?? 4.1);
  const value = clamp((time - delay) / 0.55);
  return value * value * (3 - 2 * value);
}
