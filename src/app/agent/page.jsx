'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import TopNavbar from '@/components/TopNavbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp,
  Loader2,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  LifeBuoy,
  Target,
  CheckCircle2,
  PencilLine,
  CalendarDays,
  BarChart3,
  Link,
} from 'lucide-react';
import * as conversationApi from '@/services/conversationApi';
import * as agentApi from '@/services/agentApi';

function KaryaLogo({ size = 28, className = '' }) {
  return (
    <Image
      src="/karya-ai-logo.png"
      alt="Karya AI"
      width={size}
      height={size}
      className={`rounded-lg object-contain ${className}`}
    />
  );
}

function ChatSidebar({ isOpen, onToggle, conversations, activeId, onSelect, onNew, onDelete, isLoading }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`flex flex-col bg-gray-900 text-white transition-all duration-300 shrink-0 ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <KaryaLogo size={28} />
            <span className="text-sm font-semibold whitespace-nowrap">Karya AI</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors text-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider px-2 pt-2 pb-1">
            Recent
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 py-4 text-center">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeId === conversation._id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <button
                  onClick={() => onSelect(conversation._id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(conversation._id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-600 transition-all shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

function SignupPrompt({ agentState, onSignup, isSubmitting }) {
  const [password, setPassword] = useState('');
  const identity = agentState?.identity || {};
  const role = agentState?.userType === 'expert' ? 'expert' : 'owner';

  const handleSubmit = (event) => {
    event.preventDefault();
    onSignup({
      fullName: identity.name,
      email: identity.email,
      phone: identity.phone,
      role,
      password
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 max-w-sm rounded-lg border border-blue-100 bg-blue-50 p-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Create password
      </label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        placeholder="Minimum 8 characters"
        disabled={isSubmitting}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isSubmitting || password.length < 8}
        className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}

function ChoicePrompt({ uiRequest, onChoose, disabled }) {
  if (uiRequest?.type !== 'choice') return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {uiRequest.options?.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChoose(option.message || option.label)}
          disabled={disabled}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function GoalConfirmationPrompt({ uiRequest, onChoose, disabled }) {
  if (uiRequest?.type !== 'goal_confirmation') return null;

  const goal = uiRequest.goal || {};

  return (
    <div className="mt-3 max-w-md rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 rounded-lg bg-blue-50 p-1.5 text-blue-700">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Goal
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {goal.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
            {goal.targetMetric && (
              <span className="rounded-md bg-gray-100 px-2 py-1">
                {goal.targetMetric}
              </span>
            )}
            {goal.timeframeDays && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
                <CalendarDays className="h-3 w-3" />
                {goal.timeframeDays} days
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoose('Confirm goal')}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Confirm
        </button>
        <button
          type="button"
          onClick={() => onChoose('Revise goal')}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Revise
        </button>
      </div>
    </div>
  );
}

function DiagnosticIntakePrompt({
  uiRequest,
  agentState,
  onRun,
  onSaveWebsite,
  disabled,
  websiteLoading
}) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  if (uiRequest?.type !== 'diagnostic_intake') return null;

  const evidence = agentState?.businessEvidence || {};
  const websitesCount = evidence.websites?.length || uiRequest.websitesCount || 0;
  const hasTypedWebsite = Boolean(websiteUrl.trim());

  return (
    <div className="mt-3 max-w-md rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Business review
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="rounded-md bg-gray-100 px-2 py-1">
              {websitesCount} website{websitesCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const trimmedUrl = websiteUrl.trim();
            if (!trimmedUrl) return;
            onSaveWebsite(trimmedUrl);
            setWebsiteUrl('');
          }}
          className="flex min-w-full gap-2"
        >
          <input
            type="text"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://company.com"
            disabled={disabled || websiteLoading}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disabled || websiteLoading || !websiteUrl.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {websiteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link className="h-3.5 w-3.5" />}
            Share website
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            const trimmedUrl = websiteUrl.trim();
            if (trimmedUrl) {
              onSaveWebsite(trimmedUrl);
              setWebsiteUrl('');
              return;
            }
            onRun('Continue without website');
          }}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          {hasTypedWebsite ? 'Review website first' : 'Continue without website'}
        </button>
      </div>
    </div>
  );
}

function BusinessReviewPrompt({ uiRequest, onChoose, disabled }) {
  if (uiRequest?.type !== 'business_review') return null;

  const review = uiRequest.businessReview || {};
  const helpAreas = Array.isArray(review.helpAreas) ? review.helpAreas : [];

  return (
    <div className="mt-3 max-w-2xl rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Where Karya AI can help
          </p>
          {review.summary && (
            <p className="mt-1 text-sm text-gray-700">
              {review.summary}
            </p>
          )}
          <div className="mt-3 space-y-2">
            {helpAreas.map((area, index) => (
              <div key={`${area.title}-${index}`} className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs font-semibold text-gray-900">
                  {index + 1}. {area.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {area.whyItMatters}
                </p>
                {area.project && (
                  <a
                    href={area.project.marketplaceUrl || `/project-marketplace/${area.project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Project: {area.project.title}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoose('Generate Plan')}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Generate Plan
        </button>
      </div>
    </div>
  );
}

function PlanSummaryPrompt({ uiRequest }) {
  if (uiRequest?.type !== 'plan_summary') return null;

  const plan = uiRequest.plan || {};
  const timeline = Array.isArray(plan.timeline) ? plan.timeline : [];
  const kpis = Array.isArray(plan.kpis) ? plan.kpis : [];
  const recommendedProjects = Array.isArray(plan.recommendedProjects) ? plan.recommendedProjects : [];
  const ppt = plan.ppt || null;

  return (
    <div className="mt-3 max-w-2xl rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 rounded-lg bg-blue-50 p-1.5 text-blue-700">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            30-60-90 plan
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {plan.summary}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {timeline.map((item) => (
          <div key={item.phase} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
            <p className="text-xs font-semibold text-gray-900">{item.phase}</p>
            <p className="mt-1 text-xs text-gray-600">{item.focus}</p>
          </div>
        ))}
      </div>

      {kpis.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          {kpis.map((kpi) => (
            <span key={`${kpi.name}-${kpi.target}`} className="rounded-md bg-gray-100 px-2 py-1">
              {kpi.name}: {kpi.target}
            </span>
          ))}
        </div>
      )}

      {recommendedProjects.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Recommended projects
          </p>
          <div className="mt-2 space-y-2">
            {recommendedProjects.map((project) => (
              <a
                key={project.slug || project.title}
                href={project.marketplaceUrl || `/project-marketplace/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-100 bg-gray-50 p-2 hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-900">
                      {project.priority ? `${project.priority}. ` : ''}{project.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {project.rationale}
                    </p>
                  </div>
                  <div className="shrink-0 space-y-1 text-right">
                    {project.priority === 1 && (
                      <span className="block rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white">
                        Start here
                      </span>
                    )}
                    <span className="block rounded-md bg-white px-2 py-1 text-[11px] font-medium text-blue-700">
                      {project.phase || 'Start'}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {ppt?.base64 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <a
            href={`data:${ppt.mimeType};base64,${ppt.base64}`}
            download={ppt.fileName || 'karya-ai-growth-plan.pptx'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Download PPT
          </a>
        </div>
      )}
    </div>
  );
}

function ProjectMatchPrompt({ uiRequest }) {
  if (uiRequest?.type !== 'project_match') return null;

  const projectMatch = uiRequest.projectMatch || {};
  const matches = Array.isArray(projectMatch.matches) ? projectMatch.matches : [];

  return (
    <div className="mt-3 max-w-2xl rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 rounded-lg bg-blue-50 p-1.5 text-blue-700">
          <Link className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Recommended projects
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {matches.length > 0
              ? 'These Karya marketplace projects best match what you asked for.'
              : 'No strong project match found yet.'}
          </p>
        </div>
      </div>

      {matches.length > 0 ? (
        <div className="mt-3 space-y-2">
          {matches.map((project) => (
            <a
              key={project.slug || project.title}
              href={project.marketplaceUrl || `/project-marketplace/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-gray-100 bg-gray-50 p-3 hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {project.priority ? `${project.priority}. ` : ''}{project.title}
                  </p>
                  {project.tagline && (
                    <p className="mt-1 text-xs font-medium text-blue-700">
                      {project.tagline}
                    </p>
                  )}
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    {project.rationale}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-blue-700">
                  {project.category || 'Project'}
                </span>
              </div>

              {Array.isArray(project.kpiSignals) && project.kpiSignals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.kpiSignals.map((signal) => (
                    <span key={signal} className="rounded-md bg-white px-2 py-1 text-[11px] text-gray-600">
                      {signal}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-gray-50 p-2 text-xs leading-relaxed text-gray-600">
          Try asking with the workflow or target outcome, for example: lead generation, outreach, conversion, customer research, content, or follow-up.
        </p>
      )}
    </div>
  );
}

function EvidenceReviewPrompt({ uiRequest, agentState, onChoose, disabled }) {
  if (uiRequest?.type !== 'evidence_review') return null;

  const evidence = uiRequest.businessEvidence || agentState?.businessEvidence || {};
  const websites = evidence.websites || [];
  const items = websites.map((item) => ({
    id: item.evidenceId || item.url,
    title: item.url,
    summary: item.summary
  })).filter((item) => item.summary);

  return (
    <div className="mt-3 max-w-2xl rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
          <Link className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Website summary
          </p>
          <div className="mt-2 space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg bg-gray-50 p-2">
                <p className="truncate text-xs font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoose('Confirm website summary and create plan')}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Confirm and create
        </button>
        <button
          type="button"
          onClick={() => onChoose('Edit evidence summary')}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Edit summary
        </button>
      </div>
    </div>
  );
}

function AgentChat({ sidebarOpen, onToggleSidebar, conversationId, onTitleUpdate, onConversationCreated }) {
  const { user, register } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [clientState, setClientState] = useState(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setClientState(null);
      return;
    }

    const loadConversation = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await conversationApi.getConversation(conversationId);
        const conversation = res.data;
        const agentState = conversation.agentState || null;
        const mappedMessages = (conversation.messages || []).map((message) => ({
            role: message.role,
            message: message.content,
          }));

        if (agentState?.uiRequest && mappedMessages.length > 0) {
          const lastAgentIndex = mappedMessages.map((message) => message.role).lastIndexOf('agent');
          if (lastAgentIndex >= 0) {
            mappedMessages[lastAgentIndex] = {
              ...mappedMessages[lastAgentIndex],
              uiRequest: agentState.uiRequest
            };
          }
        }

        const welcomeBackMessage = agentState?.memorySummary?.welcomeBackMessage;
        const shouldShowWelcomeBack = Boolean(
          welcomeBackMessage
          && mappedMessages.length > 0
          && !agentState?.missingField
          && !['onboarding', 'goal_definition'].includes(agentState?.phase)
        );

        if (shouldShowWelcomeBack) {
          mappedMessages.push({
            role: 'agent',
            message: welcomeBackMessage,
            uiRequest: agentState.uiRequest || null
          });
        }

        setClientState(agentState);
        setMessages(mappedMessages);
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setMessages([]);
        setClientState(null);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const addAgentResponse = ({ activeId, text, responseData, createdConversation }) => {
    const agentMessage = responseData.assistantMessage;
    const state = responseData.state;
    const returnedConversationId = responseData.conversationId;

    if (state) {
      setClientState(state);
    }

    if (returnedConversationId && !activeId) {
      conversationIdRef.current = returnedConversationId;
      onConversationCreated?.({
        _id: returnedConversationId,
        title: text.substring(0, 100) || 'Karya agent onboarding',
        lastActivityAt: new Date().toISOString()
      });
    }

    if (!activeId || conversationIdRef.current === activeId || conversationIdRef.current === returnedConversationId) {
      setMessages((prev) => [
        ...prev,
        {
          role: agentMessage.role,
          message: agentMessage.content,
          uiRequest: state?.uiRequest || null
        },
      ]);
    }

    if (createdConversation) {
      onConversationCreated?.(createdConversation);
    } else if (returnedConversationId && text) {
      onTitleUpdate(returnedConversationId, text.substring(0, 100));
    }
  };

  const sendTextToAgent = async (text) => {
    if (!text || isTyping) return;

    setInputText('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: 'user', message: text }]);

    let createdConversation = null;

    try {
      let activeId = conversationIdRef.current;
      const response = await agentApi.sendAgentChat({
        conversationId: activeId,
        message: text,
        clientState
      });

      addAgentResponse({
        activeId,
        text,
        responseData: response.data,
        createdConversation
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      if (createdConversation) {
        onConversationCreated?.(createdConversation);
      }
      setMessages((prev) => [
        ...prev,
        { role: 'system', message: err.message || 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleSendText = async (event) => {
    event.preventDefault();
    const text = (inputRef.current?.value || inputText).trim();
    await sendTextToAgent(text);
  };

  const handleSignup = async (userData) => {
    if (!userData.fullName || !userData.email || !userData.phone) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', message: 'Please provide name, email, and phone before creating the account.' },
      ]);
      return;
    }

    setSignupLoading(true);
    try {
      const result = await register(userData);
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'system', message: 'Account created. Continuing onboarding with saved conversation.' },
      ]);

      const response = await agentApi.sendAgentChat({
        conversationId: null,
        message: 'Continue onboarding after account creation.',
        clientState
      });

      addAgentResponse({
        activeId: null,
        text: 'Karya agent onboarding',
        responseData: response.data
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', message: err.message || 'Registration failed. Please try again.' },
      ]);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSaveWebsite = async (url) => {
    setWebsiteLoading(true);
    try {
      await sendTextToAgent(url);
    } finally {
      setWebsiteLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendText(event);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {!sidebarOpen && (
        <div className="absolute top-auto left-0 z-10 p-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 bg-gray-900 cursor-pointer"
            title="Open sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Loading conversation...</p>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center ring-4 ring-gray-100">
                <KaryaLogo size={72} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <LifeBuoy className="h-3.5 w-3.5 text-white" />
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Karya AI Support</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              How can I help today?
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, index) => {
              if (msg.role === 'system') {
                return (
                  <div key={`${msg.role}-${index}`} className="flex justify-center py-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              const isAgent = msg.role === 'agent';
              const isLatest = index === messages.length - 1;

              return (
                <div key={`${msg.role}-${index}`} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                  {isAgent ? (
                    <div className="w-7 h-7 shrink-0 mt-0.5">
                      <KaryaLogo size={28} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-semibold text-white">
                        {getUserInitials(user?.fullName)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] text-sm leading-relaxed ${
                      isAgent
                        ? 'text-gray-800'
                        : 'bg-gray-100 px-4 py-3 rounded-2xl text-gray-800'
                    }`}
                  >
                    {isAgent ? (
                      <div className="prose prose-sm prose-gray max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>p:last-child]:mb-0 [&>ul:last-child]:mb-0 [&>ol:last-child]:mb-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.message}
                        </ReactMarkdown>
                        {isLatest && msg.uiRequest?.type === 'choice' && (
                          <ChoicePrompt
                            uiRequest={msg.uiRequest}
                            onChoose={sendTextToAgent}
                            disabled={isTyping}
                          />
                        )}
                        {isLatest && msg.uiRequest?.type === 'goal_confirmation' && (
                          <GoalConfirmationPrompt
                            uiRequest={msg.uiRequest}
                            onChoose={sendTextToAgent}
                            disabled={isTyping}
                          />
                        )}
                        {isLatest && msg.uiRequest?.type === 'diagnostic_intake' && (
                          <DiagnosticIntakePrompt
                            uiRequest={msg.uiRequest}
                            agentState={clientState}
                            onRun={sendTextToAgent}
                            onSaveWebsite={handleSaveWebsite}
                            disabled={isTyping}
                            websiteLoading={websiteLoading}
                          />
                        )}
                        {isLatest && msg.uiRequest?.type === 'evidence_review' && (
                          <EvidenceReviewPrompt
                            uiRequest={msg.uiRequest}
                            agentState={clientState}
                            onChoose={sendTextToAgent}
                            disabled={isTyping}
                          />
                        )}
                        {isLatest && msg.uiRequest?.type === 'business_review' && (
                          <BusinessReviewPrompt
                            uiRequest={msg.uiRequest}
                            onChoose={sendTextToAgent}
                            disabled={isTyping}
                          />
                        )}
                        {isLatest && msg.uiRequest?.type === 'plan_summary' && (
                          <PlanSummaryPrompt uiRequest={msg.uiRequest} />
                        )}
                        {isLatest && msg.uiRequest?.type === 'project_match' && (
                          <ProjectMatchPrompt uiRequest={msg.uiRequest} />
                        )}
                        {isLatest && msg.uiRequest?.type === 'secure_signup' && (
                          <SignupPrompt
                            agentState={clientState}
                            onSignup={handleSignup}
                            isSubmitting={signupLoading}
                          />
                        )}
                      </div>
                    ) : (
                      msg.message
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 shrink-0 mt-0.5">
                  <KaryaLogo size={28} />
                </div>
                <div className="flex items-center gap-1 py-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSendText} className="flex items-end gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onInput={(event) => setInputText(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Karya AI Support..."
              rows={1}
              disabled={isTyping}
              className="flex-1 resize-none bg-transparent py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isTyping}
              className={`p-1.5 rounded-lg transition-all shrink-0 mb-0.5 ${
                !isTyping && inputText.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-white cursor-default'
              }`}
              title="Send message"
            >
              {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AgentPage() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingConversations(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        const response = await conversationApi.getConversations();
        setConversations(response.data || []);
        if (response.data && response.data.length > 0) {
          setActiveConversationId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [isAuthenticated]);

  const handleNewChat = async () => {
    setActiveConversationId(null);
  };

  const handleDeleteConversation = async (id) => {
    try {
      await conversationApi.deleteConversation(id);
      setConversations((prev) => prev.filter((conversation) => conversation._id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((conversation) => conversation._id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleTitleUpdate = (id, newTitle) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === id ? { ...conversation, title: newTitle } : conversation
      )
    );
  };

  const handleConversationCreated = (newConversation) => {
    setConversations((prev) => {
      if (prev.some((conversation) => conversation._id === newConversation._id)) {
        return prev;
      }
      return [newConversation, ...prev];
    });
    setActiveConversationId(newConversation._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        isLoading={isLoadingConversations}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <AgentChat
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          conversationId={activeConversationId}
          onTitleUpdate={handleTitleUpdate}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
