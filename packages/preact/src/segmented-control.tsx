/**
 * SegmentedControl: pick one of 2–5 options, side by side.
 * The look lives in @beastui/css (components/segmented.css). This file renders the native radios
 * of that contract and places the sliding outline (the thumb) under the picked option.
 */
import type { ComponentChildren, JSX } from 'preact';
import { useId, useLayoutEffect, useRef } from 'preact/hooks';

export type SegmentedOption<T extends string> = {
  value: T;
  /** What the option shows. Text, or an icon with text. */
  label: ComponentChildren;
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string> = {
  /** The group's name for a screen reader ("Sort", "Theme"). Required: the options alone don't
   *  say what is being chosen. */
  label: string;
  options: readonly SegmentedOption<T>[];
  /** The picked option. The control is controlled: it shows `value`, and reports clicks and
   *  arrow keys through `onChange`. */
  value: T;
  onChange: (value: T) => void;
  /** The radios' form name. A unique one is generated when left out. */
  name?: string;
  /** Extra classes, after `b-seg`. */
  class?: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  name,
  class: extraClass,
  className,
}: SegmentedControlProps<T>): JSX.Element {
  const generated = useId();
  const root = useRef<HTMLDivElement>(null);
  // Set by a click or an arrow key, read by the next placement: only the user's own pick slides.
  const picked = useRef(false);

  // Measure the picked option and move the thumb there. Again when the control resizes: fonts
  // loading, a theme with another control size, a label that changes.
  // The thumb slides only when the user picks. When the app sets the value (a saved choice read
  // after the first render) or the size changes, it jumps: a slide would show a pick nobody made.
  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    const place = (slide: boolean): void => {
      const option = group.querySelector<HTMLElement>('label:has(:checked)');
      if (!option) {
        delete group.dataset.thumb;
        return;
      }
      const x = `${option.offsetLeft}px`;
      const w = `${option.offsetWidth}px`;
      // Nothing moved: leave a slide in progress alone. (A ResizeObserver also fires once right
      // after it starts observing, which would otherwise cut the user's slide short.)
      if (group.style.getPropertyValue('--b-seg-x') === x && group.style.getPropertyValue('--b-seg-w') === w) return;
      // Same style change as the new position, so the browser applies both at once.
      if (slide) delete group.dataset.jump;
      else group.dataset.jump = '';
      group.style.setProperty('--b-seg-x', x);
      group.style.setProperty('--b-seg-w', w);
      group.dataset.thumb = '';
    };
    place(picked.current);
    picked.current = false;
    const observer = new ResizeObserver(() => place(false));
    for (const child of group.children) observer.observe(child);
    return () => observer.disconnect();
  }, [value, options]);

  return (
    <div ref={root} class={['b-seg', extraClass, className].filter(Boolean).join(' ')} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name ?? generated}
            value={option.value}
            checked={option.value === value}
            disabled={option.disabled}
            onChange={() => {
              picked.current = true;
              onChange(option.value);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
      <span class="b-seg__thumb" aria-hidden="true" />
    </div>
  );
}
