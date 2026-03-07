import { describe, it, expect } from 'vitest';
import { PLANS, QUESTIONS } from '../data/plans';
import { scoreAndRankPlans, getRuleBasedExplanation } from '../services/ai';
import type { UserAnswers } from '../types';

describe('Plan data', () => {
  it('has exactly 4 plans', () => {
    expect(PLANS).toHaveLength(4);
  });

  it('each plan has required fields', () => {
    for (const plan of PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.weights).toBeDefined();
    }
  });

  it('has the expected plan IDs', () => {
    const ids = PLANS.map((p) => p.id);
    expect(ids).toContain('essential');
    expect(ids).toContain('growth');
    expect(ids).toContain('premium');
    expect(ids).toContain('enterprise');
  });
});

describe('Questions data', () => {
  it('has 5 questions', () => {
    expect(QUESTIONS).toHaveLength(5);
  });

  it('each question has id, field, and question text', () => {
    for (const q of QUESTIONS) {
      expect(q.id).toBeTruthy();
      expect(q.field).toBeTruthy();
      expect(q.question).toBeTruthy();
    }
  });

  it('includes a free-text question', () => {
    const textQuestions = QUESTIONS.filter((q) => q.type === 'text');
    expect(textQuestions.length).toBeGreaterThan(0);
  });

  it('includes multi-select questions', () => {
    const multiQuestions = QUESTIONS.filter((q) => q.type === 'multi');
    expect(multiQuestions.length).toBeGreaterThan(0);
  });
});

describe('Scoring engine', () => {
  it('recommends Essential for minimal budget small team', () => {
    const answers: UserAnswers = {
      teamSize: '1-10',
      budget: 'minimal',
      priorities: [],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].plan.id).toBe('essential');
    expect(ranked[0].matchPercentage).toBeGreaterThan(70);
  });

  it('recommends Growth for moderate budget', () => {
    const answers: UserAnswers = {
      teamSize: '11-50',
      budget: 'moderate',
      priorities: ['mental-health', 'dental-optical'],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].plan.id).toBe('growth');
  });

  it('recommends Premium for competitive budget with priorities', () => {
    const answers: UserAnswers = {
      teamSize: '51-200',
      budget: 'competitive',
      priorities: ['mental-health', 'international'],
      dealbreakers: ['mental-health'],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].plan.id).toBe('premium');
  });

  it('penalizes plans that violate dealbreakers', () => {
    const answers: UserAnswers = {
      teamSize: '11-50',
      budget: 'minimal',
      priorities: ['dental-optical'],
      dealbreakers: ['dental-optical'],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    // Essential has dental: 0.0, so it should be penalized despite budget fit
    expect(ranked[0].plan.id).not.toBe('essential');
  });

  it('returns 4 plans with descending match percentages', () => {
    const answers: UserAnswers = {
      teamSize: '11-50',
      budget: 'moderate',
      priorities: ['mental-health'],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked).toHaveLength(4);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].matchPercentage).toBeLessThan(ranked[i - 1].matchPercentage);
    }
  });

  it('generates reasons and warnings', () => {
    const answers: UserAnswers = {
      teamSize: '11-50',
      budget: 'moderate',
      priorities: ['mental-health', 'international'],
      dealbreakers: ['international'],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].reasons.length).toBeGreaterThan(0);
    // Essential should warn about missing international (dealbreaker forces dimension to 1.0)
    const essential = ranked.find((r) => r.plan.id === 'essential');
    expect(essential?.warnings.length).toBeGreaterThan(0);
  });
});

describe('Rule-based explanation', () => {
  it('generates a complete explanation', () => {
    const answers: UserAnswers = {
      teamSize: '11-50',
      budget: 'moderate',
      priorities: ['mental-health'],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    const explanation = getRuleBasedExplanation(answers, ranked);
    expect(explanation.summary).toBeTruthy();
    expect(explanation.topPickHeadline).toBeTruthy();
    expect(explanation.topPickReasoning).toBeTruthy();
    expect(explanation.savingsTip).toBeTruthy();
  });
});
