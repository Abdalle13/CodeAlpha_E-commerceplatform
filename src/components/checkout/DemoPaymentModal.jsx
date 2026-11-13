import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, AlertTriangle, CheckCircle2, XCircle, Clock,
  ArrowRight, RefreshCw, X, ShieldAlert,
} from 'lucide-react';
import { formatPrice, formatSomaliPhone } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../services/paymentService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

/**
 * DemoPaymentModal
 *
 * Explicitly labeled Somali mobile money simulator for EVC Plus, eDahab, and ZAAD.
 * Emulates the mobile push notification / USSD prompt with 4 test scenarios:
 *   1. Approve (Instant Success)
 *   2. Reject (Insufficient Funds / Customer Declined)
 *   3. Timeout (USSD prompt expired)
 *   4. Cancel
 */
export const DemoPaymentModal = ({
  isOpen,
  order,
  payment,
  onScenarioSelect,
  onClose,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'status'
  const [simulationResult, setSimulationResult] = useState(null);

  if (!isOpen || !order) return null;

  const methodConfig = PAYMENT_METHODS[order.payment_method] || PAYMENT_METHODS.evc_plus;
  const merchantNumber = '61 700 8899';
  const displayAmount = formatPrice(order.total_amount);

  const handleScenario = async (scenario) => {
    const result = await onScenarioSelect(scenario);
    if (result) {
      setSimulationResult(result);
      setActiveTab('status');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-soft-beige rounded-xs shadow-2xl max-w-lg w-full overflow-hidden text-charcoal flex flex-col max-h-[92vh]"
        >
          {/* Explicit Amber Demonstration Mode Warning Banner */}
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-amber-900 block uppercase tracking-wider-brand text-[11px]">
                Demonstration Payment Mode Active
              </span>
              <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                No real money will be deducted from your mobile account. Select an interactive test scenario below to simulate the telecommunications gateway response.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-amber-800 hover:text-charcoal p-1 ml-auto -mr-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Emulated Mobile USSD Push Screen */}
            <div className="border border-charcoal/15 rounded-sm p-4 bg-warm-ivory/60 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-charcoal" />
                  <span className="font-sans font-semibold text-xs tracking-wider-brand uppercase text-charcoal">
                    {methodConfig.name} USSD Push
                  </span>
                </div>
                <Badge variant="olive" size="xs">
                  {methodConfig.provider}
                </Badge>
              </div>

              {/* Emulated USSD prompt text */}
              <div className="bg-white border border-soft-beige p-3 rounded-xs space-y-1.5 shadow-inner">
                <div className="text-muted-text text-[11px]">Incoming USSD Prompt:</div>
                <p className="font-semibold text-charcoal text-xs leading-relaxed">
                  "Ma hubtaa inaad <span className="text-muted-olive font-bold">{displayAmount}</span> u wareejiso HILAARA STORE ({merchantNumber})?"
                </p>
                <div className="flex justify-between text-[11px] text-muted-text pt-2 border-t border-soft-beige/70">
                  <span>Payer: {formatSomaliPhone(order.customer_phone)?.formatted || order.customer_phone}</span>
                  <span>Order: {order.order_number}</span>
                </div>
              </div>
            </div>

            {/* Simulation Feedback / Status Screen */}
            {simulationResult ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xs border text-xs space-y-2 ${
                  simulationResult.status === 'paid'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : simulationResult.status === 'failed'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {simulationResult.status === 'paid' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                  {simulationResult.status === 'failed' && <XCircle className="w-4 h-4 text-red-700" />}
                  {simulationResult.status === 'pending' && <Clock className="w-4 h-4 text-amber-700" />}
                  <span className="uppercase tracking-wider-brand text-[11px]">
                    Simulated Result: {simulationResult.status}
                  </span>
                </div>
                {simulationResult.reference && (
                  <p className="font-mono text-[11px]">
                    Transaction Ref: <strong>{simulationResult.reference}</strong>
                  </p>
                )}
                {simulationResult.message && (
                  <p className="text-[11px] leading-relaxed">{simulationResult.message}</p>
                )}
              </motion.div>
            ) : null}

            {/* Scenario Selection Controls */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider-brand text-muted-text block">
                Choose Gateway Scenario to Simulate:
              </span>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {/* 1. Instant Approval */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleScenario('approved')}
                  className="flex items-start gap-2.5 p-3 rounded-xs border border-emerald-600/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition text-charcoal group disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs text-emerald-950 block">
                      Simulate Instant Approval
                    </span>
                    <span className="text-[10px] text-emerald-800 leading-tight block mt-0.5">
                      Approves payment, issues USSD ref, confirms order.
                    </span>
                  </div>
                </button>

                {/* 2. Insufficient Funds / Reject */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleScenario('rejected')}
                  className="flex items-start gap-2.5 p-3 rounded-xs border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-left transition text-charcoal group disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs text-red-950 block">
                      Simulate Reject / Low Balance
                    </span>
                    <span className="text-[10px] text-red-800 leading-tight block mt-0.5">
                      Emulates insufficient wallet balance or PIN decline.
                    </span>
                  </div>
                </button>

                {/* 3. Timeout */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleScenario('timeout')}
                  className="flex items-start gap-2.5 p-3 rounded-xs border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-left transition text-charcoal group disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs text-amber-950 block">
                      Simulate USSD Timeout
                    </span>
                    <span className="text-[10px] text-amber-800 leading-tight block mt-0.5">
                      Simulates 60s prompt expiry without response.
                    </span>
                  </div>
                </button>

                {/* 4. Cancel */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleScenario('cancelled')}
                  className="flex items-start gap-2.5 p-3 rounded-xs border border-soft-beige bg-warm-ivory/80 hover:bg-soft-beige/50 text-left transition text-charcoal group disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-muted-text shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs text-charcoal block">
                      Cancel Transaction
                    </span>
                    <span className="text-[10px] text-muted-text leading-tight block mt-0.5">
                      Aborts payment session and returns to checkout.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="bg-warm-ivory border-t border-soft-beige px-6 py-3 flex items-center justify-between text-xs">
            <span className="text-[11px] text-muted-text flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-muted-olive" />
              WaafiPay / Hormuud Sandbox Interface
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DemoPaymentModal;
