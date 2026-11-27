/**
 * Field and Input: a labelled control with an optional hint and error.
 * The look lives in @beastui/css (components/field.css); these components only do the wiring a
 * screen reader needs and that is easy to get wrong by hand:
 * - the label points at the input (`for` / `id`),
 * - the input points at its unit, hint and error (`aria-describedby`), read after the label,
 * - an error marks the input invalid (`aria-invalid`).
 *
 * Field shares its ids with the Input inside it through a context, so the app writes
 * <Field label="…"><Input /></Field> and never handles an id.
 */
import { createContext, type ComponentChildren, type Context, type InputHTMLAttributes, type JSX, type TextareaHTMLAttributes } from 'preact';
import { useContext, useId } from 'preact/hooks';

/** labelId: for a control whose name must also carry its value (MultiSelect's button). */
type FieldWiring = { id: string; labelId: string; describedBy: string | undefined; invalid: boolean };

/** Shared with Select and Textarea: any control in a Field takes its ids from here. */
export const FieldContext: Context<FieldWiring | null> = createContext<FieldWiring | null>(null);

export const join = (...parts: (string | false | null | undefined)[]): string | undefined =>
  parts.filter(Boolean).join(' ') || undefined;

export type FieldProps = {
  /** What to enter. Visible: a placeholder is not a label (it goes away as you type). */
  label: ComponentChildren;
  /** Help that stays under the control: a range, a format, an example. */
  hint?: ComponentChildren;
  /** What is wrong with the value. Its presence marks the input invalid. */
  error?: ComponentChildren;
  /** The control, usually one <Input />. */
  children: ComponentChildren;
  /** Extra classes, after `b-field`. */
  class?: string;
  className?: string;
};

export function Field({ label, hint, error, children, class: extraClass, className }: FieldProps): JSX.Element {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const wiring: FieldWiring = { id, labelId: `${id}-label`, describedBy: join(hintId, errorId), invalid: Boolean(error) };

  return (
    <div class={join('b-field', extraClass, className)}>
      <label class="b-field__label" id={`${id}-label`} for={id}>
        {label}
      </label>
      <FieldContext.Provider value={wiring}>{children}</FieldContext.Provider>
      {hint && (
        <p class="b-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p class="b-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'class' | 'className' | 'role' | 'type'>;

/** The types that are a box you type into. A checkbox is <Checkbox />. */
export type InputType = 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';

export type InputProps = NativeInputProps & {
  /** `text` by default. */
  type?: InputType;
  /** A unit shown inside the box, after the value: "MB", "kHz". Read after the label. */
  unit?: string;
  /** Extra classes, on the box (`b-input`). */
  class?: string;
  className?: string;
};

export function Input({
  unit,
  id,
  type = 'text',
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  class: extraClass,
  className,
  ...rest
}: InputProps): JSX.Element {
  const field = useContext(FieldContext);
  const ownId = useId();
  const inputId = id ?? field?.id ?? ownId;
  const unitId = unit ? `${inputId}-unit` : undefined;
  const boxClass = join('b-input', extraClass, className);

  const input = (
    <input
      {...rest}
      // Each InputType is valid; TypeScript just can't match a union value to Preact's per-type
      // union of <input> props, so it is narrowed to one member.
      type={type as 'text'}
      id={inputId}
      class={unit ? undefined : boxClass}
      aria-describedby={join(unitId, field?.describedBy, describedBy as string | undefined)}
      aria-invalid={field?.invalid ? 'true' : invalid}
    />
  );

  if (!unit) return input;
  return (
    <span class={boxClass}>
      {input}
      <span class="b-input__unit" id={unitId}>
        {unit}
      </span>
    </span>
  );
}

type NativeTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'class' | 'className' | 'role'>;

export type TextareaProps = NativeTextareaProps & {
  /** Extra classes, after `b-input`. */
  class?: string;
  className?: string;
};

/** A longer text: the input's box, three lines high, growing with its text (where supported). */
export function Textarea({
  id,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  class: extraClass,
  className,
  ...rest
}: TextareaProps): JSX.Element {
  const field = useContext(FieldContext);
  const ownId = useId();
  return (
    <textarea
      {...rest}
      id={id ?? field?.id ?? ownId}
      class={join('b-input', extraClass, className)}
      aria-describedby={join(field?.describedBy, describedBy as string | undefined)}
      aria-invalid={field?.invalid ? 'true' : invalid}
    />
  );
}
