import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, formatSomaliPhone } from '../formatters';

describe('formatPrice', () => {
  it('formats positive decimal numbers into exact USD currency', () => {
    expect(formatPrice(45.5)).toBe('$45.50');
    expect(formatPrice(120)).toBe('$120.00');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles string input cleanly', () => {
    expect(formatPrice('89.99')).toBe('$89.99');
  });

  it('falls back to $0.00 for invalid inputs', () => {
    expect(formatPrice(null)).toBe('$0.00');
    expect(formatPrice(undefined)).toBe('$0.00');
    expect(formatPrice('abc')).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats ISO date strings properly', () => {
    const formatted = formatDate('2026-11-12T12:00:00Z');
    expect(formatted).toContain('Nov');
    expect(formatted).toContain('2026');
  });

  it('returns empty string for invalid dates', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('invalid-date')).toBe('');
  });
});

describe('formatSomaliPhone', () => {
  it('identifies Hormuud / EVC Plus numbers', () => {
    const res = formatSomaliPhone('+252 61 555 1234');
    expect(res.isValid).toBe(true);
    expect(res.provider).toBe('EVC Plus (Hormuud)');
    expect(res.formatted).toContain('+252 61');
  });

  it('identifies Telesom / ZAAD numbers', () => {
    const res = formatSomaliPhone('0634445555');
    expect(res.isValid).toBe(true);
    expect(res.provider).toBe('ZAAD / eDahab (Telesom)');
  });

  it('rejects invalid numbers', () => {
    const res = formatSomaliPhone('12345');
    expect(res.isValid).toBe(false);
  });
});
