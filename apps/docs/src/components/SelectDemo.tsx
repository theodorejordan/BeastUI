/** The Preact component, live: a format with a placeholder and an error until one is chosen. */
import { Field, Select } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

type Format = 'pdf' | 'csv' | 'xlsx';

export default function SelectDemo(): JSX.Element {
  const [format, setFormat] = useState<Format | ''>('');
  return (
    <div style={{ width: 'min(100%, 280px)' }}>
      <Field
        label="Export as"
        hint={format === 'csv' ? 'CSV keeps only the first sheet.' : undefined}
        error={format === '' ? 'Choose a format to export.' : undefined}
      >
        <Select
          value={format}
          onChange={setFormat}
          placeholder="Choose a format"
          options={[
            { value: 'pdf', label: 'PDF' },
            { value: 'csv', label: 'CSV' },
            { value: 'xlsx', label: 'Excel workbook' },
          ]}
        />
      </Field>
    </div>
  );
}
