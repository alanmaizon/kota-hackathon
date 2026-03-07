import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-2xl">🏥</span>
          </div>
          <span className="text-white font-bold text-3xl tracking-tight">kota</span>
        </motion.div>

        {/* Hero text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
        >
          Find your perfect{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            health plan
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-300 text-xl mb-10 leading-relaxed"
        >
          Answer 6 quick questions and our AI advisor will recommend the Kota plan
          that fits your life — personalised just for you.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            { emoji: '⚡', text: '2 minutes' },
            { emoji: '🤖', text: 'AI-powered' },
            { emoji: '🎯', text: 'Personalised' },
            { emoji: '🔒', text: 'No signup needed' },
          ].map(({ emoji, text }) => (
            <span
              key={text}
              className="bg-white/10 backdrop-blur-sm text-white/80 text-sm px-4 py-2 rounded-full border border-white/10"
            >
              {emoji} {text}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="bg-blue-500 hover:bg-blue-400 text-white font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 cursor-pointer"
        >
          Find my plan →
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-slate-500 text-sm mt-6"
        >
          Powered by AI · No personal data stored
        </motion.p>
      </motion.div>
    </div>
  );
}
