export interface PlanFeature {
  name: string;
  included: boolean;
  detail?: string;
  highlight?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tier: 'startup' | 'scaleup' | 'growth';
  tagline: string;
  price: string;
  teamSize: string;
  features: PlanFeature[];
  coverageHighlights: string[];
  bestFor: string;
  color: string;
  icon: string;
  weights: {
    budgetSensitivity: number;
    comprehensiveness: number;
    mentalHealth: number;
    dental: number;
    optical: number;
    international: number;
    familyCoverage: number;
    wellbeing: number;
    speedOfAccess: number;
    startupFriendly: number;
    scalability: number;
  };
}

export type QuestionType = 'single' | 'multi' | 'text';

export interface QuestionOption {
  value: string;
  label: string;
  emoji: string;
  desc?: string;
}

export interface Question {
  id: string;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  maxSelections?: number;
  field: string;
}

export type UserAnswers = Record<string, string | string[]>;

export interface ScoredPlan {
  plan: Plan;
  score: number;
  matchPercentage: number;
  reasons: string[];
  warnings: string[];
  personalizedInsight: string;
}

export interface AIExplanation {
  summary: string;
  topPickHeadline: string;
  topPickReasoning: string;
  savingsTip?: string;
}

export type AppScreen = 'welcome' | 'quiz' | 'loading' | 'results';
