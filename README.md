# acme-payments

The payments module behind Acme's checkout. It creates charges, refunds them, and checks the signature on webhooks from the card processor.

It has no tests yet, so the coverage check fails.

```sh
npm install
npm test           # runs the tests in test/ (there are none yet)
npm run coverage   # runs the tests and fails if line coverage is under 90%
```

The **Tests** GitHub Action runs both commands on every push and pull request.

## Layout

- `src/payments.js`: `charge()`, `refund()`, `getCharge()`, `listRefunds()`
- `src/webhooks.js`: `verifyWebhook()`, `sign()`, `signatureHeader()`
- `src/store.js`: in-memory store (production uses Postgres behind the same interface)
- `src/errors.js`: `PaymentError` (with a `code`) and `WebhookSignatureError` (with a `reason`)

Tests use Node's built-in test runner (`node:test` and `node:assert`). Put them in `test/` and name them `*.test.js`. `createPayments()` takes `now` and `newId` options, so tests can fix the clock and the ids.

## Money rules

- Amounts are whole numbers of cents and must be greater than zero.
- A single charge can be at most 1,000,000.00 (100,000,000 cents).
- Supported currencies: `usd`, `eur`, `gbp` (any case).
- A charge with an idempotency key that was already used returns the first charge, and does not create a new one.
- A refund with no amount refunds whatever is left on the charge.
- The total of all refunds on a charge can never be more than the charge amount.
- A charge that is fully refunded has status `refunded`. A charge with some money refunded has status `partially_refunded`.

## Webhook rules

- The header is `Acme-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">`.
- Signatures are compared in constant time.
- Webhooks older or newer than 5 minutes are rejected.

---

This repo is a starter for a Devin demo. See [DEVIN_DEMO.md](DEVIN_DEMO.md) for setup and the prompt.
