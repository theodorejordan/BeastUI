/**
 * Switch: a native checkbox with role="switch", for a setting that applies at once.
 * The browser keeps the keyboard and the form value; the role makes a screen reader say
 * "on" / "off" (APG Switch pattern). Same API as Checkbox, minus "some": a switch is on or off.
 *
 * With children, it sits in its label (the whole row is the target). Without, it must be named
 * with aria-label.
 */
import type { ComponentChildren, InputHTMLAttributes, JSX } from 'preact';
import { join } from './field';

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'class' | 'className' | 'type' | 'role' | 'onChange' | 'children'>;

type CommonProps = NativeProps & {
  checked: boolean;
  /** The new state, applied at once by the app. */
  onChange: (checked: boolean) => void;
  /** Extra classes, on the label when there is one, else on the switch. */
  class?: string;
  className?: string;
};

type LabelledProps = { children: ComponentChildren };
type StandaloneProps = { children?: undefined; 'aria-label': string };

export type SwitchProps = CommonProps & (LabelledProps | StandaloneProps);

export function Switch({ checked, onChange, children, class: extraClass, className, ...rest }: SwitchProps): JSX.Element {
  const extra = join(extraClass, className);
  const control = (
    <input
      {...rest}
      type="checkbox"
      role="switch"
      class={children ? 'b-switch' : join('b-switch', extra)}
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  );

  if (!children) return control;
  return (
    <label class={join('b-check', extra)}>
      {control}
      <span>{children}</span>
    </label>
  );
}
