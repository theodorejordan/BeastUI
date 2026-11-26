/**
 * Veil: a region of the page is busy; the rest stays usable. Not a dialog.
 * The look lives in @beastui/css (components/veil.css): class="b-veil-region" and its parts.
 *
 * What this file adds to the markup:
 * - inert and aria-busy on the content while busy, set in a layout effect so we can look at the focus first;
 * - if the focus was in the content, it lands on the card (else inert drops it on <body>), and
 *   goes back to where it was once the region is free again;
 * - a live region always in the page, saying the title only (MDN, status role).
 */
import type { ComponentChildren, HTMLAttributes, JSX } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

type NativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'className' | 'title' | 'content'>;

export type VeilProps = NativeProps & {
  /** The region is busy: its content is veiled and out of reach. The app owns this state. */
  busy: boolean;
  /** What is happening, such as "Exporting". Shown on the card and told to a screen reader. */
  title: ComponentChildren;
  /** Under the title: a progress bar, a line or two of detail. */
  content?: ComponentChildren;
  /** At the bottom of the card, such as a Cancel button. */
  actions?: ComponentChildren;
  /** Show the veil one beat late, so a job that ends at once never flashes. */
  delay?: boolean;
  /** The region itself: what gets veiled. */
  children?: ComponentChildren;
  class?: string;
  className?: string;
};

export function Veil({
  busy,
  title,
  content,
  actions,
  delay = false,
  children,
  class: extraClass,
  className,
  ...rest
}: VeilProps): JSX.Element {
  const inner = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  // Where the focus was when the region went inert, to give it back after.
  const before = useRef<HTMLElement | null>(null);

  // Layout effect: before paint, and before the browser can move the focus on its own.
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    if (busy) {
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && el.contains(active);
      el.inert = true;
      if (inside) {
        before.current = active;
        card.current?.focus();
      }
    } else {
      el.inert = false;
      const back = before.current;
      before.current = null;
      // Only if nothing else took the focus meanwhile (it fell to <body> with the card).
      const lost = document.activeElement === null || document.activeElement === document.body;
      if (back?.isConnected && lost) back.focus();
    }
  }, [busy]);

  return (
    <div {...rest} class={['b-veil-region', extraClass, className].filter(Boolean).join(' ')}>
      {/* aria-busy here, not on the region: a busy element may silence the live regions inside it. */}
      <div class="b-veil-content" ref={inner} aria-busy={busy || undefined}>
        {children}
      </div>
      {busy && (
        <div class="b-veil" data-delay={delay || undefined}>
          <div class="b-veil-frame">
            <div class="b-veil-card" ref={card} tabindex={-1}>
              <p class="b-veil-title">{title}</p>
              {content != null && <div class="b-veil-body">{content}</div>}
              {actions != null && <div class="b-veil-actions">{actions}</div>}
            </div>
          </div>
        </div>
      )}
      <p class="b-veil-status" role="status">
        {busy ? title : null}
      </p>
    </div>
  );
}
