import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScoredPlan, AIExplanation } from '../types';

interface ResultsViewProps {
  scoredPlans: ScoredPlan[];
  explanation: AIExplanation;
  onRestart: () => void;
}

export function ResultsView({ scoredPlans, explanation, onRestart }: ResultsViewProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(scoredPlans[0]?.plan.id ?? null);
  const [view, setView] = useState<'results' | 'compare'>('results');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const topPlan = scoredPlans[0];

  // ─── Chat handler ───────────────────────────────────────────────────────────
  function handleChatSend(message?: string) {
    const text = message || chatInput.trim();
    if (!text) return;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text }]);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let response = 'Great question! Based on your profile, I\'d recommend speaking with a Kota advisor who can give specific guidance for your team.';

      if (lower.includes('cost') || lower.includes('price') || lower.includes('budget')) {
        const p = topPlan.plan;
        response = p.monthlyPrice.max > 0
          ? `Your recommended plan (${p.name}) costs \u20AC${p.monthlyPrice.min}\u2013${p.monthlyPrice.max} per employee per month. You can save ${p.annualSavings}% with annual billing.`
          : `${p.name} has custom pricing. A Kota advisor can provide a quote tailored to your team size and needs.`;
      } else if (lower.includes('mental health') || lower.includes('therapy') || lower.includes('counselling')) {
        const mh = topPlan.plan.features.find((f) => f.name === 'Mental health');
        response = mh?.included
          ? `${topPlan.plan.name} includes ${mh.detail}. This covers therapy sessions, counselling, and access to the Employee Assistance Programme.`
          : `${topPlan.plan.name} doesn't include mental health coverage. Consider upgrading to Kota Growth for 12 sessions/year or Premium for unlimited.`;
      } else if (lower.includes('dental') || lower.includes('teeth')) {
        const dental = topPlan.plan.features.find((f) => f.name === 'Dental');
        response = dental?.included
          ? `Yes! ${topPlan.plan.name} includes dental: ${dental.detail}. This covers check-ups, cleanings, and basic dental work.`
          : `${topPlan.plan.name} doesn't include dental. Kota Growth adds dental up to \u20AC750/year.`;
      } else if (lower.includes('switch') || lower.includes('upgrade') || lower.includes('change')) {
        response = 'You can upgrade your plan at any time with no penalty. Downgrades take effect at your next renewal date.';
      } else if (lower.includes('family') || lower.includes('spouse') || lower.includes('dependent')) {
        response = 'Family coverage is available on Premium and Enterprise plans. Employees can add their spouse and dependent children at an additional per-dependent rate.';
      } else if (lower.includes('set up') || lower.includes('how long') || lower.includes('start')) {
        response = `Most plans can be set up within 48 hours. ${topPlan.plan.tier === 'enterprise' ? 'Enterprise plans typically take 1\u20132 weeks for white-glove onboarding.' : 'You\'ll get a dedicated account manager to guide you through the process.'}`;
      } else if (lower.includes('international') || lower.includes('abroad') || lower.includes('global')) {
        const intl = topPlan.plan.features.find((f) => f.name === 'International cover');
        response = intl?.included
          ? `${topPlan.plan.name} includes international coverage: ${intl.detail}.`
          : `${topPlan.plan.name} doesn't include international coverage. Kota Premium covers EU + UK, and Enterprise offers worldwide coverage.`;
      }

      setChatMessages((prev) => [...prev, { role: 'ai', text: response }]);
    }, 600);
  }

  // ─── Comparison view ────────────────────────────────────────────────────────
  if (view === 'compare') {
    const plansToCompare = scoredPlans.slice(0, 3);
    const allFeatures = new Map<string, boolean>();
    plansToCompare.forEach(({ plan }) => {
      plan.features.forEach((f) => {
        if (!allFeatures.has(f.name)) allFeatures.set(f.name, true);
      });
    });
    const featureNames = Array.from(allFeatures.keys());

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setView('results')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Back to results
            </button>
            <h2 className="text-xl font-semibold text-white">Plan Comparison</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 min-w-[180px]" />
                  {plansToCompare.map(({ plan, matchPercentage }) => (
                    <th key={plan.id} className="p-4 text-center min-w-[160px]">
                      <div className={`rounded-xl p-3 border ${matchPercentage > 85 ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10'}`}>
                        <p className="text-white font-semibold text-sm">{plan.name}</p>
                        <p className="text-sm font-bold mt-1" style={{ color: plan.color }}>{matchPercentage}% match</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {plan.monthlyPrice.max > 0 ? `\u20AC${plan.monthlyPrice.min}\u2013${plan.monthlyPrice.max}/mo` : 'Custom'}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureNames.map((name, i) => (
                  <tr key={name} className={i % 2 === 0 ? 'bg-white/3' : ''}>
                    <td className="p-3 text-slate-300 text-sm font-medium">{name}</td>
                    {plansToCompare.map(({ plan }) => {
                      const feature = plan.features.find((f) => f.name === name);
                      return (
                        <td key={plan.id} className="p-3 text-center">
                          {feature?.included ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-green-400 text-sm">&#10003;</span>
                              {feature.detail && <span className="text-slate-500 text-xs">{feature.detail}</span>}
                            </div>
                          ) : feature ? (
                            <span className="text-slate-600 text-sm">&#10005;</span>
                          ) : (
                            <span className="text-slate-700 text-xs">&mdash;</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ─── Results view ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-400">&#10024;</span>
            <span className="text-blue-300 text-sm font-medium bg-blue-500/15 px-3 py-1 rounded-full">
              AI Recommendation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Your personalised results
          </h1>

          {/* AI Summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-slate-300 leading-relaxed">{explanation.summary}</p>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <button
            onClick={() => setView('compare')}
            className="text-sm px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Compare all plans
          </button>
          <button
            onClick={onRestart}
            className="text-sm px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 1 1 6.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 4v2.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Retake quiz
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="text-sm px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Ask a question
          </button>
        </motion.div>

        {/* Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <span className="text-blue-400 text-sm">&#10024;</span>
                <span className="text-white text-sm font-medium">Ask Kota AI</span>
                <span className="text-slate-500 text-xs ml-auto">Powered by your quiz answers</span>
              </div>
              <div className="p-4 max-h-72 overflow-y-auto space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-slate-400 text-sm mb-3">Ask anything about your recommended plans</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        'How much will this cost my team?',
                        'What mental health support is included?',
                        'Can I upgrade later?',
                        'How fast can we get set up?',
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleChatSend(q)}
                          className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask about coverage, pricing, setup..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => handleChatSend()}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-400 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M7.5 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plan cards */}
        <div className="space-y-4">
          {scoredPlans.map((sp, i) => {
            const isTop = i === 0;
            const isExpanded = expandedPlan === sp.plan.id;

            return (
              <motion.div
                key={sp.plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  isTop
                    ? 'border-blue-500 bg-white/8 shadow-lg shadow-blue-500/10'
                    : 'border-white/10 bg-white/3 hover:border-white/20'
                }`}
              >
                {/* Top pick banner */}
                {isTop && (
                  <div className="bg-blue-500 text-white px-5 py-2 flex items-center gap-2 text-sm font-medium">
                    <span>&#10024;</span> Best match for your team
                  </div>
                )}

                <div className="p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                        style={{ backgroundColor: `${sp.plan.color}20` }}
                      >
                        {sp.plan.icon}
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-semibold">{sp.plan.name}</h3>
                        <p className="text-slate-400 text-sm">{sp.plan.tagline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: sp.plan.color }}>
                        {sp.matchPercentage}%
                      </div>
                      <p className="text-slate-500 text-xs">match</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    {sp.plan.monthlyPrice.max > 0 ? (
                      <>
                        <span className="text-white text-2xl font-bold">
                          &euro;{sp.plan.monthlyPrice.min}&ndash;{sp.plan.monthlyPrice.max}
                        </span>
                        <span className="text-slate-400 text-sm">/employee/month</span>
                      </>
                    ) : (
                      <span className="text-white text-lg font-semibold">Custom pricing</span>
                    )}
                    {sp.plan.annualSavings > 0 && (
                      <span className="text-green-400/80 text-xs ml-2 bg-green-400/10 px-2 py-0.5 rounded-full">
                        Save {sp.plan.annualSavings}% annually
                      </span>
                    )}
                  </div>

                  {/* AI Insight */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-sm shrink-0 mt-0.5">&#10024;</span>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {isTop ? explanation.topPickHeadline : sp.personalizedInsight}
                      </p>
                    </div>
                  </div>

                  {/* Reasons */}
                  {sp.reasons.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                        Why this plan fits
                      </p>
                      {sp.reasons.map((r, ri) => (
                        <div key={ri} className="flex items-start gap-2">
                          <span className="shrink-0 mt-0.5 text-sm" style={{ color: sp.plan.color }}>&#10003;</span>
                          <span className="text-slate-300 text-sm">{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  {sp.warnings.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {sp.warnings.map((w, wi) => (
                        <div key={wi} className="flex items-start gap-2 text-amber-400/80">
                          <span className="shrink-0 mt-0.5 text-sm">&#9888;</span>
                          <span className="text-sm">{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coverage highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sp.plan.coverageHighlights.map((h) => (
                      <span key={h} className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-slate-400">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Expandable features */}
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : sp.plan.id)}
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2 cursor-pointer font-medium"
                  >
                    {isExpanded ? 'Hide' : 'Show'} all features
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mb-4 overflow-hidden"
                      >
                        {sp.plan.features.map((f) => (
                          <div
                            key={f.name}
                            className={`flex items-center gap-2 text-sm ${f.highlight ? 'bg-white/5 -mx-2 px-2 py-1 rounded-lg' : ''}`}
                          >
                            {f.included ? (
                              <span className="text-green-400 shrink-0">&#10003;</span>
                            ) : (
                              <span className="text-slate-600 shrink-0">&#10005;</span>
                            )}
                            <span className={f.included ? 'text-slate-300' : 'text-slate-500'}>{f.name}</span>
                            {f.detail && f.included && (
                              <span className="text-slate-500 ml-auto text-xs">{f.detail}</span>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CTA */}
                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <a
                      href="https://partner.kota.io/kota-demo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium text-center transition-all cursor-pointer ${
                        isTop
                          ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-sm'
                          : 'bg-white/8 text-slate-300 hover:bg-white/12'
                      }`}
                    >
                      {sp.plan.monthlyPrice.max > 0 ? 'Get a quote' : 'Talk to sales'}
                    </a>
                    <button
                      onClick={() => setView('compare')}
                      className="py-3 px-4 rounded-xl text-sm border border-white/10 text-slate-400 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-blue-500/8 border border-blue-500/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-2">Ready to protect your team?</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Get a personalised quote in minutes. Our team will set everything up so you can focus on building your company.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://partner.kota.io/kota-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              Get your quote
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7.5 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-center text-slate-600 text-xs mt-6 leading-relaxed">
          Kota is regulated by the Central Bank of Ireland. Plan details are illustrative &mdash; actual pricing depends on team census. Speak to a Kota advisor for a formal quote.
        </p>
      </div>
    </div>
  );
}
