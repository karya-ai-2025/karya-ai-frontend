// ⚠️  TEMPORARY — TESTING MODE ⚠️
//
// The project paywall is switched OFF so every workspace tab can be reached
// without having bought the project that normally unlocks it.
//
// While BYPASS_PAYWALL is true:
//   • Every workspace tab (Leads, Campaigns, ICP) is unlocked for every project
//   • The "not included / upgrade" screen never appears
//
// The backend has a matching flag that skips the credit checks — the two are
// separate on purpose, so neither silently depends on the other:
//   karya-backend/config/testingFlags.js
//
// ── TO RESTORE THE PAYWALL ────────────────────────────────────────────────
//   Set NEXT_PUBLIC_BYPASS_PAYWALL=false and rebuild, or flip the default
//   below to `=== 'true'`. Then set BYPASS_PAYWALL=false on the backend too.
// ──────────────────────────────────────────────────────────────────────────

export const BYPASS_PAYWALL =
  process.env.NEXT_PUBLIC_BYPASS_PAYWALL !== 'false';
