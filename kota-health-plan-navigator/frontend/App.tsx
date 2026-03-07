import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '', vertexai: true });

// Simple helper to render basic markdown-like text
const MarkdownRenderer = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold mt-4">{line.replace('###', '')}</h3>;
        if (line.startsWith('**')) return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
        if (line.startsWith('-')) return <li key={i} className="ml-4 list-disc">{line.replace('-', '')}</li>;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const questions = [
    { id: 'age', text: 'What is your age range?', options: ['18-25', '26-35', '36-50', '50+'] },
    { id: 'family', text: 'Who are you covering?', options: ['Just myself', 'Myself and partner', 'Full family'] },
    { id: 'priority', text: 'What is your main priority?', options: ['Low monthly cost', 'Comprehensive coverage', 'Mental health support', 'Dental/Vision focus'] }
  ];

  const handleAnswer = async (answer: string) => {
    const newAnswers = { ...answers, [questions[step].id]: answer };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const stream = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: {
            role: 'user',
            parts: [{ text: `Act as a Kota insurance expert. Based on these user preferences: ${JSON.stringify(newAnswers)}, recommend a health insurance plan strategy and explain why in a friendly, concise tone. Use markdown formatting.` }]
          }
        });
        
        let fullText = '';
        for await (const chunk of stream) {
          fullText += chunk.text;
          setResult(fullText);
        }
      } catch (e) {
        setResult('Sorry, we had trouble connecting to our AI advisor. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">Kota Navigator</h1>
        <p className="text-slate-600">Find your perfect health plan in seconds.</p>
      </header>

      <main className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        {loading && !result ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Analyzing your needs...</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Recommended Plan</h2>
            <div className="text-slate-700">
              <MarkdownRenderer text={result} />
            </div>
            <button onClick={() => window.location.reload()} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 mt-6">Start Over</button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{questions[step].text}</h2>
            <div className="grid gap-3">
              {questions[step].options.map(opt => (
                <button 
                  key={opt} 
                  onClick={() => handleAnswer(opt)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="text-sm text-slate-400 text-center">Step {step + 1} of {questions.length}</div>
          </div>
        )}
      </main>
    </div>
  );
}