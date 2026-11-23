/** The Preact components, live: Masterz's loudness settings, with a range check. */
import { Field, Input } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

export default function FieldDemo(): JSX.Element {
  const [budget, setBudget] = useState(4);
  const outOfRange = budget < 0 || budget > 8;
  return (
    <div style={{ display: 'grid', gap: 'var(--b-gap-group)' }}>
      <Field label="Target loudness" hint="Streaming services play at −14.">
        <Input type="number" step={0.5} defaultValue={-14} unit="LUFS" />
      </Field>
      <Field label="Most limiting when bringing a track up" error={outOfRange ? 'Between 0 and 8 dB.' : undefined}>
        <Input
          type="number"
          step={0.5}
          value={budget}
          unit="dB"
          onInput={(e) => setBudget(Number(e.currentTarget.value))}
        />
      </Field>
    </div>
  );
}
