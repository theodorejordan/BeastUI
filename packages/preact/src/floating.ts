/**
 * The base shared by Menu and Popover: a popover="auto" box opened by a button (popovertarget).
 * Private: not exported from the package.
 *
 * The browser does the hard part (MDN, Popover API): top layer, close on a click outside and on
 * Escape (only the newest popover: a modal around it stays open), the button stays out of the
 * click-outside so a second click closes instead of reopening. This hook adds:
 * - the open state, read from the box's `toggle` event, whoever opened or closed it;
 * - the place next to the button: a ResizeObserver places it as soon as it has a size, before
 *   the first paint, and again when its content changes size; scroll and resize follow it;
 * - focus back on the button when it closes with focus inside it (or lost to the page).
 */
import type { RefObject } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { place, type Align, type Side } from './position';

export type { Align, Side };

/** The button: found by its id, so the app's element needs no ref. */
export function byId(box: HTMLElement | null, id: string): HTMLElement | null {
  const root = box?.getRootNode() as Document | ShadowRoot | undefined;
  return root?.getElementById(id) ?? null;
}

/** Closes it; focus goes back to the button first when it was inside, as the APG asks. */
export function hide(box: HTMLElement | null, triggerId: string): void {
  if (!box || !box.matches(':popover-open')) return;
  if (box.contains(document.activeElement)) byId(box, triggerId)?.focus();
  box.hidePopover();
}

export function useFloating(
  triggerId: string,
  side: Side,
  align: Align,
  onToggle?: (open: boolean, box: HTMLElement) => void,
): { box: RefObject<HTMLDivElement | null>; open: boolean } {
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const callback = useRef(onToggle);
  callback.current = onToggle;

  const follow = (): void => {
    const el = box.current;
    const trigger = byId(el, triggerId);
    if (el && trigger && el.matches(':popover-open')) place(trigger, el, side, align);
  };

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const sizes = new ResizeObserver(follow);
    sizes.observe(el);
    const onToggleEvent = (event: Event): void => {
      const isOpen = (event as ToggleEvent).newState === 'open';
      setOpen(isOpen);
      if (!isOpen) {
        // Escape or a closing from the app: the focused item is gone, focus fell to the page.
        // A click outside moved focus to what was clicked: leave it there.
        const active = document.activeElement;
        if (!active || active === document.body || el.contains(active)) byId(el, triggerId)?.focus();
      }
      callback.current?.(isOpen, el);
    };
    el.addEventListener('toggle', onToggleEvent);
    return () => {
      sizes.disconnect();
      el.removeEventListener('toggle', onToggleEvent);
    };
  }, [triggerId, side, align]);

  // While open only: a page with a menu in every table row keeps no listener per row.
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [open, triggerId, side, align]);

  return { box, open };
}

type Handler = ((event: any) => void) | undefined;
/** Calls the child's own handler, then ours: the app keeps its handlers. */
export const chain =
  (theirs: Handler, ours: (event: any) => void) =>
  (event: any): void => {
    theirs?.(event);
    ours(event);
  };
