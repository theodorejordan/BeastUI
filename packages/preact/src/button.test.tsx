import '@beastui/css/beastui.css';
import { createRef, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Button } from './button';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

function mount(ui: preact.ComponentChild): HTMLButtonElement {
  render(ui, root);
  const button = root.querySelector('button');
  if (!button) throw new Error('no button rendered');
  return button;
}

describe('Button', () => {
  it('maps its props to the CSS contract', () => {
    const button = mount(<Button>Save</Button>);
    expect(button.className).toBe('b-btn');
    expect(button.dataset.variant).toBe('secondary');
    expect(button.type).toBe('button');
    expect(button.hasAttribute('data-icon')).toBe(false);
    expect(button.hasAttribute('aria-disabled')).toBe(false);
  });

  it('keeps extra classes after b-btn, in both spellings', () => {
    const button = mount(
      <Button class="one" className="two">
        Save
      </Button>,
    );
    expect(button.className).toBe('b-btn one two');
  });

  it('marks an icon-only button and keeps its name', () => {
    const button = mount(
      <Button iconOnly aria-label="Settings">
        <svg class="b-icon" />
      </Button>,
    );
    expect(button.hasAttribute('data-icon')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Settings');
  });

  it('forwards ref and native props to the <button>', () => {
    const ref = createRef<HTMLButtonElement>();
    const button = mount(
      <Button ref={ref} type="submit" name="go" title="Go">
        Go
      </Button>,
    );
    expect(ref.current).toBe(button);
    expect(button.type).toBe('submit');
    expect(button.name).toBe('go');
  });

  it('calls onClick from a click, Enter and Space', async () => {
    const onClick = vi.fn();
    const button = mount(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not submit a form by surprise', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Inside a form</Button>
      </form>,
      root,
    );
    await userEvent.click(root.querySelector('button')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe('pending', () => {
    it('refuses clicks, Enter and Space, and keeps the focus', async () => {
      const onClick = vi.fn();
      const button = mount(
        <Button pending onClick={onClick}>
          Save
        </Button>,
      );
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.hasAttribute('data-pending')).toBe(true);
      button.focus();
      // Playwright won't click an aria-disabled element unless forced; a real user still can.
      await userEvent.click(button, { force: true });
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(button);
    });

    it('stops a submit button from sending its form', async () => {
      const onSubmit = vi.fn((event: Event) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <input aria-label="Name" />
          <Button type="submit" pending>
            Send
          </Button>
        </form>,
        root,
      );
      await userEvent.click(root.querySelector('button')!, { force: true });
      root.querySelector('input')!.focus();
      await userEvent.keyboard('{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('keeps its width and its accessible name', () => {
      const idle = mount(<Button variant="primary">Save</Button>);
      const width = idle.getBoundingClientRect().width;
      const pending = mount(
        <Button variant="primary" pending>
          Save
        </Button>,
      );
      expect(pending.getBoundingClientRect().width).toBe(width);
      expect(pending.textContent).toBe('Save');
      expect(getComputedStyle(pending, '::after').animationName).toBe('b-spin');
    });
  });

  it('leaves the tab order when disabled', async () => {
    render(
      <>
        <Button>First</Button>
        <Button disabled>Off</Button>
        <Button>Last</Button>
      </>,
      root,
    );
    const [first, , last] = root.querySelectorAll('button');
    first!.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(last);
  });
});
