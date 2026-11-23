/**
 * Checkbox: a native checkbox with BeastUI's classes, plus the one thing markup can't say.
 * "Some but not all" (indeterminate) is a DOM property with no HTML attribute, so only script
 * can set it (MDN, <input type="checkbox">, indeterminate). The browser then matches
 * :indeterminate and announces "mixed".
 *
 * With children, the box sits in its label (the whole row is the target). Without, it stands
 * alone (a table cell) and must be named with aria-label.
 */
import type { ComponentChildren, InputHTMLAttributes, JSX } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'class' | 'className' | 'type' | 'role' | 'onChange' | 'children'>;

type CommonProps = NativeProps & {
  checked: boolean;
  /** Some but not all: a "select all" box over a partly selected list. Shows a dash. */
  indeterminate?: boolean;
  /** The new state. A click on an indeterminate box checks it. */
  onChange: (checked: boolean) => void;
  /** Extra classes, on the label when there is one, else on the box. */
  class?: string;
  className?: string;
};

/** A box without a visible label must still have a name a screen reader can say. */
type LabelledProps = { children: ComponentChildren };
type StandaloneProps = { children?: undefined; 'aria-label': string };

export type CheckboxProps = CommonProps & (LabelledProps | StandaloneProps);

export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  children,
  class: extraClass,
  className,
  ...rest
}: CheckboxProps): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);
  // After every render: a click clears the property in the DOM, the prop puts it back.
  useLayoutEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  });

  const extra = [extraClass, className].filter(Boolean).join(' ');
  const box = (
    <input
      {...rest}
      ref={ref}
      type="checkbox"
      class={children ? 'b-checkbox' : ['b-checkbox', extra].filter(Boolean).join(' ')}
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  );

  if (!children) return box;
  return (
    <label class={['b-check', extra].filter(Boolean).join(' ')}>
      {box}
      <span>{children}</span>
    </label>
  );
}
