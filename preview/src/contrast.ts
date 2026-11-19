// Contrast ratios computed from the live tokens, so the numbers always match what is on screen.
// Colours are resolved by the browser (light-dark(), color-mix(), alpha) and painted on a canvas:
// an alpha border is composited over its real surface before it is measured (research §3).

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 1;
const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

function resolve(token: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function paint(fg: string, bg: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

// WCAG 2.x relative luminance: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function ratio(fgToken: string, bgToken: string): number {
  const bg = resolve(bgToken);
  const fg = paint(resolve(fgToken), bg);
  const back = paint(bg, 'white');
  const [l1, l2] = [luminance(fg), luminance(back)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

export type Pair = { fg: string; bg: string; min: number; what: string };

export const PAIRS: Pair[] = [
  { fg: '--text', bg: '--surface', min: 4.5, what: 'Text' },
  { fg: '--text-muted', bg: '--surface', min: 4.5, what: 'Muted text' },
  { fg: '--text-muted', bg: '--surface-raised', min: 4.5, what: 'Muted text on raised' },
  { fg: '--on-ink', bg: '--text', min: 4.5, what: 'Primary button label' },
  { fg: '--danger-text', bg: '--surface', min: 4.5, what: 'Danger text' },
  { fg: '--danger-text', bg: '--surface-raised', min: 4.5, what: 'Danger text on raised' },
  { fg: '--border-strong', bg: '--surface', min: 3, what: 'Interactive border' },
  { fg: '--border-strong', bg: '--surface-raised', min: 3, what: 'Interactive border on raised' },
  { fg: '--focus', bg: '--surface', min: 3, what: 'Focus ring' },
  { fg: '--meter-fill', bg: '--surface', min: 3, what: 'Meter fill' },
  { fg: '--progress-fill', bg: '--surface-raised', min: 3, what: 'Progress fill on raised' },
  { fg: '--tab-mark', bg: '--surface', min: 3, what: 'Selected tab mark' },
  { fg: '--play-red', bg: '--surface-card', min: 4.5, what: 'Red card rank on card' },
  { fg: '--text', bg: '--surface-card', min: 4.5, what: 'Black card rank on card' },
  { fg: '--border-subtle', bg: '--surface', min: 0, what: 'Structural line (decorative)' },
  { fg: '--surface-raised', bg: '--surface', min: 0, what: 'Raised vs ground (never the only cue)' },
];
