import { describe, it, expect } from 'vitest';
import { PLANS, QUESTIONS } from '../data/plans';
import { getRuleBased } from '../services/ai';
import type { UserAnswers } from '../types';

describe('Plan data', () => {
  it('has exactly 4 plans', () => {
    expect(PLANS).toHaveLength(4);
  });

  it('each plan has required fields', () => {
    for (const plan of PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(plan.monthlyPrice).toBeGreaterThan(0);
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });

  it('plans are ordered by price ascending', () => {
    const prices = PLANS.map((p) => p.monthlyPrice);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it('has the expected plan IDs', () => {
    const ids = PLANS.map((p) => p.id);
    expect(ids).toContain('essential');
    expect(ids).toContain('standard');
    expect(ids).toContain('premium');
    expect(ids).toContain('elite');
  });
});

describe('Questions data', () => {
  it('has 6 questions', () => {
    expect(QUESTIONS).toHaveLength(6);
  });

  it('each question has id and question text', () => {
    for (const q of QUESTIONS) {
      expect(q.id).toBeTruthy();
      expect(q.question).toBeTruthy();
    }
  });

  it('includes a free-text question', () => {
    const textQuestions = QUESTIONS.filter((q) => q.type === 'text');
    expect(textQuestions.length).toBeGreaterThan(0);
  });

  it('includes a multi-select question', () => {
    const multiQuestions = QUESTIONS.filter((q) => q.type === 'multi');
    expect(multiQuestions.length).toBeGreaterThan(0);
  });
});

describe('Rule-based fallback recommendation', () => {
  it('recommends Essential for under_50 budget', () => {
    const answers: UserAnswers = {
      situation: 'first_time',
      coverage: 'just_me',
      health: 'great',
      priorities: [],
      budget: 'under_50',
      extras: '',
    };
    const result = getRuleBased(answers);
    expect(result.recommendedPlanId).toBe('essential');
    expect(result.matchScore).toBeGreaterThan(70);
  });

  it('recommends Elite for over_200 budget', () => {
    const answers: UserAnswers = {
      situation: 'new_job',
      coverage: 'just_me',
      health: 'good',
      priorities: ['travel', 'wellness'],
      budget: 'over_200',
      extras: '',
    };
    const result = getRuleBased(answers);
    expect(result.recommendedPlanId).toBe('elite');
  });

  it('recommends Standard for 50_100 budget', () => {
    const answers: UserAnswers = {
      situation: 'switching',
      coverage: 'me_partner',
      health: 'good',
      priorities: ['dental', 'optical'],
      budget: '50_100',
      extras: '',
    };
    const result = getRuleBased(answers);
    expect(result.recommendedPlanId).toBe('standard');
  });

  it('recommends Premium for 100_200 budget', () => {
    const answers: UserAnswers = {
      situation: 'family_change',
      coverage: 'me_family',
      health: 'good',
      priorities: ['family_care', 'mental_health'],
      budget: '100_200',
      extras: 'We have two young children',
    };
    const result = getRuleBased(answers);
    expect(result.recommendedPlanId).toBe('premium');
  });

  it('always returns a valid plan ID', () => {
    const validIds = PLANS.map((p) => p.id);
    const testCases: UserAnswers[] = [
      { situation: 'new_job', coverage: 'just_me', health: 'great', priorities: [], budget: 'under_50', extras: '' },
      { situation: 'self_employed', coverage: 'me_partner', health: 'good', priorities: ['dental'], budget: '50_100', extras: '' },
      { situation: 'switching', coverage: 'me_family', health: 'managing', priorities: ['mental_health', 'physio'], budget: '100_200', extras: '' },
      { situation: 'first_time', coverage: 'just_me', health: 'complex', priorities: ['fast_access', 'travel'], budget: 'over_200', extras: 'I travel frequently' },
    ];

    for (const answers of testCases) {
      const result = getRuleBased(answers);
      expect(validIds).toContain(result.recommendedPlanId);
      expect(result.headline).toBeTruthy();
      expect(result.reasoning).toBeTruthy();
      expect(result.keyBenefits.length).toBeGreaterThan(0);
      expect(result.matchScore).toBeGreaterThanOrEqual(70);
      expect(result.matchScore).toBeLessThanOrEqual(100);
    }
  });

  it('boosts match score for complex health needs', () => {
    const baseAnswers: UserAnswers = {
      situation: 'switching',
      coverage: 'just_me',
      health: 'great',
      priorities: [],
      budget: '50_100',
      extras: '',
    };
    const complexAnswers: UserAnswers = {
      ...baseAnswers,
      health: 'complex',
    };
    const baseResult = getRuleBased(baseAnswers);
    const complexResult = getRuleBased(complexAnswers);
    expect(complexResult.matchScore).toBeGreaterThanOrEqual(baseResult.matchScore);
  });
});
