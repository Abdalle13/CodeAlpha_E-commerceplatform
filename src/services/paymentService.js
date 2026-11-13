/**
 * HILAARA Store – Payment Service & Gateway Dispatcher
 *
 * Implements the Somali mobile money payment dispatcher:
 *   • EVC Plus (Hormuud)
 *   • eDahab (Telesom / Somtel)
 *   • ZAAD (Telesom)
 *   • Pay on Delivery (Doorstep mobile transfer)
 *
 * Implements Adapter Pattern with:
 *   • Explicit simulation controls
 *   • State machine transitions
 *   • Resilient fallback when Supabase is unconfigured / in test mode
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const PAYMENT_METHODS = {
  evc_plus: {
    id: 'evc_plus',
    name: 'EVC Plus',
    provider: 'Hormuud Telecom',
    ussdCode: '*712*',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Somalia’s primary mobile wallet (South & Central Somalia, Mogadishu).',
  },
  edahab: {
    id: 'edahab',
    name: 'eDahab',
    provider: 'Telesom & Somtel',
    ussdCode: '*150*',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Somtel & Dahabshiil network mobile money across all Somali regions.',
  },
  zaad: {
    id: 'zaad',
    name: 'ZAAD Service',
    provider: 'Telesom',
    ussdCode: '*220*',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Telesom mobile payment ecosystem (Somaliland & regional trade hubs).',
  },
  pay_on_delivery: {
    id: 'pay_on_delivery',
    name: 'Pay on Delivery',
    provider: 'Doorstep Courier Mobile Money Transfer',
    ussdCode: null,
    badgeColor: 'bg-warm-ivory text-charcoal border-soft-beige',
    description: 'Pay via direct mobile money transfer to courier merchant number on delivery.',
  },
};

/**
 * Valid state transitions for the payment lifecycle
 */
export const PAYMENT_STATE_MACHINE = {
  pending: ['paid', 'failed', 'cancelled'],
  awaiting_delivery_payment: ['paid', 'cancelled'],
  paid: ['refunded'],
  failed: ['pending'],
  cancelled: [],
  refunded: [],
};

/**
 * Validates whether transition from `fromState` to `toState` is allowed
 */
export function canTransitionPayment(fromState, toState) {
  if (!fromState || !toState) return false;
  if (fromState === toState) return true;
  const allowed = PAYMENT_STATE_MACHINE[fromState] || [];
  return allowed.includes(toState);
}

/**
 * Generates realistic synthetic transaction reference codes
 */
export function generateTransactionReference(method) {
  const rand = Math.floor(100000 + Math.random() * 900000);
  switch (method) {
    case 'evc_plus':
      return `EVC-TX-${rand}`;
    case 'edahab':
      return `EDH-TX-${rand}`;
    case 'zaad':
      return `ZAAD-TX-${rand}`;
    case 'pay_on_delivery':
      return `POD-REF-${rand}`;
    default:
      return `HLR-TX-${rand}`;
  }
}

/**
 * In-memory / session storage simulation fallback for demo mode
 */
const STORAGE_KEY = 'hilaara_demo_payments';

function getStoredPayments() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredPayment(payment) {
  try {
    const all = getStoredPayments();
    all[payment.id] = payment;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('[paymentService] Failed to persist demo payment to sessionStorage:', err);
  }
}

/**
 * Initiates a payment session for an order
 */
export async function initiatePayment({
  orderId,
  orderNumber,
  amount,
  method,
  payerPhone,
}) {
  const paymentRecord = {
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    order_id: orderId,
    order_number: orderNumber,
    payment_method: method,
    amount: Number(amount),
    currency: 'USD',
    status: method === 'pay_on_delivery' ? 'awaiting_delivery_payment' : 'pending',
    transaction_reference: null,
    payer_phone: payerPhone || null,
    provider_metadata: {
      simulation_mode: true,
      initiated_at: new Date().toISOString(),
      provider: PAYMENT_METHODS[method]?.provider || 'Unknown',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          payment_method: method,
          amount: Number(amount),
          currency: 'USD',
          status: paymentRecord.status,
          payer_phone: payerPhone || null,
          provider_metadata: paymentRecord.provider_metadata,
        })
        .select()
        .single();

      if (!error && data) {
        // Record event
        await supabase.from('payment_events').insert({
          payment_id: data.id,
          event_type: 'payment_initiated',
          payload: { order_number: orderNumber, amount, method },
        });

        return { data, error: null };
      }
    } catch (err) {
      console.warn('[paymentService] Supabase insert failed, falling back to simulated storage:', err);
    }
  }

  saveStoredPayment(paymentRecord);
  return { data: paymentRecord, error: null };
}

/**
 * Processes an explicit demo payment scenario
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {string} params.orderId
 * @param {string} params.orderNumber
 * @param {string} params.method
 * @param {'approved'|'rejected'|'timeout'|'cancelled'} params.scenario
 */
export async function processSimulation({
  paymentId,
  orderId,
  orderNumber,
  method,
  scenario,
}) {
  const isApproved = scenario === 'approved';
  const isRejected = scenario === 'rejected';
  const isTimeout = scenario === 'timeout';
  const isCancelled = scenario === 'cancelled';

  let nextStatus = 'pending';
  if (isApproved) nextStatus = 'paid';
  else if (isRejected) nextStatus = 'failed';
  else if (isCancelled) nextStatus = 'cancelled';
  else if (isTimeout) nextStatus = 'pending';

  const txRef = isApproved ? generateTransactionReference(method) : null;
  const now = new Date().toISOString();

  // Try Netlify serverless function first if available in live environment
  try {
    const isNodeEnvTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
    if (!isNodeEnvTest && typeof window !== 'undefined' && window.location?.origin) {
      const fnRes = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          orderId,
          orderNumber,
          method,
          scenario,
          status: nextStatus,
          transactionReference: txRef,
        }),
      });
      if (fnRes.ok) {
        const result = await fnRes.json();
        return { data: result.payment, error: null };
      }
    }
  } catch {
    // Fall through to resilient local handler
  }

  // Update Supabase if configured
  if (isSupabaseConfigured && supabase && paymentId) {
    try {
      const updatePayload = {
        status: nextStatus,
        transaction_reference: txRef,
        updated_at: now,
      };
      if (isApproved) {
        updatePayload.confirmed_at = now;
      }

      const { data: updatedPayment, error: payError } = await supabase
        .from('payments')
        .update(updatePayload)
        .eq('id', paymentId)
        .select()
        .single();

      if (!payError && updatedPayment) {
        // Update order payment_status
        await supabase
          .from('orders')
          .update({
            payment_status: nextStatus,
            order_status: isApproved ? 'confirmed' : 'pending',
            updated_at: now,
          })
          .eq('id', orderId);

        // Record payment event
        await supabase.from('payment_events').insert({
          payment_id: paymentId,
          event_type: `simulation_${scenario}`,
          payload: {
            scenario,
            transaction_reference: txRef,
            timestamp: now,
          },
        });

        return { data: updatedPayment, error: null };
      }
    } catch (err) {
      console.warn('[paymentService] Live update failed, using memory state:', err);
    }
  }

  // Local resilient storage update
  const stored = getStoredPayments();
  const current = stored[paymentId] || {
    id: paymentId || `pay-${Date.now()}`,
    order_id: orderId,
    order_number: orderNumber,
    payment_method: method,
    amount: 0,
    currency: 'USD',
  };

  const updated = {
    ...current,
    status: nextStatus,
    transaction_reference: txRef,
    updated_at: now,
    confirmed_at: isApproved ? now : null,
    provider_metadata: {
      ...current.provider_metadata,
      simulation_scenario: scenario,
      failure_reason: isRejected ? 'insufficient_funds_or_user_declined' : null,
      timeout_at: isTimeout ? now : null,
    },
  };

  saveStoredPayment(updated);
  return { data: updated, error: null };
}

/**
 * Records Pay on Delivery confirmation (sets order to awaiting_delivery_payment)
 */
export async function recordPayOnDelivery({ orderId, orderNumber, amount, payerPhone }) {
  return initiatePayment({
    orderId,
    orderNumber,
    amount,
    method: 'pay_on_delivery',
    payerPhone,
  });
}

/**
 * Retrieves payment record for an order
 */
export async function getPaymentForOrder(orderId) {
  if (isSupabaseConfigured && supabase && orderId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, payment_events(*)')
        .eq('order_id', orderId)
        .maybeSingle();

      if (!error && data) {
        return { data, error: null };
      }
    } catch (err) {
      console.warn('[paymentService] Error fetching order payment:', err);
    }
  }

  const stored = getStoredPayments();
  const match = Object.values(stored).find((p) => p.order_id === orderId);
  return { data: match || null, error: null };
}
