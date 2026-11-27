/** A file's actions: a menu on a button, and a line that says what was chosen. */
import { Button, Menu, MenuGroup, MenuItem, MenuSeparator } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const icon = (d: string): JSX.Element => (
  <svg class="b-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function MenuDemo(): JSX.Element {
  const [last, setLast] = useState('Nothing yet');
  return (
    <div style={{ display: 'flex', gap: 'var(--b-space-4)', alignItems: 'center' }}>
      <Menu trigger={<Button>Actions</Button>}>
        <MenuGroup label="Budget 2027.xlsx">
          <MenuItem onSelect={() => setLast('Rename')}>{icon('M4 20h4L19 9l-4-4L4 16v4M13 7l4 4')}Rename</MenuItem>
          <MenuItem onSelect={() => setLast('Duplicate')}>{icon('M8 8h12v12H8zM4 16V4h12')}Duplicate</MenuItem>
          <MenuItem disabled>{icon('M4 7h6l2 2h8v10H4z')}Move to…</MenuItem>
          <MenuItem onSelect={() => setLast('Download')}>{icon('M12 4v11M7 10l5 5 5-5M5 20h14')}Download</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem tone="danger" onSelect={() => setLast('Delete')}>
          {icon('M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13')}Delete
        </MenuItem>
      </Menu>
      <span style={{ color: 'var(--b-color-text-muted)' }} aria-live="polite">
        Last action: {last}
      </span>
    </div>
  );
}
