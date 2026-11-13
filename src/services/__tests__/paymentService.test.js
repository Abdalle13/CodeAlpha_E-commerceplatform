import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PAYMENT_METHODS,
  PAYMENT_STATE_MACHINE,
  canTransitionPayment,
  generateTransactionReference,
  initiatePayment,
  processSimulation,
  recordPayOnDelivery,
} from '../paymentService';

describe('paymentService - constants & helpers', () => {
  it('defines all required Somali payment methods', () => {
    expect(PAYMENT_METHODS.evc_plus).toBeDefined();
    expect(PAYMENT_METHODS.edahab).toBeDefined();
    expect(PAYMENT_METHODS.zaad).toBeDefined();
    expect(PAYMENT_METHODS.pay_on_delivery).toBeDefined();

    expect(PAYMENT_METHODS.evc_plus.provider).toContain('Hormuud');
    expect(PAYMENT_METHODS.edahab.provider).toContain('Somtel');
    expect(PAYMENT_METHODS.zaad.provider).toContain('Telesom');
  });

  it('generates appropriate USSD transaction references by method', () => {
    const evcRef = generateTransactionReference('evc_plus');
    const edhRef = generateTransactionReference('edahab');
    const zaadRef = generateTransactionReference('zaad');
    const podRef = generateTransactionReference('pay_on_delivery');

    expect(evcRef).toMatch(/^EVC-TX-\d{6}$/);
    expect(edhRef).toMatch(/^EDH-TX-\d{6}$/);
    expect(zaadRef).toMatch(/^ZAAD-TX-\d{6}$/);
    expect(podRef).toMatch(/^POD-REF-\d{6}$/);
  });

  it('enforces valid state machine transitions', () => {
    // Valid transitions
    expect(canTransitionPayment('pending', 'paid')).toBe(true);
    expect(canTransitionPayment('pending', 'failed')).toBe(true);
    expect(canTransitionPayment('pending', 'cancelled')).toBe(true);
    expect(canTransitionPayment('awaiting_delivery_payment', 'paid')).toBe(true);
    expect(canTransitionPayment('failed', 'pending')).toBe(true);
    expect(canTransitionPayment('paid', 'refunded')).toBe(true);

    // Invalid transitions
    expect(canTransitionPayment('paid', 'failed')).toBe(false);
    expect(canTransitionPayment('cancelled', 'paid')).toBe(false);
    expect(canTransitionPayment('refunded', 'paid')).toBe(false);
    expect(canTransitionPayment(null, 'paid')).toBe(false);
  });
});

describe('paymentService - simulation scenarios', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('initiates mobile money payment with pending status', async () => {
    const { data: payment, error } = await initiatePayment({
      orderId: 'ord-123',
      orderNumber: 'HLR-20261113-ABCDE',
      amount: 145.5,
      method: 'evc_plus',
      payerPhone: '+252 61 700 0000',
    });

    expect(error).toBeNull();
    expect(payment).toBeDefined();
    expect(payment.status).toBe('pending');
    expect(payment.amount).toBe(145.5);
    expect(payment.payment_method).toBe('evc_plus');
    expect(payment.provider_metadata.simulation_mode).toBe(true);
  });

  it('initiates pay_on_delivery with awaiting_delivery_payment status', async () => {
    const { data: payment, error } = await recordPayOnDelivery({
      orderId: 'ord-pod',
      orderNumber: 'HLR-20261113-POD01',
      amount: 88.0,
      payerPhone: '+252 61 800 1122',
    });

    expect(error).toBeNull();
    expect(payment.status).toBe('awaiting_delivery_payment');
    expect(payment.payment_method).toBe('pay_on_delivery');
  });

  it('processes approved scenario: transitions to paid with generated ref', async () => {
    const { data: initPay } = await initiatePayment({
      orderId: 'ord-app',
      orderNumber: 'HLR-20261113-APPR1',
      amount: 60.0,
      method: 'evc_plus',
    });

    const { data: processed, error } = await processSimulation({
      paymentId: initPay.id,
      orderId: 'ord-app',
      orderNumber: 'HLR-20261113-APPR1',
      method: 'evc_plus',
      scenario: 'approved',
    });

    expect(error).toBeNull();
    expect(processed.status).toBe('paid');
    expect(processed.transaction_reference).toMatch(/^EVC-TX-\d{6}$/);
    expect(processed.confirmed_at).toBeTruthy();
  });

  it('processes rejected scenario: transitions to failed with failure reason', async () => {
    const { data: initPay } = await initiatePayment({
      orderId: 'ord-rej',
      orderNumber: 'HLR-20261113-REJ01',
      amount: 95.0,
      method: 'zaad',
    });

    const { data: processed, error } = await processSimulation({
      paymentId: initPay.id,
      orderId: 'ord-rej',
      orderNumber: 'HLR-20261113-REJ01',
      method: 'zaad',
      scenario: 'rejected',
    });

    expect(error).toBeNull();
    expect(processed.status).toBe('failed');
    expect(processed.transaction_reference).toBeNull();
    expect(processed.provider_metadata.failure_reason).toBe('insufficient_funds_or_user_declined');
  });

  it('processes timeout scenario: marks timeout and remains pending', async () => {
    const { data: initPay } = await initiatePayment({
      orderId: 'ord-tout',
      orderNumber: 'HLR-20261113-TOUT1',
      amount: 110.0,
      method: 'edahab',
    });

    const { data: processed, error } = await processSimulation({
      paymentId: initPay.id,
      orderId: 'ord-tout',
      orderNumber: 'HLR-20261113-TOUT1',
      method: 'edahab',
      scenario: 'timeout',
    });

    expect(error).toBeNull();
    expect(processed.status).toBe('pending');
    expect(processed.provider_metadata.timeout_at).toBeTruthy();
  });

  it('processes cancelled scenario: marks payment as cancelled', async () => {
    const { data: initPay } = await initiatePayment({
      orderId: 'ord-cnl',
      orderNumber: 'HLR-20261113-CNL01',
      amount: 40.0,
      method: 'evc_plus',
    });

    const { data: processed, error } = await processSimulation({
      paymentId: initPay.id,
      orderId: 'ord-cnl',
      orderNumber: 'HLR-20261113-CNL01',
      method: 'evc_plus',
      scenario: 'cancelled',
    });

    expect(error).toBeNull();
    expect(processed.status).toBe('cancelled');
  });
});
