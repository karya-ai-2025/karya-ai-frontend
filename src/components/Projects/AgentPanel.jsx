'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Sparkles, X, Send } from 'lucide-react';

/**
 * AgentPanel — the right-side conversational assistant drawer for projects.
 *
 * Two playbook modes, both of which hand their result to the MIDDLE page and
 * then auto-close (the parent closes the panel):
 *  - leads (default): asks questions → `onComplete(answers)` (parent shows the
 *    matching contacts in the Leads results box).
 *  - email (`playbook.mode === 'email'`): asks questions → `onGenerateDraft(answers)`
 *    → `onEmailDraftReady(draft, answers)` (parent shows the draft + the two
 *    decision buttons in the middle of the campaigns page).
 */

export const LEAD_PLAYBOOK = {
  title: 'Contact Intelligence Assistant',
  subtitle: 'I build your list from a quick chat — no manual filters.',
  intro:
    "Hi! Answer a few quick questions and I'll pull a matching list of decision-makers for you. Let's start.",
  steps: [
    { id: 'industry', question: 'Which industry are you targeting?', chips: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'] },
    { id: 'sector', question: 'Any specific sector or sub-industry?', chips: ['Skip this'] },
    { id: 'segment', question: 'What size of accounts do you want?', chips: ['SMB', 'Mid-Market', 'Enterprise'] },
    { id: 'location', question: 'Which region or location?', chips: ['North America', 'Europe', 'Asia', 'Global'] },
    { id: 'size', question: 'Preferred company headcount?', chips: ['1–50', '51–200', '201–1000', '1000+'] },
  ],
};

export const EMAIL_PLAYBOOK = {
  title: 'Outbound Email Assistant',
  subtitle: 'I draft your cold email from a quick chat.',
  mode: 'email',
  intro:
    "Hi! I'll write your outbound email. Answer a few quick questions and I'll draft it for your review.",
  steps: [
    { id: 'campaignName', question: 'First, what should we name this campaign? (this is how it appears in your dashboard so you can start it later)' },
    { id: 'tone', question: 'What tone / voice should the email have?', chips: ['Friendly', 'Professional', 'Direct', 'Playful'] },
    { id: 'company', question: "What's your company name?" },
    { id: 'audience', question: 'Who are you emailing? (target audience)', chips: ['Founders', 'Marketing leaders', 'Sales leaders', 'Engineers'] },
    { id: 'product', question: 'What are you offering? (your product / value)' },
    { id: 'cta', question: "What's the call to action?", chips: ['Book a 15-min call', 'Reply to learn more', 'Start a free trial'] },
  ],
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
    </div>
  );
}

export default function AgentPanel({
  open,
  onClose,
  onComplete,
  onGenerateDraft,
  onEmailDraftReady,
  playbook = LEAD_PLAYBOOK,
  projectName,
  refineOptions = {},   // { regions, segments, seniority } — drives post-search refinement chips
  onRefine,             // (patch) => parent re-queries /leads/generate with the added filter
}) {
  const [messages, setMessages] = useState([]); // { role, text }
  const [stepIndex, setStepIndex] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('qa'); // qa | leads-done | drafting | email-done | draft-error
  const [refineUsed, setRefineUsed] = useState({}); // which dimensions are already applied

  const scrollRef = useRef(null);
  const startedRef = useRef(false);
  const answersRef = useRef({});

  const isEmail = playbook.mode === 'email';
  const steps = playbook.steps || [];
  const currentStep = phase === 'qa' && stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;

  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      setMessages([{ role: 'agent', text: playbook.intro }]);
      askStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, phase]);

  const pushAgent = (msg) => setMessages((prev) => [...prev, { role: 'agent', ...msg }]);
  const pushUser = (text) => setMessages((prev) => [...prev, { role: 'user', text }]);

  // ── Post-search refinement (lead mode only) ────────────────────────────────
  const refineActive = phase === 'leads-done' && !isEmail;

  // Suggestion chips, built from the DB lookups, minus dimensions already applied.
  const refineSuggestions = useMemo(() => {
    if (isEmail) return [];
    const out = [];
    if (!refineUsed.seniority) (refineOptions?.seniority || []).slice(0, 3).forEach((o) =>
      out.push({ field: 'seniority', value: o.level_name,   label: o.display_name, chip: `Only ${o.display_name}` }));
    if (!refineUsed.location)  (refineOptions?.regions  || []).slice(0, 4).forEach((o) =>
      out.push({ field: 'location',  value: o.region_name,  label: o.display_name, chip: `In ${o.display_name}` }));
    if (!refineUsed.segment)   (refineOptions?.segments || []).slice(0, 3).forEach((o) =>
      out.push({ field: 'segment',   value: o.segment_name, label: o.display_name, chip: `Only ${o.display_name}` }));
    return out;
  }, [isEmail, refineUsed, refineOptions]);

  // All known options (incl. applied) — used to map free text like "only decision makers".
  const allRefineOptions = () => ([
    ...(refineOptions?.seniority || []).map((o) => ({ field: 'seniority', value: o.level_name,   label: o.display_name })),
    ...(refineOptions?.regions  || []).map((o) => ({ field: 'location',  value: o.region_name,  label: o.display_name })),
    ...(refineOptions?.segments || []).map((o) => ({ field: 'segment',   value: o.segment_name, label: o.display_name })),
  ]);

  // Apply one refinement: mark its dimension used, ask the parent to re-query, confirm.
  // IMPORTANT: send the lowercase value (level_name/region_name/segment_name), never the label.
  const commitRefine = (opt) => {
    setRefineUsed((prev) => ({ ...prev, [opt.field]: true }));
    onRefine?.({ [opt.field]: opt.value });
    pushAgent({ text: `Done — narrowed to ${opt.label}. Updated leads are in the results →` });
  };

  const handleRefineChip = (opt) => {
    pushUser(opt.chip || opt.label);
    commitRefine(opt);
  };

  const submitRefineText = (text) => {
    pushUser(text);
    const t = text.toLowerCase();
    const opt = allRefineOptions().find(
      (o) => t.includes(String(o.value).toLowerCase()) || t.includes(String(o.label).toLowerCase())
    );
    if (opt) commitRefine(opt);
    else pushAgent({ text: 'I can narrow by seniority, segment, or region — tap a suggestion below, or try e.g. "only decision makers" or "in apac".' });
  };

  const askStep = (index) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (index < steps.length) {
        pushAgent({ text: steps[index].question });
        setStepIndex(index);
      } else {
        setStepIndex(steps.length);
        finishQuestions();
      }
    }, 550);
  };

  const finishQuestions = () => {
    if (isEmail) {
      pushAgent({ text: 'Great — drafting your email now…' });
      generateDraft();
    } else {
      pushAgent({ text: "Perfect — I've pulled your matching contacts into the Leads page. Want to narrow them down? Tap a suggestion below, or tell me — e.g. \"only decision makers\" or \"in apac\"." });
      setPhase('leads-done');
      onComplete?.(answersRef.current);
    }
  };

  const generateDraft = async () => {
    setPhase('drafting');
    setTyping(true);
    try {
      const d = await onGenerateDraft?.({ ...answersRef.current });
      setTyping(false);
      if (!d || (!d.subject && !d.body)) throw new Error('Empty draft');
      pushAgent({ text: "I've drafted your email — review it in the middle and choose how to proceed →" });
      setPhase('email-done');
      onEmailDraftReady?.(d, answersRef.current);
    } catch (err) {
      console.error('draft error', err);
      setTyping(false);
      pushAgent({ text: "Sorry — I couldn't draft that just now. Tap below to try again." });
      setPhase('draft-error');
    }
  };

  const submitAnswer = (value) => {
    const text = String(value || '').trim();
    if (!text || phase !== 'qa' || !currentStep) return;
    pushUser(text);
    answersRef.current = { ...answersRef.current, [currentStep.id]: text };
    setInput('');
    askStep(stepIndex + 1);
  };

  const handleSend = (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;
    if (phase === 'qa' && currentStep) { submitAnswer(text); return; }
    if (refineActive) { setInput(''); submitRefineText(text); return; }
  };

  const inputActive = (phase === 'qa' && currentStep) || refineActive;
  const inputPlaceholder =
    phase === 'qa' && currentStep ? 'Type your answer…'
    : refineActive ? 'Refine, e.g. “only decision makers”'
    : phase === 'email-done' ? 'Draft ready — see the middle'
    : phase === 'leads-done' ? 'Conversation complete'
    : 'Working…';

  return (
    <div
      className={`fixed top-0 right-0 z-[55] h-full w-full max-w-[400px] bg-white border-l border-gray-200 shadow-[-8px_0_30px_-12px_rgba(0,0,0,0.15)] flex flex-col transform transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-4 border-b border-gray-200 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-5 w-5" strokeWidth={2} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{playbook.title}</p>
            <p className="mt-0.5 text-xs text-white/70">{projectName || playbook.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close assistant"
          className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Quick-reply chips (QA only) */}
      {currentStep?.chips?.length > 0 && !typing && (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 pt-3">
          {currentStep.chips.map((chip) => (
            <button
              key={chip}
              onClick={() => submitAnswer(chip)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Refinement suggestions — after leads are pulled (lead mode) */}
      {refineActive && refineSuggestions.length > 0 && !typing && (
        <div className="border-t border-gray-100 px-4 pt-3">
          <p className="text-[11px] font-medium text-gray-500 mb-2">Narrow these down</p>
          <div className="flex flex-wrap gap-2">
            {refineSuggestions.map((s) => (
              <button
                key={s.field + s.value}
                onClick={() => handleRefineChip(s)}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {s.chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'draft-error' && (
        <div className="border-t border-gray-100 px-4 pt-3">
          <button
            onClick={generateDraft}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          disabled={!inputActive}
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={!inputActive || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
