/** The Preact component, live: export formats in two groups, with a hint that counts them. */
import { Field, MultiSelect } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

type Format = 'pdf' | 'docx' | 'csv' | 'xlsx' | 'json';
type Type = 'image' | 'video' | 'audio';

export default function MultiSelectDemo(): JSX.Element {
  const [formats, setFormats] = useState<Format[]>(['pdf', 'csv', 'xlsx']);
  return (
    <div style={{ width: 'min(100%, 280px)' }}>
      <Field
        label="Export as"
        hint={formats.length ? `${formats.length} files per export.` : 'Choose at least one format.'}
      >
        <MultiSelect
          value={formats}
          onChange={setFormats}
          placeholder="Choose formats"
          options={[
            {
              label: 'Documents',
              options: [
                { value: 'pdf', label: 'PDF' },
                { value: 'docx', label: 'Word document' },
              ],
            },
            {
              label: 'Data',
              options: [
                { value: 'csv', label: 'CSV' },
                { value: 'xlsx', label: 'Excel workbook' },
                { value: 'json', label: 'JSON', disabled: true },
              ],
            },
          ]}
        />
      </Field>
    </div>
  );
}

/** The error state with the real component: it clears as soon as a type is chosen. */
export function MultiSelectErrorDemo(): JSX.Element {
  const [types, setTypes] = useState<Type[]>([]);
  return (
    <div style={{ width: 'min(100%, 280px)' }}>
      <Field label="File types" error={types.length === 0 ? 'Choose at least one file type.' : undefined}>
        <MultiSelect
          value={types}
          onChange={setTypes}
          placeholder="Choose file types"
          options={[
            { value: 'image', label: 'Images' },
            { value: 'video', label: 'Videos' },
            { value: 'audio', label: 'Audio' },
          ]}
        />
      </Field>
    </div>
  );
}
