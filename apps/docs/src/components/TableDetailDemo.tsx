/** A detail row, live: a click on a row (or Enter on its name) opens its details under it. */
import { Checkbox, useDetail, useSelection } from '@beastui/preact';
import type { JSX } from 'preact';
import { Fragment } from 'preact';

type Entry = { id: string; name: string; size: string; modified: string; kind: string; folder: string; owner: string };

const FILES: Entry[] = [
  { id: '1', name: 'Budget 2027.xlsx', size: '84 kB', modified: '2 Nov', kind: 'Spreadsheet', folder: 'Finance', owner: 'Sam' },
  { id: '2', name: 'Contract.pdf', size: '312 kB', modified: '18 Nov', kind: 'PDF document', folder: 'Legal', owner: 'Alex' },
  { id: '3', name: 'Team photo.jpg', size: '3.6 MB', modified: '30 Aug', kind: 'JPEG image', folder: 'Photos', owner: 'Kim' },
];

const label = { margin: 0, color: 'var(--b-color-text-muted)' };

export default function TableDetailDemo(): JSX.Element {
  const selection = useSelection(FILES.map((f) => f.id));
  // One open at a time: opening a row closes the other. { multiple: true } keeps several.
  const detail = useDetail({ initial: ['2'] });

  return (
    <div style={{ width: '100%', display: 'grid', gap: 'var(--b-gap-field)' }}>
      <p style={{ margin: 0, color: 'var(--b-color-text-muted)' }} aria-live="polite">
        {selection.selected.size} of {FILES.length} selected
      </p>
      <table class="b-table">
        <thead>
          <tr>
            <th data-select>
              <Checkbox aria-label="Select all files" {...selection.allCheckbox()} />
            </th>
            <th data-grow>Name</th>
            <th data-align="end">Size</th>
            <th data-align="center">Modified</th>
          </tr>
        </thead>
        <tbody>
          {FILES.map((f) => {
            return (
              <Fragment key={f.id}>
                <tr {...detail.row(f.id)} {...selection.row(f.id, () => detail.toggle(f.id))}>
                  <td data-select>
                    <Checkbox aria-label={`Select ${f.name}`} {...selection.checkbox(f.id)} />
                  </td>
                  <td data-grow title={f.name}>
                    {/* No handler: its click, mouse or Enter, is the row's. */}
                    <button class="b-table-open" {...detail.button(f.id)}>
                      {f.name}
                    </button>
                  </td>
                  <td data-align="end">{f.size}</td>
                  <td data-align="center">{f.modified}</td>
                </tr>
                {detail.isOpen(f.id) && (
                  <tr {...detail.detail(f.id)}>
                    <td colSpan={4}>
                      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--b-space-1) var(--b-space-4)', margin: 0 }}>
                        <dt style={label}>Kind</dt>
                        <dd style={{ margin: 0 }}>{f.kind}</dd>
                        <dt style={label}>Folder</dt>
                        <dd style={{ margin: 0 }}>{f.folder}</dd>
                        <dt style={label}>Owner</dt>
                        <dd style={{ margin: 0 }}>{f.owner}</dd>
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
