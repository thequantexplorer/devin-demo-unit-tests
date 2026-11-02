'use strict';

const { PaymentError } = require('./errors');
const { createMemoryStore } = require('./store');

const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp'];
const MAX_CHARGE_CENTS = 1_000_000_00;

function validateAmount(amount) {
  if (!Number.isInteger(amount)) {
    throw new PaymentError('invalid_amount', 'Amount must be a whole number of cents');
  }
  if (amount <= 0) {
    throw new PaymentError('invalid_amount', 'Amount must be greater than zero');
  }
}

function sequentialIds() {
  let n = 0;
  return (prefix) => `${prefix}_${String(++n).padStart(6, '0')}`;
}

function createPayments({ store = createMemoryStore(), now = () => Date.now(), newId = sequentialIds() } = {}) {
  function charge({ amount, currency, customerId, idempotencyKey } = {}) {
    if (idempotencyKey) {
      const existingId = store.getIdempotent(idempotencyKey);
      if (existingId) return store.getCharge(existingId);
    }

    validateAmount(amount);
    if (amount > MAX_CHARGE_CENTS) {
      throw new PaymentError('amount_too_large', 'Amount is over the single charge limit');
    }
    const cur = String(currency || '').toLowerCase();
    if (!SUPPORTED_CURRENCIES.includes(cur)) {
      throw new PaymentError('unsupported_currency', `Currency "${currency}" is not supported`);
    }
    if (!customerId) {
      throw new PaymentError('missing_customer', 'customerId is required');
    }

    const record = store.saveCharge({
      id: newId('ch'),
      amount,
      currency: cur,
      customerId,
      refunded: 0,
      status: 'succeeded',
      createdAt: now(),
    });
    if (idempotencyKey) store.setIdempotent(idempotencyKey, record.id);
    return record;
  }

  // Refund part or all of a charge. With no amount, refunds whatever is left.
  function refund(chargeId, amount) {
    const existing = store.getCharge(chargeId);
    if (!existing) {
      throw new PaymentError('charge_not_found', `No charge with id ${chargeId}`);
    }
    if (existing.status === 'refunded') {
      throw new PaymentError('already_refunded', 'This charge has already been fully refunded');
    }

    const refundAmount = amount === undefined ? existing.amount - existing.refunded : amount;
    validateAmount(refundAmount);
    if (refundAmount > existing.amount) {
      throw new PaymentError('refund_exceeds_charge', 'Refund is larger than the amount left on the charge');
    }

    const refunded = existing.refunded + refundAmount;
    const updated = store.saveCharge({
      ...existing,
      refunded,
      status: refunded === existing.amount ? 'refunded' : 'partially_refunded',
    });
    const record = store.saveRefund({
      id: newId('re'),
      chargeId,
      amount: refundAmount,
      createdAt: now(),
    });
    return { refund: record, charge: updated };
  }

  function getCharge(chargeId) {
    return store.getCharge(chargeId);
  }

  function listRefunds(chargeId) {
    return store.listRefunds(chargeId);
  }

  return { charge, refund, getCharge, listRefunds };
}

module.exports = { createPayments, SUPPORTED_CURRENCIES, MAX_CHARGE_CENTS };
