/**
 * Tree: nested items that fold, drawn from data. Disclosure navigation (WAI-ARIA APG), not the
 * ARIA treeview: each branch has a <button aria-expanded> that folds it, each item a <button>
 * that chooses it (aria-current), and Tab moves between them. A closed branch isn't rendered.
 * A parent that only holds its children (`group`) has one button, the whole row, that folds it.
 *
 * Which branches are open is kept here, or by the app: pass `open` and `onOpenChange` (to
 * remember them between visits, for instance). The chosen item is always the app's.
 */
import type { JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';

/** The ids from the root down to the parent of `id`, or undefined when `id` isn't in `items`. */
function parentsOf(items: readonly TreeItem[], id: string): string[] | undefined {
  for (const item of items) {
    if (item.id === id) return [];
    const below = item.children && parentsOf(item.children, id);
    if (below) return [item.id, ...below];
  }
  return undefined;
}

export type TreeItem = {
  /** Unique in the whole tree. */
  id: string;
  label: string;
  /** A number shown on the right: the tracks in a crate, for instance. */
  count?: number;
  /** Shown on hover (a cut label, a date). */
  title?: string;
  /** Only holds its children (a heading): the whole row folds it, and it is never chosen. */
  group?: boolean;
  children?: TreeItem[];
};

/** A chevron right; the CSS turns it down when open. */
const chevron = (
  <svg class="b-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export type TreeProps = {
  items: TreeItem[];
  /** The chosen item's id. */
  selected?: string | null;
  onSelect?: (id: string) => void;
  /** The open branches, when the app keeps them. */
  open?: ReadonlySet<string>;
  /** The branches open at first, when the tree keeps them. */
  defaultOpen?: Iterable<string>;
  /** Every fold and unfold, with the new set of open branches. */
  onOpenChange?: (open: Set<string>) => void;
  /** The toggle's name for a screen reader. Its state is aria-expanded, so the name stays. */
  toggleLabel?: (item: TreeItem) => string;
  /** Names the list, e.g. "Crates". */
  'aria-label'?: string;
  class?: string;
};

const expandLabel = (item: TreeItem): string => `Expand ${item.label}`;

export function Tree({
  items,
  selected = null,
  onSelect,
  open: controlled,
  defaultOpen,
  onOpenChange,
  toggleLabel = expandLabel,
  'aria-label': ariaLabel,
  class: extraClass,
}: TreeProps): JSX.Element {
  const [own, setOwn] = useState<ReadonlySet<string>>(() => new Set(defaultOpen));
  const open = controlled ?? own;
  // The parents of the chosen item, open or closed: their rows keep the hover tint.
  const trail = useMemo(() => new Set(selected === null ? [] : (parentsOf(items, selected) ?? [])), [items, selected]);

  const toggle = (id: string): void => {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (!controlled) setOwn(next);
    onOpenChange?.(next);
  };

  const render = (item: TreeItem, level: number): JSX.Element => {
    const branch = (item.children?.length ?? 0) > 0;
    const expanded = branch && open.has(item.id);
    return (
      <li key={item.id}>
        <div class="b-tree-row" data-trail={trail.has(item.id) || undefined} style={{ '--b-tree-level': level }}>
          {item.group ? (
            <button
              type="button"
              class="b-tree-toggle"
              data-group
              aria-expanded={expanded}
              title={item.title}
              onClick={() => toggle(item.id)}
            >
              {chevron}
              <span>{item.label}</span>
            </button>
          ) : (
            <>
              {branch && (
            <button
              type="button"
              class="b-tree-toggle"
              aria-expanded={expanded}
              aria-label={toggleLabel(item)}
              onClick={() => toggle(item.id)}
            >
              {chevron}
            </button>
          )}
          <button
            type="button"
            class="b-tree-name"
            aria-current={selected === item.id ? 'true' : undefined}
            title={item.title}
            onClick={() => onSelect?.(item.id)}
          >
            {item.label}
          </button>
            </>
          )}
          {item.count !== undefined && <span class="b-tree-count">{item.count}</span>}
        </div>
        {expanded && <ul>{item.children!.map((child) => render(child, level + 1))}</ul>}
      </li>
    );
  };

  return (
    <ul class={extraClass ? `b-tree ${extraClass}` : 'b-tree'} aria-label={ariaLabel}>
      {items.map((item) => render(item, 0))}
    </ul>
  );
}
