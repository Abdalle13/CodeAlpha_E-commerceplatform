import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DemoPaymentModal } from '../DemoPaymentModal';

describe('DemoPaymentModal', () => {
  const mockOrder = {
    id: 'ord-test-1',
    order_number: 'HLR-20261113-TEST1',
    customer_phone: '+252 61 700 8899',
    total_amount: 140.0,
    payment_method: 'evc_plus',
  };

  const mockPayment = {
    id: 'pay-test-1',
    status: 'pending',
  };

  it('renders prominently labeled demonstration warning banner', () => {
    render(
      <DemoPaymentModal
        isOpen={true}
        order={mockOrder}
        payment={mockPayment}
        onScenarioSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Demonstration Payment Mode Active/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No real money will be deducted from your mobile account/i)
    ).toBeInTheDocument();
  });

  it('renders mobile USSD push dialog details for EVC Plus', () => {
    render(
      <DemoPaymentModal
        isOpen={true}
        order={mockOrder}
        payment={mockPayment}
        onScenarioSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/EVC Plus USSD Push/i)).toBeInTheDocument();
    expect(screen.getByText(/Hormuud Telecom/i)).toBeInTheDocument();
    expect(screen.getByText(/\$140\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/HLR-20261113-TEST1/i)).toBeInTheDocument();
  });

  it('invokes onScenarioSelect when clicking simulation controls', () => {
    const handleScenario = vi.fn();
    render(
      <DemoPaymentModal
        isOpen={true}
        order={mockOrder}
        payment={mockPayment}
        onScenarioSelect={handleScenario}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Simulate Instant Approval/i }));
    expect(handleScenario).toHaveBeenCalledWith('approved');

    fireEvent.click(screen.getByRole('button', { name: /Simulate Reject \/ Low Balance/i }));
    expect(handleScenario).toHaveBeenCalledWith('rejected');

    fireEvent.click(screen.getByRole('button', { name: /Simulate USSD Timeout/i }));
    expect(handleScenario).toHaveBeenCalledWith('timeout');

    fireEvent.click(screen.getByRole('button', { name: /Cancel Transaction/i }));
    expect(handleScenario).toHaveBeenCalledWith('cancelled');
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DemoPaymentModal
        isOpen={false}
        order={mockOrder}
        payment={mockPayment}
        onScenarioSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
