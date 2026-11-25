/** Rename a file in a modal: a short task with one field, then back to the page. */
import { Button, Field, Input, Modal } from '@beastui/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

export default function ModalDemo(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Contract.pdf');
  const [draft, setDraft] = useState(name);
  const show = (): void => {
    setDraft(name);
    setOpen(true);
  };
  const rename = (e: Event): void => {
    e.preventDefault();
    setName(draft.trim() || name);
    setOpen(false);
  };
  return (
    <>
      <Button onClick={show}>Rename {name}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Rename file"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="rename-file">
              Rename
            </Button>
          </>
        }
      >
        <form id="rename-file" onSubmit={rename}>
          <Field label="Name">
            <Input value={draft} autofocus onInput={(e) => setDraft(e.currentTarget.value)} />
          </Field>
        </form>
      </Modal>
    </>
  );
}
