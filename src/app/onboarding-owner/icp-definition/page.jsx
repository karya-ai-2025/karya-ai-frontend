'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, ArrowLeft, Sparkles, Plus, X,
  AlertCircle, Loader2, Check, RefreshCw, User2,
} from 'lucide-react';
import { updateICPs, skipStep, generateICPName } from '@/services/onboardingApi';

/* ── Each ICP goes through:
   1. story  — user writes free-text description of their ideal customer
   2. named  — AI has returned a name + cleaned description; user can confirm or regenerate
   3. confirmed — saved ── */

function ICPCard({ icp, index, onStoryChange, onGenerate, onRegenerate, onConfirm, onRemove, canRemove, isSubmitting }) {
  const isGenerating = icp.generating;
  const isNamed      = icp.aiName && !icp.confirmed;
  const isConfirmed  = icp.confirmed;

  return (
    <div className={`rounded-xl border p-5 transition-colors ${
      isConfirmed ? 'border-green-300 bg-green-50' :
      isNamed     ? 'border-blue-300 bg-blue-50/40' :
                    'border-gray-200 bg-gray-50'
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-700">Ideal Customer {index + 1}</span>
          {isConfirmed && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Confirmed
            </span>
          )}
        </div>
        {canRemove && !isConfirmed && (
          <button onClick={onRemove} disabled={isSubmitting} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmed view */}
      {isConfirmed ? (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <User2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{icp.aiName}</p>
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{icp.aiDescription}</p>
          </div>
        </div>
      ) : isNamed ? (
        /* AI returned a name — show for confirmation */
        <div>
          <div className="flex items-start gap-3 p-4 bg-white border border-blue-200 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-500 font-medium mb-0.5">AI-generated ICP name</p>
              <p className="font-semibold text-gray-900 text-lg">{icp.aiName}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{icp.aiDescription}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3 italic">Based on your description: "{icp.story.length > 100 ? icp.story.slice(0, 100) + '…' : icp.story}"</p>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              disabled={isGenerating || isSubmitting}
              className="flex-1 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Try again
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Looks good!
            </button>
          </div>
        </div>
      ) : (
        /* Story input */
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Describe your ideal customer in your own words
          </label>
          <textarea
            value={icp.story}
            onChange={(e) => onStoryChange(e.target.value)}
            placeholder={`Example: "My ideal customer is a mid-sized B2B SaaS company with 50–200 employees. They're usually Series A or B funded, have a small marketing team of 2–3 people, and struggle with generating consistent leads. They want to scale content production but don't have the bandwidth..."`}
            rows={5}
            disabled={isGenerating || isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none disabled:opacity-50"
          />
          <button
            onClick={onGenerate}
            disabled={!icp.story.trim() || isGenerating || isSubmitting}
            className="mt-3 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analysing your description…</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate ICP Name with AI</>
            )}
          </button>
          {!icp.story.trim() && (
            <p className="text-xs text-gray-400 mt-1.5 text-center">Write a description above to unlock AI generation</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

let nextId = 1;
function makeICP() { return { id: nextId++, story: '', aiName: '', aiDescription: '', confirmed: false, generating: false }; }

export default function ICPDefinition() {
  const router = useRouter();
  const [icps, setIcps]           = useState([makeICP()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const update = (id, patch) => setIcps(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));

  const handleGenerate = async (id, regenerate = false) => {
    const icp = icps.find(i => i.id === id);
    if (!icp?.story.trim()) return;
    update(id, { generating: true, ...(regenerate ? { aiName: '', aiDescription: '' } : {}) });
    setError('');
    try {
      const res = await generateICPName(icp.story);
      update(id, { aiName: res.data.name, aiDescription: res.data.description, generating: false });
    } catch (err) {
      update(id, { generating: false });
      setError(err.message || 'AI generation failed. Please try again.');
    }
  };

  const handleConfirm  = (id) => update(id, { confirmed: true });
  const handleRemove   = (id) => setIcps(prev => prev.filter(i => i.id !== id));
  const handleAddAnother = () => setIcps(prev => [...prev, makeICP()]);

  const handleSkip = async () => {
    try { setIsLoading(true); await skipStep(5); } catch {}
    router.push('/onboarding-owner/marketing-activities');
    setIsLoading(false);
  };

  const handleNext = async () => {
    const confirmed = icps.filter(i => i.confirmed);
    if (confirmed.length === 0) {
      setError('Please confirm at least one Ideal Customer Profile before continuing.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await updateICPs(confirmed.map(i => ({ name: i.aiName, description: i.aiDescription, confirmed: true })));
      router.push('/onboarding-owner/marketing-activities');
    } catch (err) {
      setError(err.message || 'Failed to save ICPs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmedCount = icps.filter(i => i.confirmed).length;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 3 of 5</span>
            <span className="text-sm text-gray-500">60% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <div className="mb-6">
            <p className="text-sm text-gray-400 font-medium mb-1">Ideal Customer Profiles</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Who is your ideal customer?
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Just describe them in your own words — like you're telling a friend. Our AI will read it and give them a name. You can confirm the name or generate again.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* ICP cards */}
          <div className="space-y-4 mb-5">
            {icps.map((icp, index) => (
              <ICPCard
                key={icp.id}
                icp={icp}
                index={index}
                onStoryChange={(v) => update(icp.id, { story: v })}
                onGenerate={() => handleGenerate(icp.id)}
                onRegenerate={() => handleGenerate(icp.id, true)}
                onConfirm={() => handleConfirm(icp.id)}
                onRemove={() => handleRemove(icp.id)}
                canRemove={icps.length > 1}
                isSubmitting={isLoading}
              />
            ))}
          </div>

          {/* Add another */}
          {confirmedCount > 0 && (
            <button
              onClick={handleAddAnother}
              disabled={isLoading}
              className="w-full mb-5 py-3 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl text-blue-600 font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add another ICP
            </button>
          )}

          {confirmedCount > 0 && (
            <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-500" />
              {confirmedCount} ICP{confirmedCount > 1 ? 's' : ''} confirmed — you can add more or continue.
            </div>
          )}

          {/* Skip */}
          <div className="text-center mb-5">
            <button onClick={handleSkip} disabled={isLoading} className="text-gray-400 hover:text-gray-700 text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 mx-auto">
              Skip this step <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()} disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <button
              onClick={handleNext} disabled={isLoading || confirmedCount === 0}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</> : <>Next <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
