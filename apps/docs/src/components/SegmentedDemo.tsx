/** The Preact component, live: the outline slides to the picked option. */
import { SegmentedControl } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

const OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date added' },
  { value: 'loudness', label: 'Loudness' },
] as const;

export default function SegmentedDemo(): JSX.Element {
  const [sort, setSort] = useState<(typeof OPTIONS)[number]['value']>('name');
  return <SegmentedControl label="Sort tracks" options={OPTIONS} value={sort} onChange={setSort} />;
}
