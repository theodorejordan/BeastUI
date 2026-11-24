/** The Preact building blocks, live: sortable columns, row selection (boxes, Shift, Cmd). */
import { Button, Checkbox, SortHeader, compareText, useSelection, useSort } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

type Entry = { id: string; name: string; tag: string; kb: number; modified: string; unsynced?: boolean };

const FILES: Entry[] = [
  { id: '1', name: 'Budget 2027.xlsx', tag: 'Finance', kb: 84, modified: '2026-11-02' },
  { id: '2', name: 'Brand guidelines (final, approved by legal).pdf', tag: 'Design', kb: 12480, modified: '2026-10-28', unsynced: true },
  { id: '3', name: 'Contract.pdf', tag: 'Legal', kb: 312, modified: '2026-11-18' },
  { id: '4', name: 'Logo.svg', tag: 'Design', kb: 9, modified: '2026-09-14' },
  { id: '5', name: 'Invoices.csv', tag: 'Finance', kb: 41, modified: '2026-11-20' },
  { id: '6', name: 'Team photo.jpg', tag: 'Photos', kb: 3620, modified: '2026-08-30' },
  { id: '7', name: 'Notes.md', tag: 'Drafts', kb: 3, modified: '2026-11-23' },
];

const size = (kb: number): string => (kb < 1000 ? `${kb} kB` : `${(kb / 1000).toFixed(1)} MB`);
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const date = (iso: string): string => day.format(new Date(iso));

export default function TableDemo(): JSX.Element {
  const sort = useSort(FILES, {
    name: (a, b) => compareText(a.name, b.name),
    size: (a, b) => a.kb - b.kb,
    modified: (a, b) => a.modified.localeCompare(b.modified),
  });
  const selection = useSelection(sort.rows.map((t) => t.id));
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', display: 'grid', gap: 'var(--b-gap-field)' }}>
      <p style={{ margin: 0, color: 'var(--b-color-text-muted)' }} aria-live="polite">
        {selection.selected.size} of {FILES.length} selected
        {opened && <> · opened {opened}</>}
      </p>
      <table class="b-table">
        <thead>
          <tr>
            <th data-select>
              <Checkbox aria-label="Select all files" {...selection.allCheckbox()} />
            </th>
            <SortHeader column="name" sort={sort} grow>
              Name
            </SortHeader>
            <th>Tags</th>
            <SortHeader column="size" sort={sort} align="end">
              Size
            </SortHeader>
            <SortHeader column="modified" sort={sort} align="center">
              Modified
            </SortHeader>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sort.rows.map((t) => (
            <tr key={t.id} {...selection.row(t.id, () => setOpened(t.name))}>
              <td data-select>
                <Checkbox aria-label={`Select ${t.name}`} {...selection.checkbox(t.id)} />
              </td>
              <td data-grow class="b-keep" title={t.name}>
                {t.name}
              </td>
              <td>
                <span class="b-tag">{t.tag}</span>
                {t.unsynced && (
                  <span class="b-tag" data-variant="warn">
                    Unsynced
                  </span>
                )}
              </td>
              <td data-align="end">{size(t.kb)}</td>
              <td data-align="center">{date(t.modified)}</td>
              <td>
                <Button variant="secondary">Share</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
