// ⚠️  TEMPORARY — TESTING MODE: PURCHASES ARE OPEN ⚠️
//
// Buying projects, upgrading plans and buying credits are open again so the
// whole buy → own → use path can be tested end to end.
//
// These flows grant everything for FREE — there is no live payment gateway
// behind them yet. Mirrors the backend guard:
//   karya-backend/middleware/purchaseGuard.js  (PURCHASES_ENABLED)
//
// ── TO CLOSE PURCHASES AGAIN ──────────────────────────────────────────────
//   Set NEXT_PUBLIC_PURCHASES_ENABLED=false and rebuild, and set
//   PURCHASES_ENABLED=false on the backend.
//
//   To restore the original "closed unless explicitly opened" behaviour,
//   change the line below back to  === 'true'.
// ──────────────────────────────────────────────────────────────────────────

export const PURCHASES_ENABLED =
  process.env.NEXT_PUBLIC_PURCHASES_ENABLED !== 'false';

// Standard user-facing message when a purchase is attempted while disabled.
export const PURCHASES_DISABLED_MESSAGE = 'Purchases are temporarily unavailable. Please check back soon.';
