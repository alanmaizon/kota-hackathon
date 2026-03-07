import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScoredPlan, AIExplanation } from '../types';

interface ResultsViewProps {
  scoredPlans: ScoredPlan[];
  explanation: AIExplanation;
  onRestart: () => void;
}

export function ResultsView({ scoredPlans, explanation, onRestart }: ResultsViewProps) {
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
      let response = 'Great question! Based on your profile, I\'d recommend booking a demo with a Kota advisor who can give specific guidance for your team.';

      if (lower.includes('cost') || lower.includes('price') || lower.includes('budget')) {
        const p = topPlan.plan;
        response = `Your recommended plan (${p.name}) is priced at ${p.price}. It's designed for teams of ${p.teamSize}. Book a demo for a personalised quote.`;
      } else if (lower.includes('mental health') || lower.includes('therapy') || lower.includes('counselling')) {
        response = `All Kota plans include access to core & flexible benefits which cover mental health support. Book a demo to learn about the specific mental health options available on the ${topPlan.plan.name} plan.`;
      } else if (lower.includes('dental') || lower.includes('teeth')) {
        response = `Dental coverage is available through Kota's flexible benefits. Book a demo to understand exactly what dental options are included on the ${topPlan.plan.name} plan.`;
      } else if (lower.includes('switch') || lower.includes('upgrade') || lower.includes('change')) {
        response = 'You can upgrade your plan at any time as your team grows. Speak with our team to understand the transition process.';
      } else if (lower.includes('family') || lower.includes('spouse') || lower.includes('dependent')) {
        response = 'Family coverage options are available through Kota\'s flexible benefits platform. Book a demo to learn about dependent coverage.';
      } else if (lower.includes('set up') || lower.includes('how long') || lower.includes('start')) {
        response = `Getting started is quick! ${topPlan.plan.tier === 'growth' ? 'Growth plans include access to a dedicated team of benefits experts for white-glove onboarding.' : topPlan.plan.tier === 'scaleup' ? 'Scaleup plans include a live onboarding webinar to get you up and running.' : 'Startup plans come with live chat support to guide you through setup.'}`;
      } else if (lower.includes('international') || lower.includes('abroad') || lower.includes('global')) {
        response = 'International coverage options depend on your specific plan configuration. Book a demo to discuss multi-country benefits with our team.';
      }

      setChatMessages((prev) => [...prev, { role: 'ai', text: response }]);
    }, 600);
  }

  // ─── Comparison view ────────────────────────────────────────────────────────
  if (view === 'compare') {
    const allFeatures = new Map<string, boolean>();
    scoredPlans.forEach(({ plan }) => {
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
                  {scoredPlans.map(({ plan, matchPercentage }) => (
                    <th key={plan.id} className="p-4 text-center min-w-[160px]">
                      <div className={`rounded-xl p-3 border ${matchPercentage > 85 ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10'}`}>
                        <p className="text-white font-semibold text-sm">{plan.name}</p>
                        <p className="text-sm font-bold mt-1" style={{ color: plan.color }}>{matchPercentage}% match</p>
                        <p className="text-slate-400 text-xs mt-1">{plan.price}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureNames.map((name, i) => (
                  <tr key={name} className={i % 2 === 0 ? 'bg-white/3' : ''}>
                    <td className="p-3 text-slate-300 text-sm font-medium">{name}</td>
                    {scoredPlans.map(({ plan }) => {
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
      <div className="max-w-5xl mx-auto">
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
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
            className="text-sm font-medium px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Compare all plans
          </button>
          <button
            onClick={onRestart}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 1 1 6.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 4v2.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Retake quiz
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
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
                          className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:bg-white/10 transition-colors cursor-pointer"
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
                  className="px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M7.5 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scoredPlans.map((sp, i) => {
            const isTop = i === 0;

            return (
              <motion.div
                key={sp.plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`rounded-2xl border-2 overflow-hidden flex flex-col transition-all ${
                  isTop
                    ? 'border-blue-500 bg-white/8 shadow-lg shadow-blue-500/10'
                    : 'border-white/10 bg-white/3 hover:border-white/20'
                }`}
              >
                {/* Top pick banner */}
                {isTop && (
                  <div className="bg-blue-500 text-white px-5 py-2 flex items-center justify-center gap-2 text-sm font-medium">
                    <span>&#10024;</span> Best match for your team
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Plan name & icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                      style={{ backgroundColor: `${sp.plan.color}20` }}
                    >
                      {sp.plan.icon}
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">{sp.plan.name}</h3>
                      <p className="text-slate-400 text-xs">{sp.plan.tagline}</p>
                    </div>
                  </div>

                  {/* Match percentage */}
                  <div className="mb-4">
                    <span className="text-2xl font-semibold" style={{ color: sp.plan.color }}>
                      {sp.matchPercentage}%
                    </span>
                    <span className="text-slate-500 text-sm ml-1">match</span>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-white text-xl font-semibold">
                      {sp.plan.price}
                    </span>
                  </div>

                  {/* Team size */}
                  <p className="text-slate-400 text-sm mb-4">
                    {sp.plan.teamSize}
                  </p>

                  {/* Description */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-5">
                    {sp.plan.bestFor}
                  </p>

                  {/* AI Insight */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-5">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-sm shrink-0 mt-0.5">&#10024;</span>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {isTop ? explanation.topPickHeadline : sp.personalizedInsight}
                      </p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-2 mb-6 flex-1">
                    {sp.plan.features.map((f) => (
                      <div key={f.name} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <span className="text-green-400 shrink-0 mt-0.5">&#10003;</span>
                        ) : (
                          <span className="text-slate-600 shrink-0 mt-0.5">&#10005;</span>
                        )}
                        <span className={`${f.included ? 'text-slate-300' : 'text-slate-500'} ${f.highlight ? 'font-medium' : ''}`}>
                          {f.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  {sp.warnings.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {sp.warnings.map((w, wi) => (
                        <div key={wi} className="flex items-start gap-2 text-amber-400/80">
                          <span className="shrink-0 mt-0.5 text-sm">&#9888;</span>
                          <span className="text-xs">{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href="https://partner.kota.io/kota-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium text-center transition-all cursor-pointer block ${
                      isTop
                        ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-sm'
                        : 'bg-white/8 text-slate-300 hover:bg-white/12'
                    }`}
                  >
                    Book a demo
                  </a>
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
            Book a demo and our team will set everything up so you can focus on building your company.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://partner.kota.io/kota-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              Book a demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7.5 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-center text-slate-600 text-xs mt-6 leading-relaxed">
          Kota is regulated by the Central Bank of Ireland. Plan details are illustrative &mdash; actual pricing depends on team size. Book a demo for a formal quote.
        </p>
      </div>
    </div>
  );
}
