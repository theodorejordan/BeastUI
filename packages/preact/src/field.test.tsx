import '@beastui/css/beastui.css';
import { render } from 'preact';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Field, Input } from './field';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const described = (input: Element): string[] =>
  (input.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)!.textContent!);

describe('Field', () => {
  it('names the input with its label', () => {
    render(
      <Field label="Upload limit">
        <Input type="number" />
      </Field>,
      root,
    );
    expect(page.getByRole('spinbutton', { name: 'Upload limit' }).element()).toBeInstanceOf(HTMLInputElement);
  });

  it('describes the input with its unit, hint and error, in reading order', () => {
    render(
      <Field label="Most limiting" hint="0 to 8" error="Too high">
        <Input type="number" unit="dB" />
      </Field>,
      root,
    );
    const input = root.querySelector('input')!;
    expect(described(input)).toEqual(['dB', '0 to 8', 'Too high']);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('is valid and undescribed without a hint or an error', () => {
    render(
      <Field label="Name">
        <Input />
      </Field>,
      root,
    );
    const input = root.querySelector('input')!;
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('puts the box class on the input, or on the frame when there is a unit', () => {
    render(
      <>
        <Input aria-label="Plain" />
        <Input aria-label="With unit" unit="MB" />
      </>,
      root,
    );
    const [plain, withUnit] = [...root.querySelectorAll('input')];
    expect(plain!.classList.contains('b-input')).toBe(true);
    expect(withUnit!.classList.contains('b-input')).toBe(false);
    expect(withUnit!.parentElement!.classList.contains('b-input')).toBe(true);
  });

  it('keeps the control height, with or without a unit', () => {
    render(
      <>
        <Input aria-label="Plain" />
        <Input aria-label="With unit" unit="MB" />
      </>,
      root,
    );
    const boxes = [...root.querySelectorAll('.b-input')];
    expect(boxes.map((b) => b.getBoundingClientRect().height)).toEqual([32, 32]);
  });
});
