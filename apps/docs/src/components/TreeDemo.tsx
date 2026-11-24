/** The Preact component, live: crates and subcrates, as in Masterz. */
import { Tree, type TreeItem } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const CRATES: TreeItem[] = [
  {
    id: 'house',
    label: 'House',
    count: 128,
    children: [
      { id: 'house/deep', label: 'Deep', count: 54 },
      {
        id: 'house/tech',
        label: 'Tech',
        count: 61,
        children: [
          { id: 'house/tech/peak', label: 'Peak time', count: 23 },
          { id: 'house/tech/warmup', label: 'Warm-up', count: 38 },
        ],
      },
      { id: 'house/classics', label: 'Classics', count: 13 },
    ],
  },
  { id: 'techno', label: 'Techno', count: 87, children: [{ id: 'techno/dub', label: 'Dub techno', count: 19 }] },
  { id: 'disco', label: 'Disco and boogie edits for the end of the night', count: 42 },
  { id: 'new', label: 'New this week', count: 9 },
];

export default function TreeDemo(): JSX.Element {
  const [selected, setSelected] = useState<string | null>('house/deep');
  return (
    <div class="docs-panel">
      <Tree
        items={CRATES}
        aria-label="Crates"
        selected={selected}
        onSelect={setSelected}
        defaultOpen={['house', 'house/tech']}
      />
    </div>
  );
}
