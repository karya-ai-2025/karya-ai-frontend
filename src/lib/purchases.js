// Purchases (buying projects, upgrading plans, buying credits) are disabled
// until a live payment gateway is in place. This matches the backend guard
// (PURCHASES_ENABLED). To re-enable in the UI, set
// NEXT_PUBLIC_PURCHASES_ENABLED=true and rebuild.
export const PURCHASES_ENABLED = process.env.NEXT_PUBLIC_PURCHASES_ENABLED === 'true';

// Standard user-facing message when a purchase is attempted while disabled.
export const PURCHASES_DISABLED_MESSAGE = 'Purchases are temporarily unavailable. Please check back soon.';
