// Route helpers for the project workspace.
//
// Each tab is a real URL under /business-dashboard/my-projects/<slug>/…, but
// that route is shared by every purchased project — including ones that use a
// different component entirely, or no workspace at all. These helpers keep the
// "does this slug have this tab?" question in one place.

import { PROJECT_COMPONENTS, PROJECT_TAB_ACCESS } from './index';
import { BYPASS_PAYWALL } from '@/lib/testingFlags';

export const WORKSPACE_BASE = '/business-dashboard/my-projects';

/** Slugs whose workspace is the HotLeadInBox shell (dashboard/leads/icp/campaigns). */
export const WORKSPACE_SLUGS = Object.keys(PROJECT_TAB_ACCESS);

export const isWorkspaceSlug = (slug) =>
  !!slug && WORKSPACE_SLUGS.includes(String(slug).toLowerCase());

/** True when the slug has any registered component at all (workspace or not). */
export const hasRegisteredComponent = (slug) =>
  !!slug && !!PROJECT_COMPONENTS[String(slug).toLowerCase()];

/** Build a tab URL. 'dashboard' is the project root, not /dashboard. */
export function workspacePath(slug, tab = 'dashboard', rest = '') {
  const base = `${WORKSPACE_BASE}/${slug}`;
  const path = tab === 'dashboard' ? base : `${base}/${tab}`;
  return rest ? `${path}/${rest}` : path;
}

/**
 * Which tabs this slug can reach.
 *
 * Mirrors the shell's own rule: start from the project's own access, then grant
 * anything another purchased project unlocks. `owned` is the list of slugs the
 * user has bought; pass none and you get the project's base access.
 */
export function tabAccessFor(slug, owned = []) {
  // ── PAYWALL (parked for testing — see src/lib/testingFlags.js) ──────────
  // Every tab unlocked, whatever the user has actually bought.
  if (BYPASS_PAYWALL) return { leads: true, campaigns: true };
  // ────────────────────────────────────────────────────────────────────────

  const base = PROJECT_TAB_ACCESS[String(slug || '').toLowerCase()] || { leads: true, campaigns: true };
  const eff = { ...base };
  owned.forEach((s) => {
    const grants = PROJECT_TAB_ACCESS[String(s).toLowerCase()];
    if (!grants) return;
    if (grants.leads) eff.leads = true;
    if (grants.campaigns) eff.campaigns = true;
  });
  return eff;
}

/** Which access flag gates a given tab. Dashboard and settings are always open. */
export const TAB_REQUIRES = {
  dashboard: null,
  settings: null,
  leads: 'leads',
  campaigns: 'campaigns',
  // ICPs belong to campaigns, so they follow campaign access — not leads, or the
  // tab would be locked in exactly the email-only project that needs it.
  icp: 'campaigns',
};

// ── Campaign sub-routes ──────────────────────────────────────────────────────
// Every campaign view is its own URL, so opening a campaign, editing it or
// stepping through the wizard can all be refreshed, shared and navigated back.
export const campaignPaths = (slug) => ({
  list:      workspacePath(slug, 'campaigns'),
  create:    workspacePath(slug, 'campaigns', 'new'),
  templates: workspacePath(slug, 'campaigns', 'templates'),
  lists:     workspacePath(slug, 'campaigns', 'lists'),
  stats:     (id) => workspacePath(slug, 'campaigns', String(id)),
  edit:      (id) => workspacePath(slug, 'campaigns', `${id}/edit`),
});

// ICP detail — one ICP per campaign, so the campaign id addresses it.
export const icpPath = (slug, campaignId) =>
  workspacePath(slug, 'icp', campaignId ? String(campaignId) : '');
