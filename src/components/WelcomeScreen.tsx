import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

const benefits = [
  { emoji: '🧠', title: 'AI-powered matching', desc: 'Our engine analyses 11 dimensions to find your perfect fit' },
  { emoji: '⚡', title: 'Takes about 60 seconds', desc: 'A few thoughtful questions replace endless comparison spreadsheets' },
  { emoji: '🎯', title: 'Personalised insights', desc: 'Understand why a plan suits you, not just what it covers' },
  { emoji: '👥', title: 'Built for teams', desc: 'Recommendations tailored to your team size, stage, and goals' },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 text-sm px-4 py-1.5 rounded-full border border-blue-500/20 mb-6"
        >
          <span>&#10024;</span>
          <span className="font-medium">AI-Powered Plan Picker</span>
        </motion.div>

        {/* Hero text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight tracking-tight"
        >
          Find the right health plan{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            for your team
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-slate-300 text-lg mb-10 leading-relaxed max-w-2xl mx-auto"
        >
          Stop guessing. Answer a few quick questions about your team and priorities,
          and we'll match you with the plan that actually fits &mdash; with clear reasoning
          for every recommendation.
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="bg-blue-500 hover:bg-blue-400 text-white font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
        >
          Find your plan
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 text-sm mt-4 flex items-center justify-center gap-2"
        >
          <span className="text-green-400">&#10003;</span>
          Takes about 60 seconds &middot; No signup required
        </motion.p>
      </motion.div>

      {/* Benefit cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid sm:grid-cols-2 gap-4 mt-16 max-w-3xl w-full"
      >
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 flex gap-4 hover:bg-white/8 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <span className="text-lg">{b.emoji}</span>
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold">{b.title}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{b.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trusted by */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-16 text-center"
      >
        <p className="text-slate-500 text-sm mb-3">Trusted by teams at</p>
        <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
          {['Intercom', 'Stripe', 'Personio', 'Wayflyer', 'Flipdish'].map((name) => (
            <span key={name} className="text-white text-sm font-semibold tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
