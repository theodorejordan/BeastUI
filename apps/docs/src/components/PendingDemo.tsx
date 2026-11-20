/** A save that takes two seconds: the button stays focused and refuses clicks meanwhile. */
import { Button } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

export default function PendingDemo(): JSX.Element {
  const [saving, setSaving] = useState(false);
  const [saves, setSaves] = useState(0);
  const save = (): void => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaves((n) => n + 1);
    }, 2000);
  };
  return (
    <>
      <Button variant="primary" pending={saving} onClick={save}>
        Save
      </Button>
      <span class="docs-lead" aria-live="polite">
        {saves === 1 ? 'Saved once.' : saves > 1 ? `Saved ${saves} times.` : ''}
      </span>
    </>
  );
}
