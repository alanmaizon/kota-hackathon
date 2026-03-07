import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

const benefits = [
  { icon: '\u2728', title: 'AI-powered matching', desc: 'Our engine analyses 11 dimensions to find your perfect fit' },
  { icon: '\u26A1', title: 'Takes about 60 seconds', desc: 'A few thoughtful questions replace endless comparison spreadsheets' },
  { icon: '\uD83C\uDFAF', title: 'Personalised insights', desc: 'Understand why a plan suits you, not just what it covers' },
  { icon: '\uD83D\uDC65', title: 'Built for teams', desc: 'Recommendations tailored to your team size, stage, and goals' },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cloud-bg)' }}>
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* hero-background: absolute base layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/hero-background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        {/* Overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(247, 246, 243, 0.5)', zIndex: 0 }}
        />

        {/* hero-content container */}
        <div
          className="relative hero-container"
          style={{ zIndex: 1 }}
        >
          <div className="hero-grid items-center">
            {/* ─── Left column: text + CTA ─── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  color: 'var(--cloud-accent)',
                  border: '1px solid rgba(106, 92, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  marginBottom: 28,
                }}
              >
                <span>&#10024;</span>
                <span className="font-medium">AI-Powered Plan Picker</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight"
                style={{ color: 'var(--cloud-text)', marginBottom: 16 }}
              >
                Find the right health plan{' '}
                <span style={{ color: 'var(--cloud-accent)' }}>
                  for your team
                </span>
              </motion.h1>

              {/* Description — 16px below headline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-lg leading-relaxed"
                style={{ color: 'var(--cloud-muted)', marginBottom: 28 }}
              >
                Stop guessing. Answer a few quick questions about your team and priorities,
                and we&rsquo;ll match you with the plan that actually fits &mdash; with clear reasoning
                for every recommendation.
              </motion.p>

              {/* Primary CTA — 28px below description */}
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
                className="text-sm flex items-center gap-2"
                style={{ color: 'var(--cloud-muted)', marginTop: 16 }}
              >
                <span style={{ color: '#00b894' }}>&#10003;</span>
                Takes about 60 seconds &middot; No signup required
              </motion.p>
            </motion.div>

            {/* ─── Right column: hero-picture-card ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center justify-center"
            >
              <div className="hero-picture-card">
                <img
                  src="/hero-picture.png"
                  alt="Kota Health Plan Picker illustration"
                  className="hero-picture-img"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Benefit cards (overlapping hero via negative margin) ──────── */}
      <div style={{ backgroundColor: 'var(--cloud-card)', marginTop: -48 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto px-6"
          style={{ maxWidth: 1200, paddingTop: 64, paddingBottom: 64 }}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="rounded-2xl p-5 flex gap-4 transition-colors"
                style={{
                  backgroundColor: 'var(--cloud-bg)',
                  border: '1px solid var(--cloud-border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(106, 92, 255, 0.08)' }}
                >
                  <span className="text-lg">{b.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--cloud-text)' }}>{b.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--cloud-muted)' }}>{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Trusted by ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="py-12 text-center"
        style={{ backgroundColor: 'var(--cloud-bg)' }}
      >
        <p className="text-sm mb-4" style={{ color: 'var(--cloud-muted)' }}>Trusted by teams at</p>
        <div className="flex items-center justify-center gap-8 flex-wrap" style={{ opacity: 0.5 }}>
          {['Intercom', 'Stripe', 'Personio', 'Wayflyer', 'Flipdish'].map((name) => (
            <span key={name} className="text-sm font-semibold tracking-wide" style={{ color: 'var(--cloud-text)' }}>
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
