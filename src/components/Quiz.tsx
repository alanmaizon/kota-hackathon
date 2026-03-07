import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from '../data/plans';
import { getSmartFollowUp } from '../services/ai';
import type { UserAnswers } from '../types';

interface QuizProps {
  onComplete: (answers: UserAnswers) => void;
}

export function Quiz({ onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [direction, setDirection] = useState(1);
  const [smartTip, setSmartTip] = useState<string | null>(null);

  const question = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isLast = currentIndex === QUESTIONS.length - 1;

  const currentAnswer = answers[question.field];

  const canProceed = (() => {
    if (question.type === 'text') return true;
    if (question.type === 'multi') return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    return currentAnswer !== undefined && currentAnswer !== '';
  })();

  const handleSingleSelect = useCallback(
    (value: string) => {
      const newAnswers = { ...answers, [question.field]: value };
      setAnswers(newAnswers);

      const tip = getSmartFollowUp(newAnswers);
      setSmartTip(tip);

      // Auto-advance after short delay
      setTimeout(() => {
        if (currentIndex < QUESTIONS.length - 1) {
          setDirection(1);
          setCurrentIndex((i) => i + 1);
          setSmartTip(null);
        }
      }, 400);
    },
    [answers, question.field, currentIndex],
  );

  function handleMultiToggle(value: string) {
    const current = Array.isArray(currentAnswer) ? (currentAnswer as string[]) : [];
    const maxSel = question.maxSelections || Infinity;

    let updated: string[];
    if (current.includes(value)) {
      updated = current.filter((v) => v !== value);
    } else if (current.length < maxSel) {
      updated = [...current, value];
    } else {
      return;
    }

    const newAnswers = { ...answers, [question.field]: updated };
    setAnswers(newAnswers);

    const tip = getSmartFollowUp(newAnswers);
    setSmartTip(tip);
  }

  function handleTextChange(value: string) {
    setAnswers((prev) => ({ ...prev, [question.field]: value }));
  }

  function goNext() {
    if (!canProceed && question.type !== 'text') return;
    if (isLast) {
      onComplete(answers);
      return;
    }
    setDirection(1);
    setSmartTip(null);
    setCurrentIndex((i) => i + 1);
  }

  function goBack() {
    if (currentIndex === 0) return;
    setDirection(-1);
    setSmartTip(null);
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
          className="text-slate-400 hover:text-white transition-colors disabled:opacity-0 cursor-pointer flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Back
        </button>
        <span className="text-slate-400 text-sm">
          Step {currentIndex + 1} of {QUESTIONS.length}
        </span>
        <span className="text-slate-500 text-sm w-16 text-right">
          {Math.round(progress)}%
        </span>
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
              <p className="text-slate-400 mb-2">{question.subtext}</p>
            )}
            {question.maxSelections && (
              <p className="text-blue-400 text-sm font-medium mb-6">
                Select up to {question.maxSelections}
              </p>
            )}
            {!question.maxSelections && question.subtext && <div className="mb-6" />}

            {/* Single select options */}
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
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block">{opt.label}</span>
                        {opt.desc && (
                          <span className="text-sm text-slate-400 block">{opt.desc}</span>
                        )}
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l2.5 2.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Multi select options */}
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
                      <span className="font-medium flex-1">{opt.label}</span>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l2.5 2.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Text input */}
            {question.type === 'text' && (
              <textarea
                value={(currentAnswer as string) ?? ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              />
            )}

            {/* Smart AI Tip */}
            <AnimatePresence>
              {smartTip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex gap-3"
                >
                  <span className="text-amber-400 shrink-0 mt-0.5">&#10024;</span>
                  <div>
                    <p className="text-amber-300 text-sm font-medium">AI Insight</p>
                    <p className="text-amber-200/80 text-sm">{smartTip}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button (shown for multi-select and text, hidden for single since auto-advance) */}
            {(question.type === 'multi' || question.type === 'text' || (question.type === 'single' && isLast)) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={goNext}
                disabled={!canProceed && question.type !== 'text'}
                className={`mt-8 w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 ${
                  canProceed || question.type === 'text'
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLast ? 'Get my results' : 'Continue'}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7.5 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
