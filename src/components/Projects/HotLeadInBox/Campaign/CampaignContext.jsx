'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { apiBaseUrl } from '../shared';

/**
 * Shared state for the campaigns section.
 *
 * The campaign views are separate routes now, so the header/stats chrome lives in
 * campaigns/layout.jsx and the pages read what they need from here rather than
 * from props — a Next.js layout can't pass props to the page it wraps.
 */
const initialStats = {
  totalCampaigns: 0,
  activeCampaigns: 0,
  totalEmailsSent: 0,
  totalCreditsUsed: 0,
  averageOpenRate: 0,
  averageClickRate: 0,
};

const CampaignContext = createContext(null);

export function CampaignProvider({ children }) {
  const [campaignStats, setCampaignStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBaseUrl}/campaigns/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) setCampaignStats({ ...initialStats, ...(data.data?.stats || data.data || {}) });
      else setError(data.message || 'Failed to load campaigns');
    } catch (e) {
      setError(e.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  return (
    <CampaignContext.Provider
      value={{ campaignStats, loading, error, fetchDashboardData }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaigns must be used inside the campaigns layout');
  return ctx;
}

/**
 * Load one campaign by id.
 *
 * The id now comes from the URL rather than from a click, so opening or
 * refreshing /campaigns/<id> has to be able to fetch it on its own.
 */
export function useCampaign(campaignId) {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!campaignId) { setLoading(false); return undefined; }
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`${apiBaseUrl}/campaigns/${campaignId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.success) setCampaign(data.data);
        else setError(data.message || 'Campaign not found');
      })
      .catch((e) => { if (active) setError(e.message || 'Campaign not found'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [campaignId]);

  return { campaign, loading, error };
}

export default CampaignContext;
