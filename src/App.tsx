import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Quiz } from './components/Quiz';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsView } from './components/ResultsView';
import { scoreAndRankPlans, getRuleBasedExplanation } from './services/ai';
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

    // Step 2: Generate explanation (rule-based, no API dependency)
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const result = getRuleBasedExplanation(answers, ranked);
    setExplanation(result);
    setScreen('results');
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
