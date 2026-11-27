/**
 * Menu: a list of actions opened by a button. The look lives in @beastui/css
 * (components/menu.css): class="b-menu".
 *
 * <Menu trigger={<Button>More</Button>}>
 *   <MenuItem onSelect={rename}>Rename</MenuItem>
 *   <MenuSeparator />
 *   <MenuItem tone="danger" onSelect={remove}>Delete</MenuItem>
 * </Menu>
 *
 * Keys (WAI-ARIA APG, Menu Button pattern):
 * - on the button: Enter, Space or a click opens it; ↓ opens on the first item, ↑ on the last.
 *   A click focuses the menu itself, so no item lights up under a pointer that hasn't moved;
 * - in the menu: ↑ ↓ move and wrap, Home and End, a letter jumps to the next item starting with
 *   it, Enter or Space runs the item and closes, Escape or Tab closes; focus goes back to the
 *   button. The pointer moves the focus too: one highlight, never two.
 * - a disabled item stays in the list, faded, but the keys skip it and a click does nothing.
 *
 * The button gets the ARIA attributes and popovertarget (cloneElement, no wrapper). The menu is
 * rendered right after it, so it inherits a data-theme set on an ancestor.
 */
import type { ComponentChildren, JSX, VNode } from 'preact';
import { cloneElement, createContext } from 'preact';
import { useContext, useId, useRef } from 'preact/hooks';
import { chain, hide, useFloating, type Align, type Side } from './floating';

const MenuContext = createContext<{ close: () => void } | null>(null);

/** The items the keys move through: disabled ones are skipped. */
const items = (box: HTMLElement): HTMLElement[] =>
  Array.from(box.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));

export type MenuProps = {
  /** One button. It keeps its own handlers. */
  trigger: VNode<any>;
  /** MenuItem, MenuSeparator, MenuGroup. */
  children: ComponentChildren;
  /** The preferred side. It flips when there is no room. */
  side?: Side;
  /** Lined up with the button's start edge (default), its end edge, or centred on it. */
  align?: Align;
  /** Called when it opens or closes, however that happened. */
  onOpenChange?: (open: boolean) => void;
};

export function Menu({ trigger, children, side = 'bottom', align = 'start', onOpenChange }: MenuProps): JSX.Element {
  const props = trigger.props as Record<string, any>;
  const auto = useId();
  const triggerId: string = props.id ?? `${auto}-trigger`;
  const menuId = `${auto}-menu`;
  // Where focus lands when it opens: the menu itself after a click, an item after a key.
  const start = useRef<'menu' | 'first' | 'last'>('first');

  const focusStart = (el: HTMLElement): void => {
    const list = items(el);
    const target = start.current === 'menu' ? el : start.current === 'last' ? list.at(-1) : list[0];
    (target ?? el).focus();
  };

  const { box, open } = useFloating(triggerId, side, align, (isOpen, el) => {
    if (isOpen) focusStart(el);
    onOpenChange?.(isOpen);
  });

  const close = (): void => hide(box.current, triggerId);

  const button = cloneElement(trigger, {
    id: triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': menuId,
    popovertarget: menuId,
    onPointerDown: chain(props.onPointerDown, () => (start.current = 'menu')),
    onKeyDown: chain(props.onKeyDown, (event: KeyboardEvent) => {
      const el = box.current;
      if (!el) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        start.current = event.key === 'ArrowUp' ? 'last' : 'first';
        if (el.matches(':popover-open')) focusStart(el);
        else el.showPopover();
      } else if (event.key === 'Enter' || event.key === ' ') {
        start.current = 'first';
      }
    }),
  });

  // A letter typed in the menu: the next item (after the focused one) that starts with it.
  const jump = (list: HTMLElement[], from: number, key: string): void => {
    const letter = key.toLowerCase();
    for (let step = 1; step <= list.length; step++) {
      const item = list[(from + step) % list.length]!;
      if (item.textContent?.trim().toLowerCase().startsWith(letter)) return item.focus();
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const el = box.current;
    if (!el) return;
    const list = items(el);
    const n = list.length;
    const i = list.indexOf(document.activeElement as HTMLElement);
    const to = (index: number): void => {
      event.preventDefault();
      list[index]?.focus();
    };
    if (event.key === 'ArrowDown') to(i < 0 ? 0 : (i + 1) % n);
    else if (event.key === 'ArrowUp') to(i < 0 ? n - 1 : (i - 1 + n) % n);
    else if (event.key === 'Home') to(0);
    else if (event.key === 'End') to(n - 1);
    else if (event.key === 'Tab') {
      // The APG lets Tab close the menu; focus goes back to the button, not two stops away.
      event.preventDefault();
      close();
    } else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      jump(list, i < 0 ? -1 : i, event.key);
    }
  };

  return (
    <>
      {button}
      <div
        ref={box}
        id={menuId}
        class="b-menu"
        role="menu"
        aria-labelledby={triggerId}
        popover="auto"
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <MenuContext.Provider value={{ close }}>{children}</MenuContext.Provider>
      </div>
    </>
  );
}

export type MenuItemProps = {
  /** Runs after the menu has closed, so a modal it opens takes the focus. */
  onSelect?: () => void;
  /** `danger`: an action that destroys or can't be undone. */
  tone?: 'danger';
  /** Faded, skipped by the keys, does nothing. Say on the page why, if it matters. */
  disabled?: boolean;
  /** The text, with an optional leading <svg class="b-icon">. */
  children: ComponentChildren;
};

export function MenuItem({ onSelect, tone, disabled, children }: MenuItemProps): JSX.Element {
  const menu = useContext(MenuContext);
  return (
    <button
      type="button"
      class="b-menu-item"
      role="menuitem"
      tabIndex={-1}
      data-tone={tone}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={() => {
        if (disabled) return;
        menu?.close();
        onSelect?.();
      }}
      onPointerMove={(event) => {
        const el = event.currentTarget;
        if (disabled) el.closest<HTMLElement>('.b-menu')?.focus();
        else if (document.activeElement !== el) el.focus();
      }}
      onPointerLeave={(event) => {
        // Off the items: no highlight left behind, the keys still work from the menu.
        const el = event.currentTarget;
        if (document.activeElement === el) el.closest<HTMLElement>('.b-menu')?.focus();
      }}
    >
      {children}
    </button>
  );
}

export function MenuSeparator(): JSX.Element {
  return <div class="b-menu-separator" role="separator" />;
}

export type MenuGroupProps = {
  /** The group's name, shown small and muted above its items, and read before them. */
  label: string;
  children: ComponentChildren;
};

export function MenuGroup({ label, children }: MenuGroupProps): JSX.Element {
  const id = useId();
  return (
    <div class="b-menu-group" role="group" aria-labelledby={id}>
      <div class="b-menu-label" id={id}>
        {label}
      </div>
      {children}
    </div>
  );
}
