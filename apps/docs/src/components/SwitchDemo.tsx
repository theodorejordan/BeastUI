/** The Preact component, live: two settings that apply at once. */
import { Switch } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

export default function SwitchDemo(): JSX.Element {
  const [hidden, setHidden] = useState(false);
  const [mobile, setMobile] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 'var(--b-gap-choice)' }}>
      <Switch checked={hidden} onChange={setHidden}>
        Show hidden files
      </Switch>
      <Switch checked={mobile} onChange={setMobile}>
        Sync over mobile data
      </Switch>
    </div>
  );
}
