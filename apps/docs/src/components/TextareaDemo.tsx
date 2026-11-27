/** The Preact component, live: a note with a character count as its hint. */
import { Field, Textarea } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const MAX = 280;

export default function TextareaDemo(): JSX.Element {
  const [note, setNote] = useState('');
  const over = note.length > MAX;
  return (
    <div style={{ width: 'min(100%, 400px)' }}>
      <Field
        label="Note for the people you share with"
        hint={over ? undefined : `${note.length} / ${MAX}`}
        error={over ? `${note.length} / ${MAX}: shorten it a little.` : undefined}
      >
        <Textarea value={note} onInput={(e) => setNote(e.currentTarget.value)} />
      </Field>
    </div>
  );
}
