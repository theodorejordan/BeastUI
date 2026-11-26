/**
 * The theme goes on the demos only (data-theme on each .docs-demo__stage): the docs' frame stays
 * in core, so the reading doesn't move and only what is compared changes (owner, 2026-11-26).
 * The mode is the page's: data-mode on <html>, as an app would set it.
 * The choice is remembered in localStorage; inline scripts in the layout apply it before the
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

// Also read by the inline scripts in layouts/Docs.astro, which use the same stage selector.
const STORAGE_KEY = 'beastui-docs';
const STAGES = '.docs-demo__stage';

function saved(): { theme?: Theme; mode?: Mode } {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? {};
  } catch {
    return {};
  }
}

function apply(theme: Theme, mode: Mode): void {
  const root = document.documentElement;
  // Core is the frame's own theme: a stage in core just takes it from the page.
  for (const stage of document.querySelectorAll<HTMLElement>(STAGES)) {
    if (theme === 'core') delete stage.dataset.theme;
    else stage.dataset.theme = theme;
  }
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

  // The server renders the defaults; the real choice is in storage (a page may have no demo).
  useEffect(() => {
    const choice = saved();
    setTheme(choice.theme && themes.includes(choice.theme) ? choice.theme : 'core');
    setMode(choice.mode && modes.includes(choice.mode) ? choice.mode : 'system');
  }, []);

  const pick = (next: { theme?: Theme; mode?: Mode }): void => {
    const t = next.theme ?? theme;
    const m = next.mode ?? mode;
    setTheme(t);
    setMode(m);
    // A crossfade instead of a jump: the demos' sizes change with the theme (owner). The
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
