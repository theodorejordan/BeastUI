/**
 * Progress: a div with role="progressbar", and the ARIA a screen reader needs (MDN,
 * progressbar role). Not a native <progress>: its fill is styled through browser-specific
 * pseudo-elements, and its unknown-length state can't be animated the same way everywhere.
 *
 * The CSS (components/progress.css) reads the state from the ARIA: no aria-valuenow = unknown
 * length. This file maps props to that contract and sets --b-progress-value (0 to 100).
 */
import type { HTMLAttributes, JSX } from 'preact';

type NativeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'class' | 'className' | 'role' | 'children' | 'aria-valuenow' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuetext'
>;

type CommonProps = NativeProps & {
  /** How far, from 0 to `max`. Leave it out when the length is unknown: the bar sways. */
  value?: number;
  /** The value of a finished job. 100 by default; the number of items is often clearer. */
  max?: number;
  /** What a screen reader says instead of a percent, such as "3 of 12 files". */
  valueText?: string;
  /** `thin` (2px) beside other content, such as a sidebar row; 4px by default. */
  size?: 'regular' | 'thin';
  class?: string;
  className?: string;
};

/** A bar must say what is progressing: by its own name, or by a visible title's id. */
type NamedProps = { 'aria-label': string } | { 'aria-labelledby': string };

export type ProgressProps = CommonProps & NamedProps;

export function Progress({
  value,
  max = 100,
  valueText,
  size = 'regular',
  class: extraClass,
  className,
  style,
  ...rest
}: ProgressProps): JSX.Element {
  const known = value != null && Number.isFinite(value);
  const top = max > 0 ? max : 100;
  // Out of range would be a lie to a screen reader: 0 to max, nothing else.
  const now = known ? Math.min(Math.max(value, 0), top) : undefined;
  const percent = now != null ? (now / top) * 100 : undefined;
  // The app's own style is kept, whether an object or a string.
  const fill =
    typeof style === 'string'
      ? percent != null ? `${style};--b-progress-value:${percent}` : style
      : { ...(style as Record<string, string | number> | undefined), ...(percent != null && { '--b-progress-value': percent }) };

  return (
    <div
      {...rest}
      class={['b-progress', extraClass, className].filter(Boolean).join(' ')}
      role="progressbar"
      data-size={size === 'thin' ? 'thin' : undefined}
      aria-valuemin={0}
      aria-valuemax={top}
      aria-valuenow={now}
      aria-valuetext={now != null ? valueText : undefined}
      style={fill}
    />
  );
}
