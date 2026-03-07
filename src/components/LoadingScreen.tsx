import { motion } from 'framer-motion';

export function LoadingScreen() {
  const steps = [
    'Reading your team profile...',
    'Scoring budget fit across plans...',
    'Matching coverage priorities...',
    'Generating personalised insights...',
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--cloud-bg)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Pulsing orb */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full blur-xl"
            style={{ backgroundColor: 'var(--cloud-accent)' }}
          />
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(106, 92, 255, 0.08)',
              border: '1px solid rgba(106, 92, 255, 0.2)',
            }}
          >
            <span className="text-3xl">&#10024;</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--cloud-text)' }}>Analysing your responses...</h2>
        <p className="mb-8" style={{ color: 'var(--cloud-muted)' }}>Our AI is scoring plans across 11 dimensions to find your best match</p>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mb-8">
          <motion.div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cloud-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--cloud-accent)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* Animated steps */}
        <div className="space-y-2">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5, duration: 0.4 }}
              className="flex items-center gap-3 text-left"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5 + 0.3 }}
                className="text-sm shrink-0"
                style={{ color: '#00b894' }}
              >
                &#10003;
              </motion.span>
              <span className="text-sm" style={{ color: 'var(--cloud-muted)' }}>{step}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
