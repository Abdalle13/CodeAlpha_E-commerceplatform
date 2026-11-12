import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Shop Collection</Button>);
    expect(screen.getByRole('button', { name: /shop collection/i })).toBeInTheDocument();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button and shows spinner when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-test-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-test-class');
  });
});
