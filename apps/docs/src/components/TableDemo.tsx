/** The Preact building blocks, live: sortable columns, row selection (boxes, Shift, Cmd). */
import { Button, Checkbox, SortHeader, compareText, useSelection, useSort } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

type Track = { id: string; title: string; genre: string; bpm: number; seconds: number; clipping?: boolean };

const TRACKS: Track[] = [
  { id: '1', title: 'Intro.wav', genre: 'Ambient', bpm: 90, seconds: 72 },
  { id: '2', title: 'Night drive (extended club mix).wav', genre: 'House', bpm: 124, seconds: 341, clipping: true },
  { id: '3', title: 'Fog.wav', genre: 'Edits', bpm: 118, seconds: 298 },
  { id: '4', title: 'Signal.wav', genre: 'House', bpm: 126, seconds: 412 },
  { id: '5', title: 'Static.wav', genre: 'Disco', bpm: 112, seconds: 265 },
  { id: '6', title: 'Last call.wav', genre: 'Edits', bpm: 120, seconds: 388 },
  { id: '7', title: 'Outro.wav', genre: 'Ambient', bpm: 84, seconds: 95 },
];

const duration = (s: number): string => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function TableDemo(): JSX.Element {
  const sort = useSort(TRACKS, {
    title: (a, b) => compareText(a.title, b.title),
    genre: (a, b) => compareText(a.genre, b.genre),
    bpm: (a, b) => a.bpm - b.bpm,
    length: (a, b) => a.seconds - b.seconds,
  });
  const selection = useSelection(sort.rows.map((t) => t.id));
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', display: 'grid', gap: 'var(--b-gap-field)' }}>
      <p style={{ margin: 0, color: 'var(--b-color-text-muted)' }} aria-live="polite">
        {selection.selected.size} of {TRACKS.length} selected
        {opened && <> · opened {opened}</>}
      </p>
      <table class="b-table">
        <thead>
          <tr>
            <th data-select>
              <Checkbox aria-label="Select all tracks" {...selection.allCheckbox()} />
            </th>
            <SortHeader column="title" sort={sort} grow>
              Title
            </SortHeader>
            <th>Status</th>
            <SortHeader column="genre" sort={sort}>
              Genre
            </SortHeader>
            <SortHeader column="bpm" sort={sort} align="center">
              BPM
            </SortHeader>
            <SortHeader column="length" sort={sort} align="center">
              Length
            </SortHeader>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sort.rows.map((t) => (
            <tr key={t.id} {...selection.row(t.id, () => setOpened(t.title))}>
              <td data-select>
                <Checkbox aria-label={`Select ${t.title}`} {...selection.checkbox(t.id)} />
              </td>
              <td data-grow class="b-keep" title={t.title}>
                {t.title}
              </td>
              <td>
                {t.clipping && (
                  <span class="b-tag" data-variant="warn">
                    Clipping
                  </span>
                )}
              </td>
              <td>
                <span class="b-tag">{t.genre}</span>
              </td>
              <td data-align="center">{t.bpm}</td>
              <td data-align="center">{duration(t.seconds)}</td>
              <td>
                <Button variant="secondary">Replace</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
