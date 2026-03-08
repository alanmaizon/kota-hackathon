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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cloud-bg)' }}>
      {/* Progress bar */}
      <div className="w-full h-1" style={{ backgroundColor: 'var(--cloud-border)' }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: 'var(--cloud-accent)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="w-16 transition-colors disabled:opacity-0 cursor-pointer flex items-center gap-1 hover:opacity-70"
          style={{ color: 'var(--cloud-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Back
        </button>
        <span className="text-sm" style={{ color: 'var(--cloud-muted)' }}>
          Step {currentIndex + 1} of {QUESTIONS.length}
        </span>
        <span className="text-sm w-16 text-right" style={{ color: 'var(--cloud-muted)', opacity: 0.6 }}>
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
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--cloud-text)' }}>
              {question.question}
            </h2>
            {question.subtext && (
              <p className="mb-2" style={{ color: 'var(--cloud-muted)' }}>{question.subtext}</p>
            )}
            {question.maxSelections && (
              <p className="text-sm font-medium mb-6" style={{ color: 'var(--cloud-accent)' }}>
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
                      className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-150 cursor-pointer"
                      style={{
                        backgroundColor: selected ? 'rgba(106, 92, 255, 0.06)' : 'var(--cloud-card)',
                        border: selected ? '2px solid var(--cloud-accent)' : '1px solid var(--cloud-border)',
                        color: 'var(--cloud-text)',
                      }}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block">{opt.label}</span>
                        {opt.desc && (
                          <span className="text-sm block" style={{ color: 'var(--cloud-muted)' }}>{opt.desc}</span>
                        )}
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--cloud-accent)' }}
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
                      className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-150 cursor-pointer"
                      style={{
                        backgroundColor: selected ? 'rgba(106, 92, 255, 0.06)' : 'var(--cloud-card)',
                        border: selected ? '2px solid var(--cloud-accent)' : '1px solid var(--cloud-border)',
                        color: 'var(--cloud-text)',
                      }}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="font-medium flex-1">{opt.label}</span>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--cloud-accent)' }}
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
                className="w-full rounded-2xl p-4 resize-none focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--cloud-card)',
                  border: '1px solid var(--cloud-border)',
                  color: 'var(--cloud-text)',
                }}
              />
            )}

            {/* Smart AI Tip */}
            <AnimatePresence>
              {smartTip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 rounded-2xl flex gap-3"
                  style={{
                    backgroundColor: 'rgba(106, 92, 255, 0.04)',
                    border: '1px solid rgba(106, 92, 255, 0.12)',
                  }}
                >
                  <span className="shrink-0 mt-0.5" style={{ color: 'var(--cloud-accent)' }}>&#10024;</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--cloud-accent)' }}>AI Insight</p>
                    <p className="text-sm" style={{ color: 'var(--cloud-muted)' }}>{smartTip}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {(question.type === 'multi' || question.type === 'text' || (question.type === 'single' && isLast)) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={goNext}
                disabled={!canProceed && question.type !== 'text'}
                className="mt-8 w-full py-4 rounded-2xl font-medium text-lg transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2"
                style={
                  canProceed || question.type === 'text'
                    ? {
                        backgroundColor: 'var(--cloud-accent)',
                        color: '#ffffff',
                        boxShadow: '0 4px 16px rgba(106, 92, 255, 0.2)',
                      }
                    : {
                        backgroundColor: 'var(--cloud-border)',
                        color: 'var(--cloud-muted)',
                        cursor: 'not-allowed',
                      }
                }
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
