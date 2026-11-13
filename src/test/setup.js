import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// IntersectionObserver is not implemented in jsdom.
// Framer Motion's whileInView relies on it. Provide a no-op mock so tests pass.
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ResizeObserver is also absent in jsdom (used by some layout components).
globalThis.ResizeObserver = class ResizeObserver {
  constructor(callback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// window.scrollTo is not implemented in jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

