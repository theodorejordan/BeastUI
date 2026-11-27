/** A filter: a small form in a popover, closed by its own Apply button (controlled). */
import { Button, Checkbox, Popover } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const KINDS = ['Documents', 'Spreadsheets', 'Images'] as const;
type Kind = (typeof KINDS)[number];

export default function PopoverDemo(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<Kind[]>([...KINDS]);
  const [draft, setDraft] = useState<Kind[]>(applied);

  const toggle = (kind: Kind, on: boolean): void =>
    setDraft(on ? KINDS.filter((k) => k === kind || draft.includes(k)) : draft.filter((k) => k !== kind));

  return (
    <div style={{ display: 'flex', gap: 'var(--b-space-4)', alignItems: 'center' }}>
      <Popover
        trigger={<Button>Filter</Button>}
        label="Filter files"
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(applied);
          setOpen(next);
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--b-gap-choice)' }}>
          {KINDS.map((kind) => (
            <Checkbox key={kind} checked={draft.includes(kind)} onChange={(on) => toggle(kind, on)}>
              {kind}
            </Checkbox>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--b-gap-inline)', marginBlockStart: 'var(--b-inset-control)' }}>
          <Button variant="quiet" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setApplied(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </Popover>
      <span style={{ color: 'var(--b-color-text-muted)' }} aria-live="polite">
        Showing: {applied.length === KINDS.length ? 'all files' : applied.join(', ') || 'nothing'}
      </span>
    </div>
  );
}
