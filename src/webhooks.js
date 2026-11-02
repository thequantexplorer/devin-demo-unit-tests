'use strict';

const crypto = require('node:crypto');
const { WebhookSignatureError } = require('./errors');

const DEFAULT_TOLERANCE_SECONDS = 300;

// The processor signs `${timestamp}.${rawBody}` with HMAC-SHA256 and sends
// the header `Acme-Signature: t=<unix seconds>,v1=<hex digest>`.
function sign(rawBody, secret, timestamp) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

function signatureHeader(rawBody, secret, timestamp) {
  return `t=${timestamp},v1=${sign(rawBody, secret, timestamp)}`;
}

function parseHeader(header) {
  const parts = {};
  for (const piece of String(header).split(',')) {
    const [key, value] = piece.split('=');
    if (key && value) parts[key.trim()] = value.trim();
  }
  return parts;
}

// Returns the parsed event if the signature is valid, otherwise throws WebhookSignatureError.
function verifyWebhook(rawBody, header, secret, { now = () => Date.now(), toleranceSeconds = DEFAULT_TOLERANCE_SECONDS } = {}) {
  if (!secret) throw new Error('Webhook secret is not configured');
  if (!header) throw new WebhookSignatureError('missing_header');

  const { t, v1 } = parseHeader(header);
  if (!t || !v1) throw new WebhookSignatureError('malformed_header');

  const timestamp = Number(t);
  if (!Number.isInteger(timestamp)) throw new WebhookSignatureError('malformed_header');

  const age = Math.floor(now() / 1000) - timestamp;
  if (Math.abs(age) > toleranceSeconds) throw new WebhookSignatureError('timestamp_out_of_range');

  const expected = Buffer.from(sign(rawBody, secret, timestamp), 'hex');
  const received = Buffer.from(v1, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new WebhookSignatureError('signature_mismatch');
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new WebhookSignatureError('invalid_json');
  }
}

module.exports = { sign, signatureHeader, verifyWebhook, DEFAULT_TOLERANCE_SECONDS };
