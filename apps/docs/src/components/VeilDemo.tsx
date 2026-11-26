/** Export a folder: the file list is veiled while the job runs, the button above stays usable. */
import { Button, Progress, Veil } from '@beastui/preact';
import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const FILES = ['Budget 2027.xlsx', 'Contract.pdf', 'Logo.svg', 'Invoices.csv', 'Team photo.jpg', 'Notes.md', 'Brand guidelines.pdf'];

export default function VeilDemo(): JSX.Element {
  // null = no job; otherwise how many files are done.
  const [done, setDone] = useState<number | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const busy = done !== null;

  useEffect(() => {
    if (done === null) return;
    if (done === FILES.length) {
      setDone(null);
      setLast('Exported 7 files');
      return;
    }
    const t = setTimeout(() => setDone(done + 1), 700);
    return () => clearTimeout(t);
  }, [done]);

  const start = (): void => {
    setLast(null);
    setDone(0);
  };
  const cancel = (): void => {
    setDone(null);
    setLast('Export cancelled');
  };

  return (
    <div style={{ width: '100%', display: 'grid', gap: 'var(--b-gap-field)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--b-gap-inline)' }}>
        <Button onClick={busy ? cancel : start}>{busy ? 'Cancel export' : 'Export folder'}</Button>
        {last && <span style={{ color: 'var(--b-color-text-muted)' }}>{last}</span>}
      </div>
      <Veil
        busy={busy}
        delay
        title="Exporting"
        content={
          <>
            <Progress aria-label="Exporting" value={done ?? 0} max={FILES.length} valueText={`${done} of ${FILES.length} files`} />
            <p>
              {done} of {FILES.length} · {FILES[done ?? 0]}
            </p>
          </>
        }
        actions={<Button onClick={cancel}>Cancel</Button>}
      >
        <table class="b-table">
          <thead>
            <tr>
              <th data-grow>Name</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {FILES.map((name) => (
              <tr key={name}>
                <td data-grow>{name}</td>
                <td>Alex</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Veil>
    </div>
  );
}
