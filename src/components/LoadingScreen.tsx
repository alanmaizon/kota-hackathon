import { motion } from 'framer-motion';

export function LoadingScreen() {
  const steps = [
    { emoji: '🔍', text: 'Analysing your answers...' },
    { emoji: '🤖', text: 'Consulting our AI advisor...' },
    { emoji: '📊', text: 'Matching you to plans...' },
    { emoji: '✨', text: 'Crafting your recommendation...' },
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
            <span className="text-3xl">🤖</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Personalising your plan</h2>
        <p className="text-slate-400 mb-10">Our AI is working on your recommendation</p>

        {/* Animated steps */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.6, duration: 0.4 }}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 text-left"
            >
              <span>{step.emoji}</span>
              <span className="text-slate-300 text-sm">{step.text}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.6 + 0.3 }}
                className="ml-auto text-blue-400 text-sm"
              >
                ✓
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
