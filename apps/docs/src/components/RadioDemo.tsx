/** The Preact component, live: an export format, and a horizontal choice of page size. */
import { RadioGroup } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

type Format = 'pdf' | 'csv' | 'xlsx';
type Size = 'a4' | 'letter';

export default function RadioDemo(): JSX.Element {
  const [format, setFormat] = useState<Format>('pdf');
  const [size, setSize] = useState<Size>('a4');
  return (
    <div style={{ display: 'grid', gap: 'var(--b-gap-group)' }}>
      <RadioGroup
        label="Export as"
        value={format}
        onChange={setFormat}
        options={[
          { value: 'pdf', label: 'PDF, one page per sheet' },
          { value: 'csv', label: 'CSV, the first sheet only' },
          { value: 'xlsx', label: 'Excel workbook' },
        ]}
      />
      <RadioGroup
        label="Page size"
        orientation="horizontal"
        value={size}
        onChange={setSize}
        options={[
          { value: 'a4', label: 'A4' },
          { value: 'letter', label: 'Letter' },
        ]}
      />
    </div>
  );
}
