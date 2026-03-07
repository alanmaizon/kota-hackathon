import { describe, it, expect } from 'vitest';
import { PLANS, QUESTIONS } from '../data/plans';
import { scoreAndRankPlans, getRuleBasedExplanation } from '../services/ai';
import type { UserAnswers } from '../types';

describe('Plan data', () => {
  it('has exactly 3 plans', () => {
    expect(PLANS).toHaveLength(3);
  });

  it('each plan has required fields', () => {
    for (const plan of PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.weights).toBeDefined();
      expect(plan.price).toBeTruthy();
      expect(plan.teamSize).toBeTruthy();
    }
  });

  it('has the expected plan IDs', () => {
    const ids = PLANS.map((p) => p.id);
    expect(ids).toContain('startup');
    expect(ids).toContain('scaleup');
    expect(ids).toContain('growth');
  });

  it('contains canonical pricing data', () => {
    const startup = PLANS.find((p) => p.id === 'startup')!;
    expect(startup.price).toContain('9');
    expect(startup.teamSize).toContain('30');

    const scaleup = PLANS.find((p) => p.id === 'scaleup')!;
    expect(scaleup.price).toContain('6');
    expect(scaleup.teamSize).toContain('200');

    const growth = PLANS.find((p) => p.id === 'growth')!;
    expect(growth.price).toBe('Talk to our team');
    expect(growth.teamSize).toContain('201');
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
  it('recommends Startup for minimal budget small team', () => {
    const answers: UserAnswers = {
      teamSize: '1-10',
      budget: 'minimal',
      priorities: [],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].plan.id).toBe('startup');
    expect(ranked[0].matchPercentage).toBeGreaterThan(70);
  });

  it('recommends Scaleup for moderate budget mid-size team', () => {
    const answers: UserAnswers = {
      teamSize: '31-200',
      budget: 'moderate',
      priorities: ['mental-health', 'dental-optical'],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].plan.id).toBe('scaleup');
  });

  it('recommends Growth for best-in-class budget large team', () => {
    const answers: UserAnswers = {
      teamSize: '200+',
      budget: 'best-in-class',
      priorities: ['mental-health', 'international'],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].plan.id).toBe('growth');
  });

  it('penalizes plans that violate dealbreakers', () => {
    const answers: UserAnswers = {
      teamSize: '31-200',
      budget: 'moderate',
      priorities: ['international'],
      dealbreakers: ['international'],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    // Startup has international: 0.0, so it should be penalized
    expect(ranked[0].plan.id).not.toBe('startup');
  });

  it('returns 3 plans with descending match percentages', () => {
    const answers: UserAnswers = {
      teamSize: '31-200',
      budget: 'moderate',
      priorities: ['mental-health'],
      dealbreakers: [],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked).toHaveLength(3);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].matchPercentage).toBeLessThan(ranked[i - 1].matchPercentage);
    }
  });

  it('generates reasons and warnings', () => {
    const answers: UserAnswers = {
      teamSize: '31-200',
      budget: 'moderate',
      priorities: ['mental-health', 'international'],
      dealbreakers: ['international'],
      extras: '',
    };
    const ranked = scoreAndRankPlans(answers);
    expect(ranked[0].reasons.length).toBeGreaterThan(0);
    // Startup should warn about missing international (dealbreaker forces dimension to 1.0)
    const startup = ranked.find((r) => r.plan.id === 'startup');
    expect(startup?.warnings.length).toBeGreaterThan(0);
  });
});

describe('Rule-based explanation', () => {
  it('generates a complete explanation', () => {
    const answers: UserAnswers = {
      teamSize: '31-200',
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
