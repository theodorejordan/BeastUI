/** A file's details in a drawer: longer content beside the list it came from. */
import { Button, Drawer } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const details: [string, string][] = [
  ['Kind', 'PDF document'],
  ['Size', '2.4 MB'],
  ['Folder', 'Projects/Website'],
  ['Modified', 'Yesterday, 18:02'],
  ['Shared with', '3 people'],
];

export default function DrawerDemo(): JSX.Element {
  // The side is kept after closing, so a drawer slides out the way it came in.
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'start' | 'end'>('end');
  const show = (from: 'start' | 'end'): void => {
    setSide(from);
    setOpen(true);
  };
  return (
    <>
      <Button onClick={() => show('end')}>Details</Button>
      <Button variant="quiet" onClick={() => show('start')}>
        From the start edge
      </Button>
      <Drawer
        open={open}
        side={side}
        onClose={() => setOpen(false)}
        title="Contract.pdf"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Close</Button>
            <Button variant="primary">Download</Button>
          </>
        }
      >
        <dl class="docs-props">
          {details.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Drawer>
    </>
  );
}
