/**
 * Theme and mode for the whole page: data-theme and data-mode on <html>, as an app would set them.
 * The choice is remembered in localStorage; an inline script in the layout applies it before the
 * first paint, so the page never flashes the default theme.
 */
import { Button } from '@beastui/preact';
import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const themes = ['core', 'tool', 'playful'] as const;
const modes = ['system', 'light', 'dark'] as const;
type Theme = (typeof themes)[number];
type Mode = (typeof modes)[number];

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
    apply(t, m);
  };

  return (
    <div class="docs-switch">
      <div class="docs-switch__group" role="group" aria-label="Theme">
        {themes.map((t) => (
          <Button variant={t === theme ? 'primary' : 'quiet'} aria-pressed={t === theme} onClick={() => pick({ theme: t })}>
            {t[0]?.toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>
      <div class="docs-switch__group" role="group" aria-label="Mode">
        {modes.map((m) => (
          <Button variant={m === mode ? 'primary' : 'quiet'} aria-pressed={m === mode} onClick={() => pick({ mode: m })}>
            {m[0]?.toUpperCase() + m.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
}
