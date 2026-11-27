/**
 * MultiSelect: pick several values from a list, in a form (Formats: PDF, CSV, Excel).
 * The look lives in @beastui/css: the closed box is the select's (select.css, on a
 * <button class="b-select">), the open list is components/listbox.css.
 *
 * <Field label="Formats">
 *   <MultiSelect options={FORMATS} value={formats} onChange={setFormats} placeholder="Any format" />
 * </Field>
 *
 * Why not <select multiple>? It is an always-open box the size of its list, with Ctrl+click to
 * pick more than one: few people know it. This is the WAI-ARIA APG Listbox pattern
 * (aria-multiselectable) behind a button, on the menu's floating base (floating.ts).
 *
 * Keys (APG Listbox, multiple selection):
 * - on the button: Enter, Space or a click opens it; ↓ / ↑ open on the first chosen option (or
 *   the first / last one). A click focuses the list itself, so no row lights up under a pointer
 *   that hasn't moved;
 * - in the list: ↑ ↓ move (no wrap, as in the APG listbox), Home and End, a letter jumps to the
 *   next option starting with it, Space or Enter checks or unchecks, and the list stays open;
 *   Escape or Tab closes it, focus back on the button. The pointer moves the focus too.
 *
 * The closed box writes the chosen labels in the options' order and cuts them where the box
 * ends: "PDF, CSV +2". Its accessible name is the label then the whole value, never the cut one.
 */
import type { JSX } from 'preact';
import { useContext, useId, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { FieldContext, join } from './field';
import { hide, useFloating, type Align } from './floating';

export type MultiSelectOption<T extends string> = {
  value: T;
  /** Plain text: the box writes the labels in a row. */
  label: string;
  disabled?: boolean;
};

export type MultiSelectGroup<T extends string> = {
  /** The group's name, shown small in light capitals (lowercase in tool) above its options. */
  label: string;
  options: readonly MultiSelectOption<T>[];
};

export type MultiSelectProps<T extends string> = {
  /** Options, or groups of options. */
  options: readonly (MultiSelectOption<T> | MultiSelectGroup<T>)[];
  /** The chosen values. Empty shows the placeholder. */
  value: readonly T[];
  /** The new values, always in the options' order. */
  onChange: (value: T[]) => void;
  /** Shown in the box while nothing is chosen ("Any format"). */
  placeholder?: string;
  /** Lined up with the box's start edge (default), its end edge, or centred on it. */
  align?: Align;
  disabled?: boolean;
  id?: string;
  /** The name when there is no Field around it. */
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Extra classes, on the box (`b-select`). */
  class?: string;
  className?: string;
};

const isGroup = <T extends string>(o: MultiSelectOption<T> | MultiSelectGroup<T>): o is MultiSelectGroup<T> =>
  'options' in o;

/** The options the keys move through: disabled ones are skipped. */
const rows = (box: HTMLElement): HTMLElement[] =>
  Array.from(box.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'));

export function MultiSelect<T extends string>({
  options,
  value,
  onChange,
  placeholder,
  align = 'start',
  disabled,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  class: extraClass,
  className,
}: MultiSelectProps<T>): JSX.Element {
  const field = useContext(FieldContext);
  const auto = useId();
  const triggerId = id ?? field?.id ?? `${auto}-trigger`;
  const listId = `${auto}-list`;
  const valueId = `${auto}-value`;
  const nameId = `${auto}-name`;
  const labelId = field?.labelId ?? (ariaLabel ? nameId : undefined);

  const flat = options.flatMap((o) => (isGroup(o) ? o.options : [o]));
  const chosen = flat.filter((o) => value.includes(o.value));
  const labels = chosen.map((o) => o.label);

  // Where focus lands when it opens: the list itself after a click, an option after a key.
  const start = useRef<'list' | 'first' | 'last'>('first');
  const focusStart = (el: HTMLElement): void => {
    const list = rows(el);
    const picked = list.find((row) => row.getAttribute('aria-selected') === 'true');
    const target =
      start.current === 'list' ? el : (picked ?? (start.current === 'last' ? list.at(-1) : list[0]));
    (target ?? el).focus();
  };

  const { box, open } = useFloating(triggerId, 'bottom', align, (isOpen, el) => {
    if (!isOpen) return;
    // At least as wide as the box, like a native select's list.
    const button = document.getElementById(triggerId);
    if (button) el.style.minInlineSize = `${button.offsetWidth}px`;
    focusStart(el);
  });

  const toggle = (option: MultiSelectOption<T>): void => {
    if (option.disabled) return;
    const next = value.includes(option.value) ? value.filter((v) => v !== option.value) : [...value, option.value];
    onChange(flat.filter((o) => next.includes(o.value)).map((o) => o.value));
  };

  // How many labels fit before "+N": measured on hidden copies, again when the box resizes.
  const area = useRef<HTMLSpanElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(labels.length);
  const key = labels.join('\u0000');
  useLayoutEffect(() => {
    const el = area.current;
    const copies = measure.current;
    if (!el || !copies) return;
    const count = (): void => {
      const parts = Array.from(copies.children) as HTMLElement[];
      const comma = parts[0]!.offsetWidth;
      const more = parts[1]!.offsetWidth;
      const widths = parts.slice(2).map((p) => p.offsetWidth);
      const room = el.clientWidth;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      let k = widths.length;
      const need = (n: number): number =>
        widths.slice(0, n).reduce((a, b) => a + b, 0) + (n - 1) * comma + (n < widths.length ? gap + more : 0);
      while (k > 1 && need(k) > room) k--;
      setFit(k);
    };
    count();
    const sizes = new ResizeObserver(count);
    sizes.observe(el);
    return () => sizes.disconnect();
  }, [key]);

  const shown = labels.slice(0, Math.max(1, fit));
  const rest = labels.length - shown.length;

  const onButtonKeyDown = (event: KeyboardEvent): void => {
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
  };

  // A letter typed in the list: the next option (after the focused one) that starts with it.
  const jump = (list: HTMLElement[], from: number, letter: string): void => {
    for (let step = 1; step <= list.length; step++) {
      const row = list[(from + step) % list.length]!;
      if (row.textContent?.trim().toLowerCase().startsWith(letter)) return row.focus();
    }
  };

  const onListKeyDown = (event: KeyboardEvent): void => {
    const el = box.current;
    if (!el) return;
    const list = rows(el);
    const i = list.indexOf(document.activeElement as HTMLElement);
    const to = (index: number): void => {
      event.preventDefault();
      list[Math.min(Math.max(index, 0), list.length - 1)]?.focus();
    };
    if (event.key === 'ArrowDown') to(i < 0 ? 0 : i + 1);
    else if (event.key === 'ArrowUp') to(i < 0 ? list.length - 1 : i - 1);
    else if (event.key === 'Home') to(0);
    else if (event.key === 'End') to(list.length - 1);
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (i >= 0) list[i]!.click();
    } else if (event.key === 'Tab') {
      // As in the menu: Tab closes, and focus goes back to the button, not two stops away.
      event.preventDefault();
      hide(el, triggerId);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      jump(list, i, event.key.toLowerCase());
    }
  };

  const renderOption = (option: MultiSelectOption<T>): JSX.Element => {
    const selected = value.includes(option.value);
    return (
      <div
        key={option.value}
        class="b-listbox-option"
        role="option"
        tabIndex={-1}
        aria-selected={selected ? 'true' : 'false'}
        aria-disabled={option.disabled ? 'true' : undefined}
        onClick={() => toggle(option)}
        onPointerMove={(event) => {
          const row = event.currentTarget;
          if (option.disabled) row.closest<HTMLElement>('.b-listbox')?.focus();
          else if (document.activeElement !== row) row.focus();
        }}
        onPointerLeave={(event) => {
          const row = event.currentTarget;
          if (document.activeElement === row) row.closest<HTMLElement>('.b-listbox')?.focus();
        }}
      >
        <span class="b-listbox-check" aria-hidden="true" />
        {option.label}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        id={triggerId}
        class={join('b-select', extraClass, className)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId ? `${labelId} ${valueId}` : undefined}
        aria-describedby={join(field?.describedBy, describedBy)}
        aria-invalid={field?.invalid ? 'true' : invalid}
        popovertarget={listId}
        onPointerDown={() => (start.current = 'list')}
        onKeyDown={onButtonKeyDown}
      >
        {ariaLabel && !field && (
          <span id={nameId} hidden>
            {ariaLabel}
          </span>
        )}
        {/* The whole value, for the name: the box may show only part of it. */}
        <span id={valueId} hidden>
          {labels.length ? labels.join(', ') : (placeholder ?? '')}
        </span>
        <span class="b-select__text" ref={area} aria-hidden="true">
          {labels.length ? (
            <>
              <span class="b-select__value">{shown.join(', ')}</span>
              {rest > 0 && <span class="b-select__more">+{rest}</span>}
            </>
          ) : (
            <span class="b-select__placeholder">{placeholder}</span>
          )}
        </span>
        <span class="b-select__measure" ref={measure} aria-hidden="true">
          <span>, </span>
          <span>+{Math.max(labels.length - 1, 0)}</span>
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </span>
      </button>
      <div
        ref={box}
        id={listId}
        class="b-listbox"
        role="listbox"
        aria-multiselectable="true"
        aria-labelledby={labelId}
        popover="auto"
        tabIndex={-1}
        onKeyDown={onListKeyDown}
      >
        {options.map((o, index) =>
          isGroup(o) ? (
            <div key={`group-${o.label}`} class="b-listbox-group" role="group" aria-labelledby={`${auto}-group-${index}`}>
              <div class="b-listbox-label" id={`${auto}-group-${index}`}>
                {o.label}
              </div>
              {o.options.map(renderOption)}
            </div>
          ) : (
            renderOption(o)
          ),
        )}
      </div>
    </>
  );
}
