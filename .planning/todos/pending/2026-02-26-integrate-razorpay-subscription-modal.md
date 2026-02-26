---
created: 2026-02-26T07:15:27.535Z
title: Integrate Razorpay Subscription Modal
area: ui
files:
  - app/(dashboard)/billing/page.tsx
  - components/billing/RazorpaySubscriptionModal.tsx
  - lib/razorpay.ts
---

## Problem

The app currently has a billing page but no subscription purchase/upgrade flow. Users need to be able to select a plan and subscribe via Razorpay's subscription API. This is a frontend-only repo — the backend APIs (subscription creation, webhook handling, plan management) need to be implemented separately and then consumed here.

## Solution

1. Load the Razorpay checkout SDK (`<script src="https://checkout.razorpay.com/v1/checkout.js">`) dynamically.
2. Build a `<RazorpaySubscriptionModal>` component that:
   - Accepts `planId`, `subscriptionId` (from backend), `userEmail`, and `onSuccess` / `onFailure` callbacks.
   - Opens the Razorpay checkout in subscription mode (`razorpay_subscription_id`).
   - On `payment.captured` event → calls backend to verify & activate the subscription.
3. Wire up the modal to the billing page's plan selection cards.
4. Backend requirements are documented in `.planning/razorpay-backend-requirements.md` — implement those first before connecting the frontend.

## References

- Backend requirements doc: `.planning/razorpay-backend-requirements.md`
- Razorpay Subscriptions docs: https://razorpay.com/docs/payments/subscriptions/
- Razorpay Checkout JS: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
