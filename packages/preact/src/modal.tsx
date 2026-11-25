/**
 * Modal and Drawer: a native <dialog> driven by the app's state.
 * The look lives in @beastui/css (components/modal.css): class="b-modal" (+ "b-drawer").
 *
 * The browser does most of the work: showModal() puts the dialog in the top layer, makes the
 * page inert, keeps the focus inside and closes on Escape (MDN, <dialog>). What is left here:
 * - `open` is state, but a <dialog> opens and closes by method calls: an effect bridges the two;
 * - a click on the backdrop closes it: <dialog closedby> does that, but not in Safari 17.5
 *   (ADR 0005);
 * - the focus goes back to what opened it: native, with a safety net for Safari's edge cases.
 *
 * Both share one hook (useModalDialog) and one frame: a drawer is a modal on an edge.
 */
import type { ComponentChildren, DialogHTMLAttributes, JSX } from 'preact';
import { useEffect, useId, useLayoutEffect, useRef } from 'preact/hooks';
import { Button } from './button';

type NativeProps = Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  'class' | 'className' | 'open' | 'onClose' | 'title' | 'closedby'
>;

export type ModalProps = NativeProps & {
  /** Shown or not. The app owns this state. */
  open: boolean;
  /**
   * The user asked to close: Escape, a click on the backdrop or the close button. Set `open`
   * to false here. Escape has already closed the dialog by then: the browser does it.
   */
  onClose: () => void;
  /** The heading, and the dialog's accessible name. */
  title: ComponentChildren;
  /** Actions at the bottom (Cancel, Save), kept in view while the body scrolls. */
  footer?: ComponentChildren;
  /** The close button's name, for a screen reader. */
  closeLabel?: string;
  children?: ComponentChildren;
  class?: string;
  className?: string;
};

export type DrawerProps = ModalProps & {
  /** The edge it comes from. `end` (the right, in a left-to-right page) by default. */
  side?: 'start' | 'end';
};

/** The state ↔ showModal() bridge, the backdrop click and the focus return. */
function useModalDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  // Latest props for the native event handlers, without re-binding them.
  const latest = useRef({ open, onClose });
  latest.current = { open, onClose };
  // Did the press start on the backdrop? A text selection dragged out of the box ends with a
  // click on the dialog too, outside its box: that one must not close it.
  const pressedOutside = useRef(false);

  // Layout effect: open before the browser paints, so there is no flash of the page alone.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // 'close' fires however it closed: our close() above, Escape, a <form method="dialog">.
    const onNativeClose = (): void => {
      // Safety net: if the browser left the focus nowhere, give it back to the opener.
      const lost = document.activeElement === null || document.activeElement === document.body;
      if (lost && opener.current?.isConnected) opener.current.focus();
      opener.current = null;
      // Closed by the browser while the app still says open: tell the app.
      if (latest.current.open) latest.current.onClose();
    };
    dialog.addEventListener('close', onNativeClose);
    return () => {
      dialog.removeEventListener('close', onNativeClose);
      // Unmounted while open: the page must not stay inert.
      if (dialog.open) dialog.close();
    };
  }, []);

  const outside = (dialog: HTMLDialogElement, e: MouseEvent): boolean => {
    if (e.target !== dialog) return false;
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  return {
    ref,
    onPointerDown: (e: PointerEvent) => {
      pressedOutside.current = ref.current !== null && outside(ref.current, e);
    },
    onClick: (e: MouseEvent) => {
      if (pressedOutside.current && ref.current && outside(ref.current, e)) latest.current.onClose();
      pressedOutside.current = false;
    },
  };
}

const CloseIcon = (): JSX.Element => (
  <svg class="b-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

function Frame({
  open,
  onClose,
  title,
  footer,
  closeLabel = 'Close',
  children,
  classes,
  ...rest
}: Omit<ModalProps, 'class' | 'className'> & { classes: string }): JSX.Element {
  const dialog = useModalDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog {...rest} {...dialog} class={classes} aria-labelledby={rest['aria-labelledby'] ?? titleId}>
      <header class="b-modal-head">
        <h2 class="b-modal-title" id={titleId}>
          {title}
        </h2>
        <Button variant="quiet" iconOnly aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </Button>
      </header>
      <div class="b-modal-body">{children}</div>
      {footer !== undefined && <footer class="b-modal-foot">{footer}</footer>}
    </dialog>
  );
}

const join = (...names: (string | undefined)[]): string => names.filter(Boolean).join(' ');

/** A box in the middle of the screen, for a short task or a question: confirm, rename, end of a game. */
export function Modal({ class: extraClass, className, ...props }: ModalProps): JSX.Element {
  return <Frame {...props} classes={join('b-modal', extraClass, className)} />;
}

/** A modal on an edge, for longer content beside the page's context: details, settings, a guide. */
export function Drawer({ side = 'end', class: extraClass, className, ...props }: DrawerProps): JSX.Element {
  return (
    <Frame
      {...props}
      data-side={side === 'start' ? 'start' : undefined}
      classes={join('b-modal b-drawer', extraClass, className)}
    />
  );
}
