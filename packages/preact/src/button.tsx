/**
 * Button: a native <button> with BeastUI's classes and two safeguards.
 * The look lives in @beastui/css (components/button.css); this file only maps props to that
 * contract: class="b-btn", data-variant, data-icon, aria-disabled.
 *
 * The app imports the CSS once (`@beastui/css/beastui.css` or the per-component files). This
 * module imports no CSS, so it works with a <link> to a CDN and never ships the CSS twice.
 */
import type { ButtonHTMLAttributes, JSX } from 'preact';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

type NativeProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'class' | 'className' | 'aria-disabled'>;

type CommonProps = NativeProps & {
  /** How loud the button is. `secondary` (an outline) by default; one `primary` per view. */
  variant?: ButtonVariant;
  /**
   * An action is running. A spinner takes the place of the content (same width, same variant,
   * same accessible name) and the button refuses clicks, but keeps the focus: a native
   * `disabled` would drop it, and a keyboard user would lose their place.
   * Use `disabled` instead when the action is not available at all.
   */
  pending?: boolean;
  /** Extra classes, after `b-btn`. Both spellings work, as everywhere in Preact. */
  class?: string;
  className?: string;
};

/** A button that shows only an icon must still have a name a screen reader can say. */
type IconOnlyProps = { iconOnly: true; 'aria-label': string };
type LabelledProps = { iconOnly?: false };

export type ButtonProps = CommonProps & (IconOnlyProps | LabelledProps);

// While pending, a click does nothing. preventDefault also stops a submit button's form.
const refuse = (event: Event): void => event.preventDefault();

export function Button({
  variant = 'secondary',
  iconOnly = false,
  pending = false,
  // The native default is "submit": a button inside a <form> would send it by surprise.
  type = 'button',
  class: extraClass,
  className,
  onClick,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      {...rest}
      type={type}
      class={['b-btn', extraClass, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-icon={iconOnly ? '' : undefined}
      data-pending={pending ? '' : undefined}
      aria-disabled={pending ? 'true' : undefined}
      onClick={pending ? refuse : onClick}
    />
  );
}
