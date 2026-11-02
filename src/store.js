'use strict';

// In-memory store. Production swaps this for Postgres behind the same interface.
function createMemoryStore() {
  const charges = new Map();
  const refunds = new Map();
  const idempotency = new Map();

  return {
    saveCharge(charge) {
      charges.set(charge.id, charge);
      return charge;
    },
    getCharge(id) {
      return charges.get(id) || null;
    },
    saveRefund(refund) {
      refunds.set(refund.id, refund);
      return refund;
    },
    listRefunds(chargeId) {
      return [...refunds.values()].filter((r) => r.chargeId === chargeId);
    },
    getIdempotent(key) {
      return idempotency.get(key) || null;
    },
    setIdempotent(key, chargeId) {
      idempotency.set(key, chargeId);
    },
  };
}

module.exports = { createMemoryStore };
