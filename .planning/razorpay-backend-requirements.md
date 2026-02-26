# Razorpay Subscription — Backend Requirements

> **Context:** This is a frontend-only Next.js repo. All items below must be implemented in the backend service (FastAPI / Node / whatever handles server-side logic) before the frontend can connect the payment flow.

---

## 1. Environment Variables Required

| Variable | Description |
|---|---|
| `RAZORPAY_KEY_ID` | Public key (used on frontend too, safe to expose) |
| `RAZORPAY_KEY_SECRET` | Secret key — **never expose to frontend** |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature secret from Razorpay dashboard |

Frontend will also need `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.local`.

---

## 2. Razorpay Plan & Product Setup (One-time, via Razorpay Dashboard)

- [ ] Create **Plans** in Razorpay dashboard for each tier (e.g., Starter, Pro, Agency).
  - Set billing interval (monthly / annual), amount, currency (`INR`).
  - Note the `plan_id` for each (e.g., `plan_XXXXXXXXXXXXXX`) — frontend needs these.
- [ ] Optionally create a **Product** and attach plans to it.

---

## 3. API Endpoints to Build

### `POST /api/subscriptions/create`

Creates a Razorpay subscription for the authenticated user and returns the `subscription_id` to the frontend so the checkout modal can open.

**Request body:**
```json
{
  "plan_id": "plan_XXXXXXXXXXXXXX",
  "total_count": 12
}
```

**Logic:**
1. Authenticate the user (JWT / session).
2. Call Razorpay API:
   ```
   POST https://api.razorpay.com/v1/subscriptions
   Body: {
     "plan_id": "plan_XXXXXXXXXXXXXX",
     "total_count": 12,
     "quantity": 1,
     "customer_notify": 1,
     "notes": { "user_id": "<your_user_id>" }
   }
   ```
3. Save the `subscription_id` + `status: created` to your DB linked to the user.
4. Return `{ subscription_id, key_id }` to frontend.

**Response:**
```json
{
  "subscription_id": "sub_XXXXXXXXXXXXXX",
  "key_id": "rzp_live_XXXXXX"
}
```

---

### `POST /api/subscriptions/verify`

Called by the frontend **after** a successful Razorpay payment to verify the signature and activate the subscription in your system.

**Request body:**
```json
{
  "razorpay_payment_id": "pay_XXXXXX",
  "razorpay_subscription_id": "sub_XXXXXX",
  "razorpay_signature": "HMAC_SHA256_signature"
}
```

**Logic:**
1. Authenticate the user.
2. Verify HMAC SHA256 signature:
   ```
   expected = HMAC_SHA256(
     key    = RAZORPAY_KEY_SECRET,
     message = razorpay_payment_id + "|" + razorpay_subscription_id
   )
   assert expected == razorpay_signature
   ```
3. If valid → update DB: set `subscription_status = active`, store `payment_id`, `subscription_id`, `current_period_end` (from Razorpay subscription fetch).
4. Return `{ success: true, plan: "pro" }`.

**Response:**
```json
{ "success": true, "plan": "pro", "subscription_id": "sub_XXXXXX" }
```

---

### `GET /api/subscriptions/current`

Returns the current user's active subscription details for the billing page to display.

**Response:**
```json
{
  "plan": "pro",
  "status": "active",
  "subscription_id": "sub_XXXXXX",
  "current_period_end": "2026-03-26T00:00:00Z",
  "cancel_at_period_end": false
}
```

---

### `POST /api/subscriptions/cancel`

Cancels the subscription at period end.

**Request body:**
```json
{ "subscription_id": "sub_XXXXXX" }
```

**Logic:**
1. Call Razorpay: `POST /v1/subscriptions/{id}/cancel` with `{ "cancel_at_cycle_end": 1 }`.
2. Update DB: set `cancel_at_period_end = true`.

---

## 4. Webhook Handler

### `POST /webhooks/razorpay`

Handles async events from Razorpay. **Must be unauthenticated** (Razorpay calls it directly).

**Verify every webhook:**
```python
import hmac, hashlib

expected = hmac.new(
    key=RAZORPAY_WEBHOOK_SECRET.encode(),
    msg=raw_body,
    digestmod=hashlib.sha256
).hexdigest()

assert expected == request.headers["X-Razorpay-Signature"]
```

**Events to handle:**

| Event | Action |
|---|---|
| `subscription.activated` | Mark subscription active in DB |
| `subscription.charged` | Record successful renewal, extend `current_period_end` |
| `subscription.pending` | Mark as payment pending, notify user |
| `subscription.halted` | Mark halted (too many failed retries), downgrade user plan |
| `subscription.cancelled` | Mark cancelled, revoke access at period end |
| `subscription.completed` | Mark completed (fixed-count plan finished) |
| `payment.failed` | Log failure, optionally notify user |

---

## 5. Database Schema Changes

Add to your users / subscriptions table:

```sql
CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id),
  razorpay_sub_id      TEXT UNIQUE NOT NULL,
  razorpay_plan_id     TEXT NOT NULL,
  plan_name            TEXT NOT NULL,           -- 'starter' | 'pro' | 'agency'
  status               TEXT NOT NULL,           -- 'created' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired'
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Plan ID → Feature Mapping

Define this in your backend so the frontend can request the right plan. Suggested structure (store in DB or config):

```json
{
  "starter": {
    "plan_id": "plan_XXXXXXX",
    "price_monthly": 999,
    "price_annual": 9999,
    "limits": { "content_per_month": 20, "seats": 1 }
  },
  "pro": {
    "plan_id": "plan_YYYYYYY",
    "price_monthly": 2999,
    "price_annual": 29999,
    "limits": { "content_per_month": 100, "seats": 5 }
  },
  "agency": {
    "plan_id": "plan_ZZZZZZZ",
    "price_monthly": 7999,
    "price_annual": 79999,
    "limits": { "content_per_month": -1, "seats": -1 }
  }
}
```

---

## 7. Razorpay Dashboard Checklist

- [ ] Register webhook URL: `https://yourdomain.com/webhooks/razorpay`
- [ ] Enable webhook events: `subscription.*`, `payment.failed`
- [ ] Copy Webhook Secret → add to backend env as `RAZORPAY_WEBHOOK_SECRET`
- [ ] Set logo, brand name, theme color in Razorpay settings (shows in modal)
- [ ] Test end-to-end with Razorpay test mode keys before going live

---

## 8. Frontend Contract (What Frontend Expects)

Once backend is ready, the frontend will:

1. Call `GET /api/subscriptions/current` on billing page load to show current plan.
2. On plan selection → call `POST /api/subscriptions/create` → receive `subscription_id`.
3. Open Razorpay modal with `subscription_id`.
4. On success → call `POST /api/subscriptions/verify` with `razorpay_payment_id`, `razorpay_subscription_id`, `razorpay_signature`.
5. Refresh billing page state on success.

All endpoints should be authenticated via the same auth mechanism the frontend already uses (cookie/JWT).
