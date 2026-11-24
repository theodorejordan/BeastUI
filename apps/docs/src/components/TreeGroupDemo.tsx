/** Parents as groups: a menu whose headings only hold pages. */
import { Tree, type TreeItem } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const MENU: TreeItem[] = [
  {
    id: 'start',
    label: 'Getting started',
    group: true,
    children: [
      { id: 'install', label: 'Install' },
      { id: 'themes', label: 'Themes' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    group: true,
    children: [
      { id: 'button', label: 'Button' },
      { id: 'table', label: 'Table' },
      { id: 'tree', label: 'Tree' },
    ],
  },
];

export default function TreeGroupDemo(): JSX.Element {
  const [selected, setSelected] = useState<string | null>('tree');
  return (
    <div class="docs-panel">
      <Tree
        items={MENU}
        aria-label="Menu"
        selected={selected}
        onSelect={setSelected}
        defaultOpen={['start', 'components']}
      />
    </div>
  );
}
