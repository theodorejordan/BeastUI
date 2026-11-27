/**
 * Select: a native <select> in BeastUI's frame, to pick one value in a form.
 * The browser keeps the keys, the value and the announcement. In a Field, it takes the label,
 * hint and error wiring, like Input. The open list is drawn as the menu where the browser lets
 * CSS draw it (appearance: base-select, Chrome and Edge 135+); elsewhere it is the system's.
 *
 * Select or Menu? A select holds a value the form sends; a menu runs an action.
 */
import type { ComponentChildren, JSX, SelectHTMLAttributes } from 'preact';
import { useContext, useId } from 'preact/hooks';
import { FieldContext, join } from './field';

export type SelectOption<T extends string> = {
  value: T;
  /** Plain text: a native option shows text only. */
  label: string;
  disabled?: boolean;
};

type NativeProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'class' | 'className' | 'role' | 'value' | 'onChange' | 'children' | 'multiple' | 'size'
>;

export type SelectProps<T extends string> = NativeProps & {
  options: readonly SelectOption<T>[];
  /** The chosen value. Empty (`''`) shows the placeholder. */
  value: T | '';
  onChange: (value: T) => void;
  /** Shown in the box while nothing is chosen ("Choose a format"). Never in the open list. */
  placeholder?: string;
  /** Extra classes, on the frame (`b-select`). */
  class?: string;
  className?: string;
  /** Not used: options come from `options`. */
  children?: ComponentChildren;
};

export function Select<T extends string>({
  options,
  value,
  onChange,
  placeholder,
  id,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  class: extraClass,
  className,
  ...rest
}: SelectProps<T>): JSX.Element {
  const field = useContext(FieldContext);
  const ownId = useId();
  return (
    <span class={join('b-select', extraClass, className)}>
      <select
        {...rest}
        id={id ?? field?.id ?? ownId}
        value={value}
        aria-describedby={join(field?.describedBy, describedBy as string | undefined)}
        aria-invalid={field?.invalid ? 'true' : invalid}
        onChange={(event) => onChange(event.currentTarget.value as T)}
      >
        {placeholder !== undefined && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  );
}
