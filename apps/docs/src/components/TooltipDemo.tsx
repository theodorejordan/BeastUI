/** A file toolbar: icon buttons named by their tooltip, and a file name with a description. */
import { Button, Tooltip } from '@beastui/preact';
import type { JSX } from 'preact';

const icon = (d: string): JSX.Element => (
  <svg class="b-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function TooltipDemo(): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 'var(--b-space-2)', alignItems: 'center' }}>
      <Tooltip content="Download" mode="label">
        <Button iconOnly aria-label="Download">
          {icon('M12 4v11M7 10l5 5 5-5M5 20h14')}
        </Button>
      </Tooltip>
      <Tooltip content="Share" mode="label">
        <Button iconOnly aria-label="Share">
          {icon('M12 15V4M7 9l5-5 5 5M5 14v6h14v-6')}
        </Button>
      </Tooltip>
      <Tooltip content="Last synced 2 minutes ago, by the desktop app">
        <Button variant="quiet">Budget 2027.xlsx</Button>
      </Tooltip>
    </div>
  );
}
