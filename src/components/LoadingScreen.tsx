import { motion } from 'framer-motion';

export function LoadingScreen() {
  const steps = [
    'Reading your team profile...',
    'Scoring budget fit across plans...',
    'Matching coverage priorities...',
    'Generating personalised insights...',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Pulsing orb */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
          />
          <div className="relative w-full h-full bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center">
            <span className="text-3xl">&#10024;</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Analysing your responses...</h2>
        <p className="text-slate-400 mb-8">Our AI is scoring plans across 11 dimensions to find your best match</p>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mb-8">
          <motion.div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
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
                className="text-blue-400 text-sm shrink-0"
              >
                &#10003;
              </motion.span>
              <span className="text-slate-300 text-sm">{step}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
