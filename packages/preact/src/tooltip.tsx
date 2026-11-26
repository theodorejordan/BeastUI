/**
 * Tooltip: a short line that names or describes the element it wraps, on hover and keyboard focus.
 * The look lives in @beastui/css (components/tooltip.css): class="b-tooltip".
 *
 * What this file adds (APG Tooltip pattern, WCAG 1.4.13 content on hover or focus):
 * - opens after a hover delay, at once on keyboard focus, at once when moving from one tooltip
 *   to the next (the "skip delay" of Radix);
 * - stays open while the pointer is on the tooltip itself, with a short grace to get there;
 * - Escape closes it, and only it: an open modal around it stays open;
 * - closes on click (pointerdown), on blur, when the pointer leaves; never opens on touch;
 * - aria-describedby (default) or aria-labelledby (mode="label") on the wrapped element.
 *
 * No extra wrapper: the child gets the handlers and the ARIA attribute (cloneElement). The
 * tooltip is rendered right after it, so it inherits a data-theme set on an ancestor; the popover
 * attribute lifts it to the top layer, so no overflow clips it.
 */
import type { ComponentChildren, JSX, VNode } from 'preact';
import { cloneElement } from 'preact';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { place, type Side } from './position';

/**
 * Hover delay before opening (owner's choice: 10 ms, near instant; Radix waits 700, MUI 100, Mantine 0),
 * and the window after a close during which the next one opens at once.
 */
const OPEN_DELAY = 10;
const SKIP_DELAY = 300;
/** Time before it closes once the pointer has left. The gap to the tooltip is bridged in CSS. */
const CLOSE_GRACE = 10;

// Shared by every tooltip on the page: when the last one closed.
let lastClosed = 0;

/*
 * An Escape that closed a tooltip must not also close the <dialog> around it. Cancelling the
 * keydown is not enough any more: the browser turns Escape into a "close request" and fires
 * `cancel` on the dialog (HTML spec, close requests). So the next `cancel` in the same task is
 * cancelled too. One listener for the whole page, added on first use.
 */
let swallowCancel = false;
let cancelGuard = false;
function takeEscape(): void {
  if (!cancelGuard && typeof window !== 'undefined') {
    cancelGuard = true;
    window.addEventListener(
      'cancel',
      (event) => {
        if (swallowCancel) event.preventDefault();
        swallowCancel = false;
      },
      true,
    );
  }
  swallowCancel = true;
  setTimeout(() => (swallowCancel = false), 0);
}

export type TooltipProps = {
  /** The text. Short and plain: no button, no link (that is a popover). */
  content: ComponentChildren;
  /**
   * `description` (default): extra information, read after the element's name (aria-describedby).
   * `label`: the tooltip IS the name (aria-labelledby), for an icon-only button, so a screen
   * reader doesn't say the same word twice.
   */
  mode?: 'description' | 'label';
  /** The preferred side. It flips when there is no room. */
  side?: Side;
  /** One element that can take focus: a button, a link. A disabled button fires no event: no tooltip. */
  children: VNode<any>;
};

type Handler = ((event: any) => void) | undefined;
/** Calls the child's own handler, then ours: the app keeps its handlers. */
const chain =
  (theirs: Handler, ours: (event: any) => void) =>
  (event: any): void => {
    theirs?.(event);
    ours(event);
  };

export function Tooltip({ content, mode = 'description', side = 'top', children }: TooltipProps): JSX.Element {
  const id = useId();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const anchor = useRef<Element | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clear = (): void => clearTimeout(timer.current);
  const show = (): void => {
    clear();
    setOpen(true);
  };
  const hide = (): void => {
    clear();
    setOpen(false);
  };
  const later = (fn: () => void, ms: number): void => {
    clear();
    timer.current = setTimeout(fn, ms);
  };

  // Open state → top layer, then place it (it has a size only once shown).
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !el.isConnected) return;
    if (open) {
      if (!el.matches(':popover-open')) el.showPopover();
      if (anchor.current) place(anchor.current, el, side);
    } else if (el.matches(':popover-open')) {
      el.hidePopover();
      lastClosed = Date.now();
    }
  }, [open, content, side]);

  // While open: Escape, and follow the element when the page scrolls or resizes. A layout
  // effect, so the listeners are there the moment it shows: an Escape right away still counts.
  useLayoutEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      // Capture phase: the Escape closes the tooltip, not the modal around it (see takeEscape).
      event.preventDefault();
      event.stopPropagation();
      takeEscape();
      hide();
    };
    const follow = (): void => {
      if (box.current && anchor.current) place(anchor.current, box.current, side);
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [open, side]);

  // Unmounted while waiting or open: no timer left behind.
  useEffect(() => clear, []);

  const props = children.props as Record<string, any>;
  const ariaKey = mode === 'label' ? 'aria-labelledby' : 'aria-describedby';
  const ids = [props[ariaKey], id].filter(Boolean).join(' ');

  const trigger = cloneElement(children, {
    [ariaKey]: ids,
    onPointerEnter: chain(props.onPointerEnter, (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      anchor.current = event.currentTarget as Element;
      if (open || Date.now() - lastClosed < SKIP_DELAY) show();
      else later(show, OPEN_DELAY);
    }),
    onPointerLeave: chain(props.onPointerLeave, () => later(hide, CLOSE_GRACE)),
    onPointerDown: chain(props.onPointerDown, hide),
    onFocus: chain(props.onFocus, (event: FocusEvent) => {
      const el = event.currentTarget as Element;
      // Keyboard focus only: a click focuses a button too, and must not leave a tooltip behind.
      if (!el.matches(':focus-visible')) return;
      anchor.current = el;
      show();
    }),
    onBlur: chain(props.onBlur, hide),
  });

  return (
    <>
      {trigger}
      <div
        ref={box}
        id={id}
        class="b-tooltip"
        role="tooltip"
        popover="manual"
        onPointerEnter={clear}
        onPointerLeave={() => later(hide, CLOSE_GRACE)}
      >
        {content}
      </div>
    </>
  );
}
