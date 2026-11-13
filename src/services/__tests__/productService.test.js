import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProductBySlug, getRelatedProducts, getProducts, getCategories } from '../productService';

// Mock the supabase module
vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockNeq = vi.fn();
  const mockNot = vi.fn();
  const mockOrder = vi.fn();
  const mockLimit = vi.fn();
  const mockRange = vi.fn();
  const mockIlike = vi.fn();
  const mockMaybeSingle = vi.fn();

  // Chain builder
  const chain = {
    select: mockSelect,
    eq: mockEq,
    neq: mockNeq,
    not: mockNot,
    order: mockOrder,
    limit: mockLimit,
    range: mockRange,
    ilike: mockIlike,
    maybeSingle: mockMaybeSingle,
  };

  Object.values(chain).forEach((fn) => fn.mockReturnValue(chain));
  mockFrom.mockReturnValue(chain);

  return {
    isSupabaseConfigured: false, // force demo mode — no real DB calls
    supabase: { from: mockFrom },
  };
});

describe('productService — demo mode (Supabase not configured)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProductBySlug returns null and an error when Supabase is not configured', async () => {
    const { data, error } = await getProductBySlug('some-slug');
    expect(data).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/not configured/i);
  });

  it('getRelatedProducts returns empty array when Supabase is not configured', async () => {
    const { data, error } = await getRelatedProducts('prod-123', { gender: 'men' });
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });

  it('getProducts returns empty array and zero count when Supabase is not configured', async () => {
    const { data, count, error } = await getProducts({ gender: 'women', sortBy: 'newest' });
    expect(data).toEqual([]);
    expect(count).toBe(0);
    expect(error).toBeNull();
  });

  it('getCategories returns empty array when Supabase is not configured', async () => {
    const { data, error } = await getCategories();
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });
});

