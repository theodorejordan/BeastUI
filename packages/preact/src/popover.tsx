/**
 * Popover: a floating box with any content, opened by a button. The look lives in @beastui/css
 * (components/popover.css): class="b-popover".
 *
 * <Popover trigger={<Button>Filter</Button>} label="Filter">
 *   …a small form…
 * </Popover>
 *
 * Not a menu: no arrow keys. It is a non-modal dialog (Radix Popover, APG Disclosure): focus
 * stays on the button when it opens, and Tab goes from the button into the box, which comes
 * right after it in the page. A click outside or Escape closes it; with focus inside, focus
 * goes back to the button.
 *
 * Uncontrolled by default. To close it from inside (an Apply button), control it with `open`
 * and `onOpenChange`.
 */
import type { ComponentChildren, JSX, VNode } from 'preact';
import { cloneElement } from 'preact';
import { useId, useLayoutEffect } from 'preact/hooks';
import { hide, useFloating, type Align, type Side } from './floating';

export type PopoverProps = {
  /** One button. It keeps its own handlers. */
  trigger: VNode<any>;
  /** The content: text, a form, buttons. */
  children: ComponentChildren;
  /** Names the box for a screen reader. Without it, the button's name does. */
  label?: string;
  /** The preferred side. It flips when there is no room. */
  side?: Side;
  /** Lined up with the button's start edge (default), its end edge, or centred on it. */
  align?: Align;
  /** Controlled: open or closed. Leave it out and the button alone opens and closes it. */
  open?: boolean;
  /** Called when it opens or closes, however that happened (click outside, Escape, button). */
  onOpenChange?: (open: boolean) => void;
};

export function Popover({
  trigger,
  children,
  label,
  side = 'bottom',
  align = 'start',
  open: wanted,
  onOpenChange,
}: PopoverProps): JSX.Element {
  const props = trigger.props as Record<string, any>;
  const auto = useId();
  const triggerId: string = props.id ?? `${auto}-trigger`;
  const boxId = `${auto}-popover`;
  const { box, open } = useFloating(triggerId, side, align, (isOpen) => onOpenChange?.(isOpen));

  // Controlled: the app's state opens and closes the box.
  useLayoutEffect(() => {
    const el = box.current;
    if (wanted === undefined || !el) return;
    if (wanted && !el.matches(':popover-open')) el.showPopover();
    if (!wanted) hide(el, triggerId);
  }, [wanted]);

  const button = cloneElement(trigger, {
    id: triggerId,
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': boxId,
    popovertarget: boxId,
  });

  return (
    <>
      {button}
      <div
        ref={box}
        id={boxId}
        class="b-popover"
        role="dialog"
        aria-label={label}
        aria-labelledby={label ? undefined : triggerId}
        popover="auto"
      >
        {children}
      </div>
    </>
  );
}
