import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Quiz } from './components/Quiz';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsView } from './components/ResultsView';
import { scoreAndRankPlans, getAIExplanation, getRuleBasedExplanation } from './services/ai';
import type { AppScreen, ScoredPlan, AIExplanation, UserAnswers } from './types';

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [scoredPlans, setScoredPlans] = useState<ScoredPlan[]>([]);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);

  async function handleQuizComplete(answers: UserAnswers) {
    setScreen('loading');

    // Step 1: Run deterministic scoring engine (instant)
    const ranked = scoreAndRankPlans(answers);
    setScoredPlans(ranked);

    // Step 2: Try LLM explanation, fall back to rule-based
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

    try {
      let result: AIExplanation;
      if (apiKey && apiKey.trim() && apiKey !== 'your-openai-api-key-here') {
        result = await getAIExplanation(answers, ranked, apiKey);
      } else {
        // Simulate thinking time for rule-based fallback
        await new Promise((resolve) => setTimeout(resolve, 2500));
        result = getRuleBasedExplanation(answers, ranked);
      }
      setExplanation(result);
      setScreen('results');
    } catch {
      // If LLM fails, fall back to rule-based explanation
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExplanation(getRuleBasedExplanation(answers, ranked));
      setScreen('results');
    }
  }

  function handleRestart() {
    setScoredPlans([]);
    setExplanation(null);
    setScreen('welcome');
  }

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('quiz')} />}
      {screen === 'quiz' && <Quiz onComplete={handleQuizComplete} />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'results' && explanation && (
        <ResultsView
          scoredPlans={scoredPlans}
          explanation={explanation}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default App;
