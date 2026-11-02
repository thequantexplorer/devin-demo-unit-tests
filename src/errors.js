'use strict';

class PaymentError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
  }
}

class WebhookSignatureError extends Error {
  constructor(reason) {
    super(`Invalid webhook signature: ${reason}`);
    this.name = 'WebhookSignatureError';
    this.reason = reason;
  }
}

module.exports = { PaymentError, WebhookSignatureError };
