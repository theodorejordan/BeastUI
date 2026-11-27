/**
 * Placement of a floating box (tooltip, menu, popover) next to the element it belongs to.
 * Private: not exported from the package.
 *
 * The box is a popover in the top layer, so it is placed in viewport pixels (position: fixed).
 * Decision 0005: no CSS anchor positioning before Safari 26, so this is done here.
 *
 * Rules: the preferred side first; the other side if the box doesn't fit there and fits better on
 * the other; centred on the anchor (or lined up with its start or end edge), then pushed back
 * inside the viewport, a margin from its edge.
 */
export type Side = 'top' | 'bottom';
/** Centred on the anchor (tooltip), or lined up with its start or end edge (menu, popover). */
export type Align = 'center' | 'start' | 'end';

/** Reads a length token (such as --b-space-1) where the box is, so it follows the theme. */
function token(el: Element, name: string, fallback: number): number {
  const value = parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

export function place(anchor: Element, box: HTMLElement, side: Side, align: Align = 'center'): Side {
  const gap = token(box, '--b-space-1', 4);
  const margin = token(box, '--b-space-2', 8);
  const a = anchor.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  // clientWidth leaves the scrollbar out, which innerWidth would count.
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  const room = { top: a.top - gap - margin, bottom: vh - a.bottom - gap - margin };
  const other: Side = side === 'top' ? 'bottom' : 'top';
  const chosen = room[side] >= b.height || room[side] >= room[other] ? side : other;

  const top = chosen === 'top' ? a.top - gap - b.height : a.bottom + gap;
  // start and end follow the writing direction: start is the left edge only left to right.
  const rtl = getComputedStyle(anchor).direction === 'rtl';
  const edge = align === 'center' ? align : (align === 'start') !== rtl ? 'left' : 'right';
  const wanted =
    edge === 'left' ? a.left : edge === 'right' ? a.right - b.width : a.left + a.width / 2 - b.width / 2;
  const left = Math.min(Math.max(wanted, margin), Math.max(margin, vw - margin - b.width));

  box.style.top = `${Math.round(top)}px`;
  box.style.left = `${Math.round(left)}px`;
  box.dataset.side = chosen;
  return chosen;
}
