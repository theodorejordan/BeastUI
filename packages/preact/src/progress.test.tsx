import '@beastui/css/beastui.css';
import { render } from 'preact';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Progress } from './progress';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const bar = (name: string): HTMLElement => page.getByRole('progressbar', { name }).element() as HTMLElement;
const fillWidth = (el: HTMLElement): number => parseFloat(getComputedStyle(el, '::before').inlineSize);

describe('Progress', () => {
  it('is a named progressbar with its value, and fills that share of the track', () => {
    render(<Progress aria-label="Uploading" value={3} max={12} valueText="3 of 12 files" style={{ width: '400px' }} />, root);
    const el = bar('Uploading');
    expect(el.getAttribute('aria-valuenow')).toBe('3');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('12');
    expect(el.getAttribute('aria-valuetext')).toBe('3 of 12 files');
    expect(el.style.width).toBe('400px');
    expect(fillWidth(el)).toBeCloseTo(100, 0);
  });

  it('without a value, has no aria-valuenow: the unknown-length state', () => {
    render(<Progress aria-label="Syncing" valueText="ignored" />, root);
    const el = bar('Syncing');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.hasAttribute('aria-valuetext')).toBe(false);
    expect(getComputedStyle(el, '::before').animationName).toBe('b-progress-sway');
  });

  it('keeps the value between 0 and max', () => {
    render(
      <>
        <Progress aria-label="Over" value={140} />
        <Progress aria-label="Under" value={-5} />
      </>,
      root,
    );
    expect(bar('Over').getAttribute('aria-valuenow')).toBe('100');
    expect(bar('Under').getAttribute('aria-valuenow')).toBe('0');
  });

  it('is 4px high, or 2px when thin', () => {
    render(
      <>
        <Progress aria-label="Regular" value={1} />
        <Progress aria-label="Thin" value={1} size="thin" />
      </>,
      root,
    );
    expect(bar('Regular').getBoundingClientRect().height).toBe(4);
    expect(bar('Thin').getBoundingClientRect().height).toBe(2);
    expect(bar('Thin').dataset.size).toBe('thin');
  });
});
