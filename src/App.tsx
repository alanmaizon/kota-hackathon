import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Quiz } from './components/Quiz';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsView } from './components/ResultsView';
import { getAIRecommendation, getRuleBased } from './services/ai';
import type { AppScreen, AIRecommendation, UserAnswers } from './types';

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  async function handleQuizComplete(answers: UserAnswers) {
    setScreen('loading');

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

    try {
      let result: AIRecommendation;
      if (apiKey && apiKey.trim() && apiKey !== 'your-openai-api-key-here') {
        result = await getAIRecommendation(answers, apiKey);
      } else {
        // Graceful fallback: use rule-based matching when no API key is provided
        await new Promise((resolve) => setTimeout(resolve, 2800)); // simulate thinking
        result = getRuleBased(answers);
      }
      setRecommendation(result);
      setScreen('results');
    } catch {
      // If AI call fails, fall back to rule-based
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRecommendation(getRuleBased(answers));
      setScreen('results');
    }
  }

  function handleRestart() {
    setRecommendation(null);
    setScreen('welcome');
  }

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('quiz')} />}
      {screen === 'quiz' && <Quiz onComplete={handleQuizComplete} />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'results' && recommendation && (
        <ResultsView recommendation={recommendation} onRestart={handleRestart} />
      )}
    </>
  );
}

export default App;
