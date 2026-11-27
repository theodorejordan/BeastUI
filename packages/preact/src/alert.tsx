/**
 * Alert: a message that stays in the page until its cause goes away.
 * The look lives in @beastui/css (components/alert.css): class="b-alert" and its parts.
 *
 * What this file adds to the markup:
 * - the tone's icon by default (information, error, warning), so every app says it the same way;
 * - a Dismiss button with a name, when the app passes onDismiss. The app owns the state: it
 *   removes the alert, and remembers that the user dismissed it if it should stay gone.
 *
 * No role by default: most alerts are read in order with the page. The app passes
 * role="status" (or "alert" for an error after an action) when it appears later.
 */
import type { ComponentChildren, HTMLAttributes, JSX } from 'preact';
import { Button } from './button';

export type AlertTone = 'neutral' | 'danger' | 'warning';

type NativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'className' | 'title' | 'icon'>;

export type AlertProps = NativeProps & {
  /** neutral (default) informs; danger says something failed; warning says something needs care. */
  tone?: AlertTone;
  /** One short line above the text, in medium weight. */
  title?: ComponentChildren;
  /** Replaces the tone's icon. false: no icon. */
  icon?: ComponentChildren | false;
  /** Under the text, at the end: one or two buttons. */
  actions?: ComponentChildren;
  /** Shows a Dismiss button; the app removes the alert here. */
  onDismiss?: () => void;
  /** The Dismiss button's name, for a screen reader. */
  dismissLabel?: string;
  /** The message. */
  children?: ComponentChildren;
  class?: string;
  className?: string;
};

const glyph = (d: JSX.Element): JSX.Element => (
  <svg class="b-icon" viewBox="0 0 24 24" aria-hidden="true">
    {d}
  </svg>
);

// Functions, not shared elements: two alerts of one tone each get their own icon.
const ICONS: Record<AlertTone, () => JSX.Element> = {
  neutral: () => glyph(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>,
  ),
  danger: () => glyph(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </>,
  ),
  warning: () => glyph(<path d="M12 9v4M12 17h.01M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />),
};

const CloseIcon = (): JSX.Element => glyph(<path d="M6 6l12 12M18 6L6 18" />);

export function Alert({
  tone = 'neutral',
  title,
  icon,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  children,
  class: extraClass,
  className,
  ...rest
}: AlertProps): JSX.Element {
  const shown = icon === undefined ? ICONS[tone]() : icon;
  return (
    <div
      {...rest}
      class={['b-alert', extraClass, className].filter(Boolean).join(' ')}
      data-tone={tone === 'neutral' ? undefined : tone}
    >
      {shown !== false && <span class="b-alert__icon">{shown}</span>}
      <div class="b-alert__content">
        {title !== undefined && <p class="b-alert__title">{title}</p>}
        {children !== undefined && <div class="b-alert__description">{children}</div>}
        {actions !== undefined && <div class="b-alert__actions">{actions}</div>}
      </div>
      {onDismiss && (
        <Button class="b-alert__close" variant="quiet" iconOnly aria-label={dismissLabel} onClick={onDismiss}>
          <CloseIcon />
        </Button>
      )}
    </div>
  );
}
