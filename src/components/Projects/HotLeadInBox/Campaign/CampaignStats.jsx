'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Users,
  Eye,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  RefreshCw,
  Download,
  CheckCircle,
  Send,
  MessageSquare,
  X
} from 'lucide-react';

// Enhanced scrollbar styles for the campaign stats
const scrollbarStyles = `
  .campaign-stats-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .campaign-stats-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .campaign-stats-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }

  .campaign-stats-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }

  .campaign-stats-scroll::-webkit-scrollbar-corner {
    background: #f3f4f6;
  }
`;

export default function CampaignStats({ campaign, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '7d', '30d'

  // Per-recipient results + follow-up state
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [followUp, setFollowUp] = useState(null); // { segment } while the modal is open
  const [followUpTemplateId, setFollowUpTemplateId] = useState('');
  const [followUpSending, setFollowUpSending] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    if (campaign) {
      fetchCampaignStats();
    }
  }, [campaign, timeRange]);

  useEffect(() => {
    if (campaign) {
      fetchResults('all');
      fetchTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  const fetchCampaignStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/campaigns/${campaign._id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch campaign statistics');
      }
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      setError('Failed to load campaign statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (segment = segmentFilter) => {
    try {
      setResultsLoading(true);
      const res = await fetch(`${API}/campaigns/${campaign._id}/results?segment=${segment}&limit=100`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch (e) {
      console.error('Error fetching campaign results:', e);
    } finally {
      setResultsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/email-templates`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
    } catch (e) {
      console.error('Error fetching templates:', e);
    }
  };

  const changeSegment = (seg) => { setSegmentFilter(seg); fetchResults(seg); };

  /**
   * Open the send dialog for one step of the sequence.
   *
   * The template defaults to whichever was chosen for this step when the
   * campaign was created — that is the copy the customer approved on the ICP,
   * so it should be the starting point rather than an empty dropdown. Falls
   * back to the campaign's primary template for campaigns created before the
   * wizard collected all four.
   */
  const openFollowUp = (segment, sequenceKey) => {
    const chosen = (campaign?.sequenceTemplates || [])
      .find((s) => s.key === sequenceKey)?.templateId;
    const fallback = campaign?.emailTemplateId;
    const preselect = chosen?._id || chosen || fallback?._id || fallback || '';

    setFollowUp({ segment, sequenceKey });
    setFollowUpTemplateId(preselect ? String(preselect) : '');
    setFollowUpMsg('');
  };

  const submitFollowUp = async () => {
    if (!followUp || !followUpTemplateId) return;
    try {
      setFollowUpSending(true);
      setFollowUpMsg('');
      const res = await fetch(`${API}/campaigns/${campaign._id}/follow-up`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ segment: followUp.segment, templateId: followUpTemplateId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFollowUpMsg(data.message || 'Follow-up queued');
        setFollowUp(null);
        setFollowUpTemplateId('');
        setTimeout(() => { fetchResults(segmentFilter); fetchCampaignStats(); }, 1500);
      } else {
        setFollowUpMsg(data.message || 'Failed to send follow-up');
      }
    } catch (e) {
      setFollowUpMsg('Failed to send follow-up');
    } finally {
      setFollowUpSending(false);
    }
  };

  // Per-recipient status pill
  const RecipientStatus = ({ status }) => {
    const opened = ['opened', 'clicked', 'replied'].includes(status);
    const bad = ['bounced', 'spam', 'failed'].includes(status);
    const cls = opened ? 'bg-green-50 text-green-700 border-green-200'
      : bad ? 'bg-red-50 text-red-600 border-red-200'
      : 'bg-gray-50 text-gray-600 border-gray-200';
    const label = ({ opened: 'Opened', clicked: 'Clicked', replied: 'Replied', delivered: 'Delivered', sent: 'Sent', bounced: 'Bounced', spam: 'Spam', failed: 'Failed', pending: 'Pending', queued: 'Queued', sending: 'Sending' })[status] || status;
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{label}</span>;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
      sending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sending' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      paused: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Paused' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Results funnel — the headline answer to "did this campaign work?"
  // Tailwind only keeps class names it can see written out, so every colour is
  // a literal here rather than built from a variable.
  const TONES = {
    slate:   { bar: 'bg-slate-400',   text: 'text-slate-700',   ring: 'border-slate-200' },
    blue:    { bar: 'bg-blue-500',    text: 'text-blue-700',    ring: 'border-blue-200' },
    indigo:  { bar: 'bg-indigo-500',  text: 'text-indigo-700',  ring: 'border-indigo-200' },
    violet:  { bar: 'bg-violet-500',  text: 'text-violet-700',  ring: 'border-violet-200' },
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-700', ring: 'border-emerald-200' },
    green:   { bar: 'bg-green-600',   text: 'text-green-700',   ring: 'border-green-300' },
  };

  const FunnelBar = ({ steps, total }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Results</h3>
        <span className="text-xs text-gray-400">Out of {total} recipients</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((s) => {
          const tone = TONES[s.tone] || TONES.slate;
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <div
              key={s.label}
              className={`rounded-lg border p-3 ${s.highlight ? `${tone.ring} bg-green-50` : 'border-gray-200'}`}
            >
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold ${s.highlight ? tone.text : 'text-gray-900'}`}>
                  {s.value}
                </span>
                <span className="text-xs text-gray-400">{pct}%</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                {s.label}
                {s.approx && (
                  <span
                    title="Measured by a tracking pixel. Apple Mail and some corporate mail servers load images automatically, so the real number is lower."
                    className="cursor-help text-gray-400"
                  >
                    ⚠
                  </span>
                )}
              </div>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className={`${tone.bar} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {steps.find((s) => s.label === 'Replied')?.value === 0 && total > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          No replies recorded yet. Replies are captured from inbound mail, so they
          appear here once someone writes back.
        </p>
      )}
    </div>
  );

  // Metric card component
  const MetricCard = ({ title, value, icon: Icon, color = 'indigo', change, isComplete }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm text-gray-600">{title}</p>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
              {isComplete && <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />}
            </div>
          </div>
        </div>
        <div className={`flex-shrink-0 p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>

      {change && (
        <div className={`flex items-center mt-3 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${change < 0 ? 'transform rotate-180' : ''}`} />
          <span>{Math.abs(change)}% vs last campaign</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading campaign statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Statistics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Back to Campaigns
          </button>
          <button
            onClick={fetchCampaignStats}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { campaign: campaignData, emailStats, summary, rounds = [] } = stats;

  // A campaign is several rounds: one email per contact, then follow-ups to
  // slices of that same list. Counting every round against the contact count
  // produced "6 / 3" — six real emails measured against three contacts.
  //
  // So the funnel counts CONTACTS (the primary send, one row per person), and
  // the follow-up rounds are reported separately underneath.
  const tally = (bucket) => {
    const n = (status) => bucket?.[status] ?? 0;
    const opened = n('opened') + n('clicked') + n('replied');
    const delivered = n('delivered') + opened;
    const sent = n('sent') + delivered + n('bounced') + n('spam');
    return { opened, delivered, sent, total: bucket?.total ?? 0 };
  };

  // Campaigns sent before the per-round split have no `primary` bucket; fall
  // back to the flat totals so their numbers still render.
  const primary = tally(emailStats.primary || emailStats);
  const followUpStats = tally(emailStats.followUp);

  const openedCount = primary.opened;
  const deliveredCount = primary.delivered;
  const sentCount = primary.sent;
  const followUpSent = followUpStats.sent;
  const totalEmailsSent = sentCount + followUpSent;

  // Reply outcomes come from the results endpoint, which counts the classified
  // intent on each reply. They are 0 until the inbound route starts delivering.
  const outcomes = results?.outcomes || {};
  const repliedCount    = outcomes.humanReplies ?? 0;
  const meetingCount    = outcomes.meetingRequest ?? 0;
  const interestedCount = outcomes.interested ?? 0;
  const totalEmails = campaignData.stats?.totalLeads || summary.totalLeads || emailStats.total || 0;
  const getRate = (value, total) => {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  };
  const sentRate = getRate(sentCount, totalEmails);
  const deliveryRate = getRate(deliveredCount, totalEmails);
  const openRate = getRate(openedCount, totalEmails);
  const completionRate = totalEmails > 0
    ? Math.min(100, Math.round(((sentCount + deliveredCount) / (totalEmails * 2)) * 100))
    : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="h-full min-h-0 flex flex-col space-y-4 sm:space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 max-w-full truncate text-xl lg:text-2xl font-bold text-gray-900">{campaignData.name}</h1>
              <StatusBadge status={campaignData.status} />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={fetchCampaignStats}
            className="flex w-full items-center justify-center p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button className="flex w-full items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap sm:w-auto">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className="h-full min-h-0 overflow-y-auto pb-8 pr-1 sm:pr-2 scroll-smooth space-y-4 sm:space-y-6 campaign-stats-scroll"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #F3F4F6'
          }}
        >
          {/* Campaign Overview */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-2 sm:p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-indigo-900">{totalEmails}</div>
            <div className="text-sm text-indigo-700">Total Emails</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-indigo-900">{completionRate}%</div>
            <div className="text-sm text-indigo-700">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* ── Results funnel ──────────────────────────────────────────────────
          Read left to right, it answers the question people actually open this
          page for: did anyone want to talk? Meetings is the last and most
          important step, which is why it gets its own colour.

          Opened is marked approximate on purpose: it is measured by a tracking
          pixel, and Apple Mail Privacy Protection and corporate image proxies
          pre-fetch those, so the real number is lower than it looks. */}
      <FunnelBar
        steps={[
          { label: 'Sent',      value: sentCount,           tone: 'slate' },
          { label: 'Delivered', value: deliveredCount,      tone: 'blue' },
          { label: 'Opened',    value: openedCount,         tone: 'indigo', approx: true },
          { label: 'Replied',   value: repliedCount,        tone: 'violet' },
          { label: 'Interested',value: interestedCount,     tone: 'emerald' },
          { label: 'Meetings',  value: meetingCount,        tone: 'green', highlight: true },
        ]}
        total={totalEmails}
      />

      {/* Supporting detail — all measured per CONTACT, so the denominator is
          the lead list and the numerator can never exceed it. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          title="Contacts emailed"
          value={`${sentCount} / ${totalEmails}`}
          icon={Mail}
          color="blue"
          isComplete={totalEmails > 0 && sentCount >= totalEmails}
        />

        <MetricCard
          title="Delivered"
          value={`${deliveredCount} / ${totalEmails}`}
          icon={Users}
          color="green"
          isComplete={totalEmails > 0 && deliveredCount >= totalEmails}
        />

        <MetricCard
          title="Replies"
          value={`${repliedCount}`}
          icon={MessageSquare}
          color="indigo"
          isComplete={false}
        />
      </div>

      {/* ── Follow-up rounds ──────────────────────────────────────────────────
          Only shown once a follow-up has actually gone out. This is where the
          extra emails live: the funnel above counts people, this counts sends,
          and the two add up here rather than being silently mixed. */}
      {followUpSent > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h3 className="text-sm font-bold text-gray-900">Follow-up rounds</h3>
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-gray-900">{totalEmailsSent}</span> emails sent in
              total — {sentCount} first contact + {followUpSent} follow-up
            </span>
          </div>

          {rounds.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {rounds.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 capitalize truncate">
                      {(r.type || 'follow-up').replace('-', ' ')}
                      {r.segment ? ` → ${String(r.segment).replace('-', ' ')}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.sentAt ? new Date(r.sentAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {r.sentCount} sent
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {followUpSent} follow-up email{followUpSent === 1 ? '' : 's'} sent.
            </p>
          )}
        </div>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>

          <div className="space-y-4">
            {/* Sent Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Sent Rate</span>
                <span className="text-sm font-medium text-gray-900">{sentRate}%</span>
              </div>
              <div className="w-full overflow-hidden bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${sentRate}%` }}
                ></div>
              </div>
            </div>

            {/* Delivery Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Delivery Rate</span>
                <span className="text-sm font-medium text-gray-900">{deliveryRate}%</span>
              </div>
              <div className="w-full overflow-hidden bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${deliveryRate}%` }}
                ></div>
              </div>
            </div>

            {/* Open Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Open Rate</span>
                <span className="text-sm font-medium text-gray-900">{openRate}%</span>
              </div>
              <div className="w-full overflow-hidden bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${openRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Campaign Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>

            <div className="space-y-3">
              <div className="flex min-w-0 items-center text-sm">
                <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                <span className="flex-shrink-0 text-gray-600">Created:</span>
                <span className="ml-1 min-w-0 text-gray-900">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>

              {campaign.startedAt && (
                <div className="flex min-w-0 items-center text-sm">
                  <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                  <span className="flex-shrink-0 text-gray-600">Started:</span>
                  <span className="ml-1 min-w-0 text-gray-900">
                    {new Date(campaign.startedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {campaign.completedAt && (
                <div className="flex min-w-0 items-center text-sm">
                  <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                  <span className="flex-shrink-0 text-gray-600">Completed:</span>
                  <span className="ml-1 min-w-0 text-gray-900">
                    {new Date(campaign.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex min-w-0 items-center text-sm">
                <Zap className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                <span className="flex-shrink-0 text-gray-600">Credits Used:</span>
                <span className="ml-1 min-w-0 text-gray-900">
                  {campaign.totalCreditsConsumed || 0}⚡
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues & Alerts */}
      {(emailStats.bounced > 0 || emailStats.failed > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Issues Detected</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailStats.bounced > 0 && (
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Bounced Emails</div>
                <div className="text-2xl font-bold text-red-600">{emailStats.bounced}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Check for invalid email addresses
                </div>
              </div>
            )}

            {emailStats.failed > 0 && (
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Failed Sends</div>
                <div className="text-2xl font-bold text-red-600">{emailStats.failed}</div>
                <div className="text-xs text-gray-500 mt-1">
                  System or delivery errors
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recipients & Follow-ups ── */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recipients &amp; Follow-ups</h3>
            <p className="text-sm text-gray-500">See who opened, then follow up — all on this campaign.</p>
            {followUpMsg && !followUp && <p className="text-sm text-green-600 mt-1">{followUpMsg}</p>}
          </div>
          {/* The remaining steps of the sequence. Each opens the same dialog,
              pre-loaded with the template chosen for that step when the campaign
              was created — so the default is the copy already approved. */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openFollowUp('opened', 'follow_up')}
              disabled={!results || results.segments.opened === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> Follow up with openers
            </button>
            <button
              onClick={() => openFollowUp('not-opened', 'recall')}
              disabled={!results || results.segments.notOpened === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> Remind non-openers
            </button>
            <button
              onClick={() => openFollowUp('all', 'final')}
              disabled={!results || results.segments.total === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> Final call to everyone
            </button>
          </div>
        </div>

        {results && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All', count: results.segments.total },
              { key: 'opened', label: 'Opened', count: results.segments.opened },
              { key: 'not-opened', label: 'Not opened', count: results.segments.notOpened },
              { key: 'clicked', label: 'Clicked', count: results.segments.clicked },
              { key: 'bounced', label: 'Bounced', count: results.segments.bounced }
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => changeSegment(s.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${segmentFilter === s.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
              >
                {s.label} <span className="ml-1 opacity-80">{s.count}</span>
              </button>
            ))}
          </div>
        )}

        {resultsLoading ? (
          <div className="py-8 text-center text-gray-500 text-sm">Loading recipients…</div>
        ) : results && results.recipients.length > 0 ? (
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Recipient</th>
                  <th className="text-left px-3 py-2 font-semibold">Status</th>
                  <th className="text-left px-3 py-2 font-semibold">Type</th>
                  <th className="text-left px-3 py-2 font-semibold">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.recipients.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 truncate max-w-[220px]">{r.leadName || r.leadEmail}</div>
                      <div className="text-gray-400 text-xs truncate max-w-[220px]">{r.leadEmail}</div>
                    </td>
                    <td className="px-3 py-2"><RecipientStatus status={r.status} /></td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{r.emailType === 'follow-up' ? 'Follow-up' : 'Primary'}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{r.openedAt ? new Date(r.openedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 text-sm">No recipients in this view yet.</div>
        )}
      </div>
        </div>
      </div>
    </div>

    {/* Follow-up template picker modal */}
    {followUp && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !followUpSending && setFollowUp(null)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900">
              {followUp.segment === 'opened' ? 'Follow up with openers'
                : followUp.segment === 'all' ? 'Final call to everyone'
                : 'Remind non-openers'}
            </h3>
            <button onClick={() => setFollowUp(null)} disabled={followUpSending} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Sends to{' '}
            {followUp.segment === 'opened' ? (results?.segments.opened || 0)
              : followUp.segment === 'all' ? (results?.segments.total || 0)
              : (results?.segments.notOpened || 0)}{' '}
            recipient(s) on this campaign.
            {' '}Costs 1 credit per email.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Choose a template</label>
          <select
            value={followUpTemplateId}
            onChange={(e) => setFollowUpTemplateId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-1"
          >
            <option value="">Select a template…</option>
            {templates.map((t) => <option key={t._id} value={t._id}>{t.templateName}</option>)}
          </select>
          <p className="text-xs text-gray-400 mb-4">
            Pre-selected from the template chosen for this step when the campaign
            was created. Change it if you want different copy.
          </p>
          {followUpMsg && <p className="text-sm text-red-600 mb-3">{followUpMsg}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setFollowUp(null)} disabled={followUpSending} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={submitFollowUp}
              disabled={!followUpTemplateId || followUpSending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg inline-flex items-center gap-2"
            >
              {followUpSending ? 'Sending…' : (<><Send className="w-4 h-4" /> Send</>)}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
