export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  color: string;
  accentColor: string;
  icon: string;
  features: string[];
  bestFor: string[];
  limitations: string[];
}

export type QuestionType = 'single' | 'multi' | 'text' | 'range';

export interface QuestionOption {
  value: string;
  label: string;
  emoji: string;
}

export interface Question {
  id: string;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

export type UserAnswers = Record<string, string | string[] | number>;

export interface AIRecommendation {
  recommendedPlanId: string;
  matchScore: number;
  headline: string;
  reasoning: string;
  keyBenefits: string[];
  savingsTip?: string;
}

export type AppScreen = 'welcome' | 'quiz' | 'loading' | 'results';
