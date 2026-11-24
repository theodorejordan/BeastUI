/** The Preact components, live: an upload limit, and a timeout with a range check. */
import { Field, Input } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

export default function FieldDemo(): JSX.Element {
  const [timeout, setTimeout] = useState(15);
  const outOfRange = timeout < 5 || timeout > 60;
  return (
    <div style={{ display: 'grid', gap: 'var(--b-gap-group)' }}>
      <Field label="Upload limit" hint="Larger files are refused.">
        <Input type="number" step={5} defaultValue={25} unit="MB" />
      </Field>
      <Field label="Sign out after this long without activity" error={outOfRange ? 'Between 5 and 60 min.' : undefined}>
        <Input
          type="number"
          step={5}
          value={timeout}
          unit="min"
          onInput={(e) => setTimeout(Number(e.currentTarget.value))}
        />
      </Field>
    </div>
  );
}
