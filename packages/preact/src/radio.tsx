/**
 * RadioGroup: one choice out of a few, all visible, in a form.
 * Native radios sharing one name (made here with useId): the browser gives one tab stop, the
 * arrow keys and "2 of 3". A <fieldset> named by its <legend> names the group (MDN, <fieldset>);
 * `disabled` on it turns every option off at once.
 *
 * Radio group or segmented control? Both pick one of a few. The segmented control is a compact
 * switch of view or mode, applied at once; the radio group sits in a form, can carry longer
 * labels and waits for Save.
 */
import type { ComponentChildren, JSX } from 'preact';
import { useId } from 'preact/hooks';
import { join } from './field';

export type RadioOption<T extends string> = {
  value: T;
  /** What the option says. It may wrap; the circle stays on the first line. */
  label: ComponentChildren;
  disabled?: boolean;
};

export type RadioGroupProps<T extends string> = {
  /** What is chosen. Visible, as the group's legend. */
  label: ComponentChildren;
  options: readonly RadioOption<T>[];
  /** The chosen value; none is chosen while it matches no option. */
  value: T | undefined;
  onChange: (value: T) => void;
  /** `vertical` by default; `horizontal` for two or three short options. */
  orientation?: 'vertical' | 'horizontal';
  /** Turns the whole group off. */
  disabled?: boolean;
  /** The form field name. A unique one is made when omitted. */
  name?: string;
  /** Extra classes, after `b-radio-group`. */
  class?: string;
  className?: string;
};

export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  orientation = 'vertical',
  disabled,
  name,
  class: extraClass,
  className,
}: RadioGroupProps<T>): JSX.Element {
  const ownName = useId();
  return (
    <fieldset
      class={join('b-radio-group', extraClass, className)}
      data-orientation={orientation === 'horizontal' ? 'horizontal' : undefined}
      disabled={disabled}
    >
      <legend class="b-field__label">{label}</legend>
      {options.map((option) => (
        <label key={option.value} class="b-check">
          <input
            class="b-radio"
            type="radio"
            name={name ?? ownName}
            value={option.value}
            checked={option.value === value}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
