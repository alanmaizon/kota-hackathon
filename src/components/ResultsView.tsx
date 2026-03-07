import { motion } from 'framer-motion';
import { PLANS } from '../data/plans';
import type { AIRecommendation } from '../types';

interface ResultsViewProps {
  recommendation: AIRecommendation;
  onRestart: () => void;
}

export function ResultsView({ recommendation, onRestart }: ResultsViewProps) {
  const recommendedPlan = PLANS.find((p) => p.id === recommendation.recommendedPlanId) ?? PLANS[1];
  const otherPlans = PLANS.filter((p) => p.id !== recommendation.recommendedPlanId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-base">🏥</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">kota</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Your personalised recommendation
          </h1>
          <p className="text-slate-400">Based on your answers, our AI advisor recommends:</p>
        </motion.div>

        {/* Recommended plan card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 mb-6 overflow-hidden"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${recommendedPlan.color} opacity-10 rounded-3xl`} />

          <div className="relative">
            {/* Match score badge */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{recommendedPlan.icon}</span>
                  <div>
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">Recommended plan</p>
                    <h2 className="text-3xl font-bold text-white">{recommendedPlan.name}</h2>
                  </div>
                </div>
                <p className="text-slate-300">{recommendedPlan.tagline}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="bg-green-500/20 border border-green-500/40 rounded-2xl px-4 py-2 mb-2">
                  <p className="text-green-400 font-bold text-lg">{recommendation.matchScore}% match</p>
                </div>
                <p className="text-white font-bold text-2xl">£{recommendedPlan.monthlyPrice}<span className="text-slate-400 text-sm font-normal">/mo</span></p>
              </div>
            </div>

            {/* AI headline */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🤖</span>
                <p className="text-blue-200 font-medium italic">"{recommendation.headline}"</p>
              </div>
            </div>

            {/* AI reasoning */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>💬</span> Why this plan is right for you
              </h3>
              <div className="text-slate-300 leading-relaxed space-y-3">
                {recommendation.reasoning.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Key benefits */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>✅</span> Key benefits for you
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendation.keyBenefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"
                  >
                    <span className="text-green-400 text-sm">✓</span>
                    <span className="text-slate-300 text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Savings tip */}
            {recommendation.savingsTip && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-amber-300 font-semibold text-sm mb-1">Pro tip</p>
                    <p className="text-amber-200 text-sm">{recommendation.savingsTip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <motion.a
              href="https://www.kota.io"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`block w-full text-center bg-gradient-to-r ${recommendedPlan.color} text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer`}
            >
              Get started with {recommendedPlan.name} →
            </motion.a>
          </div>
        </motion.div>

        {/* Other plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-slate-400 text-sm uppercase tracking-widest font-medium mb-4 text-center">
            Also worth considering
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{plan.icon}</span>
                  <span className="text-white font-semibold">{plan.name}</span>
                </div>
                <p className="text-slate-400 text-xs mb-3 leading-relaxed">{plan.tagline}</p>
                <p className="text-white font-bold">£{plan.monthlyPrice}<span className="text-slate-500 text-xs font-normal">/mo</span></p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Restart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={onRestart}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors cursor-pointer"
          >
            ← Start over
          </button>
        </motion.div>
      </div>
    </div>
  );
}
