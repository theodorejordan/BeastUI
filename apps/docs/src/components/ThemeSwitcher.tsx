/**
 * Theme and mode for the whole page: data-theme and data-mode on <html>, as an app would set them.
 * The choice is remembered in localStorage; an inline script in the layout applies it before the
 * first paint, so the page never flashes the default theme.
 */
import { SegmentedControl } from '@beastui/preact';
import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const themes = ['core', 'tool', 'playful'] as const;
const modes = ['system', 'light', 'dark'] as const;
type Theme = (typeof themes)[number];
type Mode = (typeof modes)[number];

const title = (word: string): string => word[0]!.toUpperCase() + word.slice(1);
// Each theme's name in its own voice: tool writes its interface lowercase (owner review).
const themeOptions = themes.map((value) => ({ value, label: value === 'tool' ? value : title(value) }));
const modeOptions = modes.map((value) => ({ value, label: title(value) }));

// Also read by the inline script in layouts/Docs.astro.
const STORAGE_KEY = 'beastui-docs';

function apply(theme: Theme, mode: Mode): void {
  const root = document.documentElement;
  if (theme === 'core') delete root.dataset.theme;
  else root.dataset.theme = theme;
  if (mode === 'system') delete root.dataset.mode;
  else root.dataset.mode = mode;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, mode }));
  } catch {
    // Storage can be blocked (private window): the choice just won't be remembered.
  }
}

export default function ThemeSwitcher(): JSX.Element {
  const [theme, setTheme] = useState<Theme>('core');
  const [mode, setMode] = useState<Mode>('system');

  // The server renders the defaults; the real choice is on <html>, set by the inline script.
  useEffect(() => {
    const root = document.documentElement;
    setTheme((root.dataset.theme as Theme | undefined) ?? 'core');
    setMode((root.dataset.mode as Mode | undefined) ?? 'system');
  }, []);

  const pick = (next: { theme?: Theme; mode?: Mode }): void => {
    const t = next.theme ?? theme;
    const m = next.mode ?? mode;
    setTheme(t);
    setMode(m);
    // A crossfade instead of a jump: the page's sizes change with the theme (owner). The
    // browser shoots the old page, applies the new theme, and fades one into the other (MDN,
    // View Transition API). No fade without the API, or when the visitor asks for less motion.
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !still) document.startViewTransition(() => apply(t, m));
    else apply(t, m);
  };

  return (
    <div class="docs-switch">
      <SegmentedControl label="Theme" options={themeOptions} value={theme} onChange={(t) => pick({ theme: t })} />
      <SegmentedControl label="Mode" options={modeOptions} value={mode} onChange={(m) => pick({ mode: m })} />
    </div>
  );
}
