import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

const BENEFIT_CARDS = [
  { emoji: '🤖', title: 'AI-powered matching', desc: "Smart recommendations based on your team's needs" },
  { emoji: '⚡', title: '60 seconds', desc: 'Answer a few quick questions and get instant results' },
  { emoji: '💡', title: 'Personalised insights', desc: 'Clear reasoning for every plan recommendation' },
  { emoji: '👥', title: 'Built for teams', desc: 'Plans designed for startups and growing companies' },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cloud-bg)' }}>
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section>
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full mb-7"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--cloud-accent)',
                border: '1px solid rgba(106, 92, 255, 0.2)',
              }}
            >
              <span>&#10024;</span>
              <span className="font-medium">Kota AI Agent</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight mb-4"
              style={{ color: 'var(--cloud-text)' }}
            >
              Find the right health plan{' '}
              <span style={{ color: 'var(--cloud-accent)' }}>
                for your team
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-lg leading-relaxed mb-8 max-w-xl mx-auto"
              style={{ color: 'var(--cloud-muted)' }}
            >
              Stop guessing. Answer a few quick questions about your team and priorities,
              and we&rsquo;ll match you with the plan that actually fits, with clear reasoning
              for every recommendation.
            </motion.p>

            {/* Hero picture — above the CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <img
                src="/hero-picture.png"
                alt="Kota AI Agent"
                className="mx-auto w-full"
                style={{ maxWidth: 400, maxHeight: 220, objectFit: 'contain', border: '3px solid #000', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}
              />
            </motion.div>

            {/* Primary CTA */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="font-medium text-lg px-10 py-4 rounded-2xl text-white transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              style={{
                backgroundColor: 'var(--cloud-accent)',
                boxShadow: '0 8px 24px rgba(106, 92, 255, 0.25)',
              }}
            >
              Find your plan
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>

            {/* Trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm flex items-center justify-center gap-2 mt-4"
              style={{ color: 'var(--cloud-muted)' }}
            >
              <span style={{ color: '#00b894' }}>&#10003;</span>
              <span>Takes about 60 seconds</span>
              <span className="select-none" style={{ opacity: 0.4 }}>&middot;</span>
              <span>No signup required</span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── Benefit Cards ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          {BENEFIT_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
              className="rounded-2xl p-4 text-left"
              style={{
                backgroundColor: 'var(--cloud-card)',
                border: '1px solid var(--cloud-border)',
              }}
            >
              <span className="text-2xl mb-2 block">{card.emoji}</span>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--cloud-text)' }}>{card.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--cloud-muted)' }}>{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Trust Indicators ──────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--cloud-muted)' }}>Trusted by teams at</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['early-stage startups', 'scale-ups', 'remote teams', 'SMEs'].map((desc) => (
              <span
                key={desc}
                className="text-sm font-semibold"
                style={{ color: 'var(--cloud-muted)', opacity: 0.5 }}
              >
                {desc}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Footer watermark ──────────────────────────────────────────── */}
      <div className="py-6 text-center" style={{ backgroundColor: 'var(--cloud-bg)' }}>
        <div className="flex items-center justify-center gap-2" style={{ opacity: 0.45 }}>
          <span className="text-xs" style={{ color: 'var(--cloud-muted)' }}>Built for</span>
          <img src="/logo.png" alt="Kota" style={{ height: 18 }} />
          <span className="text-xs" style={{ color: 'var(--cloud-muted)' }}>Hackathon</span>
        </div>
      </div>
    </div>
  );
}
