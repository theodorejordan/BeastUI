/** The Preact component, live: a "select all" over three rows, with the mixed state. */
import { Checkbox } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const FILES = ['Report.pdf', 'Budget.xlsx', 'Slides.pdf'];

export default function CheckboxDemo(): JSX.Element {
  const [picked, setPicked] = useState<Set<string>>(new Set(['Budget.xlsx']));
  const toggle = (file: string, on: boolean): void => {
    const next = new Set(picked);
    if (on) next.add(file);
    else next.delete(file);
    setPicked(next);
  };
  return (
    <div style={{ display: 'grid', gap: 'var(--b-gap-choice)' }}>
      <Checkbox
        checked={picked.size === FILES.length}
        indeterminate={picked.size > 0 && picked.size < FILES.length}
        onChange={(all) => setPicked(new Set(all ? FILES : []))}
      >
        All files
      </Checkbox>
      <div style={{ display: 'grid', gap: 'var(--b-gap-choice)', paddingInlineStart: 'var(--b-space-6)' }}>
        {FILES.map((file) => (
          <Checkbox key={file} checked={picked.has(file)} onChange={(on) => toggle(file, on)}>
            {file}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
