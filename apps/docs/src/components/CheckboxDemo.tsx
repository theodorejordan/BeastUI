/** The Preact component, live: a "select all" over three rows, with the mixed state. */
import { Checkbox } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const TRACKS = ['Intro.wav', 'Night drive.wav', 'Outro.wav'];

export default function CheckboxDemo(): JSX.Element {
  const [picked, setPicked] = useState<Set<string>>(new Set(['Night drive.wav']));
  const toggle = (track: string, on: boolean): void => {
    const next = new Set(picked);
    if (on) next.add(track);
    else next.delete(track);
    setPicked(next);
  };
  return (
    <div style={{ display: 'grid', gap: 'var(--b-gap-choice)' }}>
      <Checkbox
        checked={picked.size === TRACKS.length}
        indeterminate={picked.size > 0 && picked.size < TRACKS.length}
        onChange={(all) => setPicked(new Set(all ? TRACKS : []))}
      >
        All tracks
      </Checkbox>
      <div style={{ display: 'grid', gap: 'var(--b-gap-choice)', paddingInlineStart: 'var(--b-space-6)' }}>
        {TRACKS.map((track) => (
          <Checkbox key={track} checked={picked.has(track)} onChange={(on) => toggle(track, on)}>
            {track}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
