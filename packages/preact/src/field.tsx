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
import { createContext, type ComponentChildren, type InputHTMLAttributes, type JSX } from 'preact';
import { useContext, useId } from 'preact/hooks';

type FieldWiring = { id: string; describedBy: string | undefined; invalid: boolean };

const FieldContext = createContext<FieldWiring | null>(null);

const join = (...parts: (string | false | null | undefined)[]): string | undefined =>
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
  const wiring: FieldWiring = { id, describedBy: join(hintId, errorId), invalid: Boolean(error) };

  return (
    <div class={join('b-field', extraClass, className)}>
      <label class="b-field__label" for={id}>
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
  /** A unit shown inside the box, after the value: "dB", "LUFS". Read after the label. */
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
