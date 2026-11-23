/*
 * Every colour pair BeastUI relies on must meet its WCAG ratio, in every theme and mode
 * (decision 0009). Text needs 4.5:1; borders, focus rings and other UI shapes need 3:1
 * (WCAG 2.2, SC 1.4.3 and 1.4.11). Ported from the Phase 3 preview's live contrast panel.
 *
 * Disabled controls are not listed: WCAG exempts inactive components from contrast.
 */
import '../src/beastui.css';
import { describe, expect, it } from 'vitest';

type Pair = { what: string; fg: string; bg: string; min: number };

const v = (token: string): string => `var(--b-color-${token})`;

const PAIRS: Pair[] = [
  { what: 'Text', fg: v('text'), bg: v('surface'), min: 4.5 },
  { what: 'Text on a card', fg: v('text'), bg: v('surface-card'), min: 4.5 },
  { what: 'Muted text', fg: v('text-muted'), bg: v('surface'), min: 4.5 },
  { what: 'Muted text on raised', fg: v('text-muted'), bg: v('surface-raised'), min: 4.5 },
  { what: 'Primary button label', fg: v('on-ink'), bg: v('text'), min: 4.5 },
  {
    what: 'Primary button label, hovered',
    fg: v('on-ink'),
    bg: `color-mix(in srgb, ${v('text')} 84%, ${v('surface')})`,
    min: 4.5,
  },
  { what: 'Danger text', fg: v('danger'), bg: v('surface'), min: 4.5 },
  { what: 'Danger text on raised', fg: v('danger'), bg: v('surface-raised'), min: 4.5 },
  {
    what: 'Danger button label, hovered',
    fg: v('danger'),
    bg: `color-mix(in srgb, ${v('danger')} 10%, ${v('surface-raised')})`,
    min: 4.5,
  },
  { what: 'Interactive border', fg: v('border-strong'), bg: v('surface'), min: 3 },
  { what: 'Interactive border on raised', fg: v('border-strong'), bg: v('surface-raised'), min: 3 },
  { what: 'Field border on a card ground', fg: v('border-strong'), bg: v('surface-card'), min: 3 },
  { what: 'Field text and placeholder', fg: v('text-muted'), bg: v('surface-card'), min: 4.5 },
  { what: 'Field error', fg: v('danger'), bg: v('surface-card'), min: 4.5 },
  { what: 'Checkbox mark', fg: v('on-ink'), bg: v('text'), min: 3 },
  // Tags: ink on a tint, over each ground a row can have.
  ...(['surface', 'surface-raised', 'surface-card'] as const).map((ground) => ({
    what: `Tag on ${ground}`,
    fg: v('text'),
    bg: `color-mix(in srgb, ${v('text')} 8%, ${v(ground)})`,
    min: 4.5,
  })),
  { what: 'Warn tag label', fg: v('on-warning'), bg: v('warning'), min: 4.5 },
  { what: 'Focus ring', fg: v('focus'), bg: v('surface'), min: 3 },
  { what: 'Red card rank on a card', fg: v('play-red'), bg: v('surface-card'), min: 4.5 },
];

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 1;
const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

/** The browser resolves the value (light-dark(), color-mix(), alpha) to a plain colour. */
function resolve(value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** Paints fg over bg on a 1px canvas, so a translucent colour is measured as it is seen. */
function paint(fg: string, bg: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

// WCAG 2.x relative luminance: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg: string, bg: string): number {
  // The page ground is the surface: a translucent background sits on it.
  const ground = paint(resolve(v('surface')), 'white');
  const back = paint(resolve(bg), `rgb(${ground.join(',')})`);
  const front = paint(resolve(fg), `rgb(${back.join(',')})`);
  const [l1, l2] = [luminance(front), luminance(back)].sort((a, b) => b - a) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

const THEMES = ['core', 'tool', 'playful'] as const;
const MODES = ['light', 'dark'] as const;

describe.each(THEMES.flatMap((theme) => MODES.map((mode) => ({ theme, mode }))))('$theme, $mode', ({ theme, mode }) => {
  it.each(PAIRS)('$what reaches $min:1', ({ fg, bg, min }) => {
    const root = document.documentElement;
    if (theme === 'core') delete root.dataset.theme;
    else root.dataset.theme = theme;
    root.dataset.mode = mode;
    const value = ratio(fg, bg);
    expect(value, `${value.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
  });
});
