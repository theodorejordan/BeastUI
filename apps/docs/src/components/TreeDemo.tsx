/** The Preact component, live: folders and subfolders, with the files in each. */
import { Tree, type TreeItem } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const FOLDERS: TreeItem[] = [
  {
    id: 'projects',
    label: 'Projects',
    count: 128,
    children: [
      { id: 'projects/website', label: 'Website', count: 54 },
      {
        id: 'projects/app',
        label: 'Mobile app',
        count: 61,
        children: [
          { id: 'projects/app/design', label: 'Design', count: 23 },
          { id: 'projects/app/research', label: 'Research', count: 38 },
        ],
      },
      { id: 'projects/archive', label: 'Archive', count: 13 },
    ],
  },
  { id: 'finance', label: 'Finance', count: 87, children: [{ id: 'finance/invoices', label: 'Invoices', count: 19 }] },
  { id: 'meetings', label: 'Meeting notes from the quarterly planning sessions', count: 42 },
  { id: 'recent', label: 'Recent', count: 9 },
];

export default function TreeDemo(): JSX.Element {
  const [selected, setSelected] = useState<string | null>('projects/website');
  return (
    <div class="docs-panel">
      <Tree
        items={FOLDERS}
        aria-label="Folders"
        selected={selected}
        onSelect={setSelected}
        defaultOpen={['projects', 'projects/app']}
      />
    </div>
  );
}
