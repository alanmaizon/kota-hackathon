import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from '../data/plans';
import type { UserAnswers } from '../types';

interface QuizProps {
  onComplete: (answers: UserAnswers) => void;
}

export function Quiz({ onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [direction, setDirection] = useState(1);

  const question = QUESTIONS[currentIndex];
  const progress = ((currentIndex) / QUESTIONS.length) * 100;
  const isLast = currentIndex === QUESTIONS.length - 1;

  const currentAnswer = answers[question.id];

  const canProceed = (() => {
    if (question.type === 'text') return true; // optional free text
    if (question.type === 'multi') return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    return currentAnswer !== undefined && currentAnswer !== '';
  })();

  function handleSingleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleMultiToggle(value: string) {
    const current = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setAnswers((prev) => ({ ...prev, [question.id]: updated }));
  }

  function handleTextChange(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function goNext() {
    if (!canProceed && question.type !== 'text') return;
    if (isLast) {
      onComplete(answers);
      return;
    }
    setDirection(1);
    setCurrentIndex((i) => i + 1);
  }

  function goBack() {
    if (currentIndex === 0) return;
    setDirection(-1);
    setCurrentIndex((i) => i - 1);
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/10">
        <motion.div
          className="h-full bg-blue-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="text-slate-400 hover:text-white transition-colors disabled:opacity-0 cursor-pointer"
        >
          ← Back
        </button>
        <span className="text-slate-400 text-sm">
          {currentIndex + 1} of {QUESTIONS.length}
        </span>
        <div className="w-16" />
      </div>

      {/* Question card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full max-w-2xl"
          >
            {/* Question */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {question.question}
            </h2>
            {question.subtext && (
              <p className="text-slate-400 mb-8">{question.subtext}</p>
            )}

            {/* Options */}
            {question.type === 'single' && question.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt) => {
                  const selected = currentAnswer === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSingleSelect(opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer ${
                        selected
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="font-medium">{opt.label}</span>
                      {selected && <span className="ml-auto text-blue-400">✓</span>}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {question.type === 'multi' && question.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt) => {
                  const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.value);
                  return (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMultiToggle(opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer ${
                        selected
                          ? 'border-violet-500 bg-violet-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="font-medium">{opt.label}</span>
                      {selected && <span className="ml-auto text-violet-400">✓</span>}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {question.type === 'text' && (
              <textarea
                value={(currentAnswer as string) ?? ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              />
            )}

            {/* Next button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={goNext}
              disabled={!canProceed && question.type !== 'text'}
              className={`mt-8 w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 cursor-pointer ${
                canProceed || question.type === 'text'
                  ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLast ? '✨ Get my recommendation' : 'Continue →'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
