import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithKotaAI } from '../services/ai';
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
  const [chatLoading, setChatLoading] = useState(false);

  const topPlan = scoredPlans[0];

  // ─── Chat handler (AI-powered with streaming) ─────────────────────────────
  async function handleChatSend(message?: string) {
    const text = message || chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput('');
    const history = [...chatMessages];
    setChatMessages((prev) => [...prev, { role: 'user' as const, text }]);
    setChatLoading(true);

    try {
      // Add a placeholder AI message that we'll stream into
      setChatMessages((prev) => [...prev, { role: 'ai', text: '' }]);

      await chatWithKotaAI(text, scoredPlans, history, (token) => {
        setChatMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'ai') {
            updated[updated.length - 1] = { ...last, text: last.text + token };
          }
          return updated;
        });
      });
    } catch {
      setChatMessages((prev) => {
        // Replace the empty/partial streaming message with fallback
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'ai' && !last.text) {
          updated[updated.length - 1] = {
            role: 'ai',
            text: `Your recommended plan (${topPlan.plan.name}) is priced at ${topPlan.plan.price} for teams of ${topPlan.plan.teamSize}. Book a demo at https://partner.kota.io/kota-demo for a personalised quote.`,
          };
        }
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
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
      <div className="min-h-screen px-4 py-10" style={{ backgroundColor: 'var(--cloud-bg)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setView('results')}
              className="transition-colors cursor-pointer flex items-center gap-1 hover:opacity-70"
              style={{ color: 'var(--cloud-muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Back to results
            </button>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--cloud-text)' }}>Plan Comparison</h2>
          </div>

          <div className="overflow-x-auto rounded-2xl" style={{ backgroundColor: 'var(--cloud-card)', border: '1px solid var(--cloud-border)' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 min-w-[180px]" />
                  {scoredPlans.map(({ plan, matchPercentage }) => (
                    <th key={plan.id} className="p-4 text-center min-w-[160px]">
                      <div
                        className="rounded-xl p-3"
                        style={{
                          border: matchPercentage > 85
                            ? '2px solid var(--cloud-accent)'
                            : '1px solid var(--cloud-border)',
                          backgroundColor: matchPercentage > 85 ? 'rgba(106, 92, 255, 0.04)' : 'transparent',
                        }}
                      >
                        <p className="font-semibold text-sm" style={{ color: 'var(--cloud-text)' }}>{plan.name}</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--cloud-accent)' }}>{matchPercentage}% match</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--cloud-muted)' }}>{plan.price}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureNames.map((name, i) => (
                  <tr key={name} style={{ backgroundColor: i % 2 === 0 ? 'var(--cloud-bg)' : 'transparent' }}>
                    <td className="p-3 text-sm font-medium" style={{ color: 'var(--cloud-text)' }}>{name}</td>
                    {scoredPlans.map(({ plan }) => {
                      const feature = plan.features.find((f) => f.name === name);
                      return (
                        <td key={plan.id} className="p-3 text-center">
                          {feature?.included ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-sm" style={{ color: '#00b894' }}>&#10003;</span>
                              {feature.detail && <span className="text-xs" style={{ color: 'var(--cloud-muted)' }}>{feature.detail}</span>}
                            </div>
                          ) : feature ? (
                            <span className="text-sm" style={{ color: 'var(--cloud-border)' }}>&#10005;</span>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--cloud-border)' }}>-</span>
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
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: 'var(--cloud-bg)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'rgba(106, 92, 255, 0.08)',
                color: 'var(--cloud-accent)',
                border: '1px solid rgba(106, 92, 255, 0.15)',
              }}
            >
              &#10024; AI Recommendation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ color: 'var(--cloud-text)' }}>
            Your personalised results
          </h1>

          {/* AI Summary */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--cloud-card)',
              border: '1px solid var(--cloud-border)',
            }}
          >
            <p className="leading-relaxed" style={{ color: 'var(--cloud-muted)' }}>{explanation.summary}</p>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center sm:justify-start gap-3 mb-8"
        >
          {[
            { label: 'Compare all plans', onClick: () => setView('compare'), icon: null },
            {
              label: 'Retake quiz',
              onClick: onRestart,
              icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 1 1 6.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 4v2.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
            { label: 'Ask a question', onClick: () => setShowChat(!showChat), icon: null },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 hover:opacity-80"
              style={{
                backgroundColor: 'var(--cloud-card)',
                border: '1px solid var(--cloud-border)',
                color: 'var(--cloud-muted)',
              }}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </motion.div>

        {/* Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--cloud-card)',
                border: '1px solid var(--cloud-border)',
              }}
            >
              <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--cloud-border)' }}>
                <span style={{ color: 'var(--cloud-accent)' }} className="text-sm">&#10024;</span>
                <span className="text-sm font-medium" style={{ color: 'var(--cloud-text)' }}>Ask Kota AI</span>
                <span className="text-xs ml-auto" style={{ color: 'var(--cloud-muted)' }}>Powered by your quiz answers</span>
              </div>
              <div className="p-4 max-h-72 overflow-y-auto space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm mb-3" style={{ color: 'var(--cloud-muted)' }}>Ask anything about your recommended plans</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        'How much will this cost my team?',
                        "What's the difference between plans?",
                        'What mental health support is included?',
                        'Can I upgrade later?',
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleChatSend(q)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--cloud-bg)',
                            border: '1px solid var(--cloud-border)',
                            color: 'var(--cloud-muted)',
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => {
                  if (msg.role === 'ai' && !msg.text) return null;
                  return (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                        style={
                          msg.role === 'user'
                            ? { backgroundColor: 'var(--cloud-accent)', color: '#ffffff' }
                            : { backgroundColor: 'var(--cloud-bg)', color: 'var(--cloud-text)', border: '1px solid var(--cloud-border)' }
                        }
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {chatLoading && chatMessages[chatMessages.length - 1]?.text === '' && (
                  <div className="flex justify-start">
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm"
                      style={{ backgroundColor: 'var(--cloud-bg)', color: 'var(--cloud-muted)', border: '1px solid var(--cloud-border)' }}
                    >
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 flex gap-2" style={{ borderTop: '1px solid var(--cloud-border)' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask about coverage, pricing, setup..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'var(--cloud-bg)',
                    border: '1px solid var(--cloud-border)',
                    color: 'var(--cloud-text)',
                  }}
                />
                <button
                  onClick={() => handleChatSend()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-40"
                  style={{ backgroundColor: 'var(--cloud-accent)' }}
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
                className="rounded-2xl overflow-hidden flex flex-col transition-all"
                style={{
                  backgroundColor: 'var(--cloud-card)',
                  border: isTop ? '2px solid var(--cloud-accent)' : '1px solid var(--cloud-border)',
                  boxShadow: isTop
                    ? '0 8px 32px rgba(106, 92, 255, 0.12)'
                    : '0 2px 12px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Top pick banner */}
                {isTop && (
                  <div
                    className="text-white px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-medium"
                    style={{ backgroundColor: 'var(--cloud-accent)' }}
                  >
                    &#10024; Best match for your team
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Plan name & team size label */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--cloud-text)' }}>{sp.plan.name}</h3>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'var(--cloud-bg)',
                        color: 'var(--cloud-muted)',
                        border: '1px solid var(--cloud-border)',
                      }}
                    >
                      {sp.plan.teamSize}
                    </span>
                  </div>

                  {/* Match percentage */}
                  <div className="mb-4">
                    <span className="text-2xl font-semibold" style={{ color: 'var(--cloud-accent)' }}>
                      {sp.matchPercentage}%
                    </span>
                    <span className="text-sm ml-1" style={{ color: 'var(--cloud-muted)' }}>match</span>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="text-xl font-semibold" style={{ color: 'var(--cloud-text)' }}>
                      {sp.plan.price}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--cloud-muted)' }}>
                    {sp.plan.bestFor}
                  </p>

                  {/* AI Insight */}
                  <div
                    className="rounded-xl p-3 mb-5"
                    style={{
                      backgroundColor: 'rgba(106, 92, 255, 0.04)',
                      border: '1px solid rgba(106, 92, 255, 0.12)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0 mt-0.5" style={{ color: 'var(--cloud-accent)' }}>&#10024;</span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--cloud-muted)' }}>
                        {isTop ? explanation.topPickHeadline : sp.personalizedInsight}
                      </p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-2.5 mb-6 flex-1">
                    {sp.plan.features.map((f) => (
                      <div key={f.name} className="flex items-start gap-2.5 text-sm">
                        {f.included ? (
                          <span className="shrink-0 mt-0.5" style={{ color: '#00b894' }}>&#10003;</span>
                        ) : (
                          <span className="shrink-0 mt-0.5" style={{ color: 'var(--cloud-border)' }}>&#10005;</span>
                        )}
                        <span
                          className={f.highlight ? 'font-medium' : ''}
                          style={{ color: f.included ? 'var(--cloud-text)' : 'var(--cloud-border)' }}
                        >
                          {f.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  {sp.warnings.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {sp.warnings.map((w, wi) => (
                        <div key={wi} className="flex items-start gap-2">
                          <span className="shrink-0 mt-0.5 text-sm" style={{ color: '#e17055' }}>&#9888;</span>
                          <span className="text-xs" style={{ color: '#e17055' }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href="https://partner.kota.io/kota-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium text-center transition-all cursor-pointer block hover:opacity-90"
                    style={
                      isTop
                        ? {
                            backgroundColor: 'var(--cloud-accent)',
                            color: '#ffffff',
                            boxShadow: '0 4px 16px rgba(106, 92, 255, 0.2)',
                          }
                        : {
                            backgroundColor: 'var(--cloud-bg)',
                            color: 'var(--cloud-text)',
                            border: '1px solid var(--cloud-border)',
                          }
                    }
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
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            backgroundColor: 'rgba(106, 92, 255, 0.04)',
            border: '1px solid rgba(106, 92, 255, 0.12)',
          }}
        >
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--cloud-text)' }}>Ready to protect your team?</h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--cloud-muted)' }}>
            Book a demo and our team will set everything up so you can focus on building your company.
          </p>
          <a
            href="https://partner.kota.io/kota-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white px-8 py-3 rounded-xl font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:opacity-90"
            style={{
              backgroundColor: 'var(--cloud-accent)',
              boxShadow: '0 8px 24px rgba(106, 92, 255, 0.2)',
            }}
          >
            Book a demo
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7.5 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </a>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: 'var(--cloud-muted)', opacity: 0.7 }}>
          Kota is regulated by the Central Bank of Ireland. Plan details are illustrative. Actual pricing depends on team size. Book a demo for a formal quote.
        </p>

        {/* Footer watermark */}
        <div className="mt-8 flex items-center justify-center gap-2" style={{ opacity: 0.45 }}>
          <span className="text-xs" style={{ color: 'var(--cloud-muted)' }}>Built for</span>
          <img src="/logo.png" alt="Kota" style={{ height: 18 }} />
          <span className="text-xs" style={{ color: 'var(--cloud-muted)' }}>Hackathon</span>
        </div>
      </div>
    </div>
  );
}
