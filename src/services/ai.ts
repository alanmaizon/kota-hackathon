import OpenAI from 'openai';
import { PLANS } from '../data/plans';
import type { ScoredPlan, AIExplanation, UserAnswers, Plan } from '../types';

// ─── Scoring Engine (deterministic, runs client-side) ────────────────────────

const PRIORITY_MAP: Record<string, string[]> = {
  'mental-health': ['mentalHealth'],
  'dental-optical': ['dental', 'optical'],
  'international': ['international'],
  'family': ['familyCoverage'],
  'wellness': ['wellbeing'],
  'talent-attraction': ['comprehensiveness'],
  'cost-effective': ['budgetSensitivity'],
  'speed': ['speedOfAccess'],
};

function buildUserProfile(answers: UserAnswers): Record<string, number> {
  const profile: Record<string, number> = {
    budgetSensitivity: 0.5,
    comprehensiveness: 0.5,
    mentalHealth: 0.5,
    dental: 0.5,
    optical: 0.5,
    international: 0.3,
    familyCoverage: 0.3,
    wellbeing: 0.5,
    speedOfAccess: 0.5,
    startupFriendly: 0.5,
    scalability: 0.5,
  };

  switch (answers.teamSize as string) {
    case '1-10':
      profile.startupFriendly = 1.0;
      profile.scalability = 0.3;
      profile.speedOfAccess = 0.9;
      break;
    case '11-50':
      profile.startupFriendly = 0.7;
      profile.scalability = 0.7;
      break;
    case '51-200':
      profile.startupFriendly = 0.3;
      profile.scalability = 0.9;
      break;
    case '200+':
      profile.startupFriendly = 0.1;
      profile.scalability = 1.0;
      break;
  }

  switch (answers.budget as string) {
    case 'minimal':
      profile.budgetSensitivity = 1.0;
      profile.comprehensiveness = 0.2;
      break;
    case 'moderate':
      profile.budgetSensitivity = 0.6;
      profile.comprehensiveness = 0.6;
      break;
    case 'competitive':
      profile.budgetSensitivity = 0.3;
      profile.comprehensiveness = 0.8;
      break;
    case 'best-in-class':
      profile.budgetSensitivity = 0.1;
      profile.comprehensiveness = 1.0;
      break;
  }

  const priorities = (answers.priorities as string[]) || [];
  priorities.forEach((p) => {
    const dims = PRIORITY_MAP[p] || [];
    dims.forEach((d) => {
      profile[d] = Math.min((profile[d] || 0.5) + 0.3, 1);
    });
  });

  const dealbreakers = (answers.dealbreakers as string[]) || [];
  dealbreakers.forEach((db) => {
    const dims = PRIORITY_MAP[db] || [];
    dims.forEach((dim) => {
      profile[dim] = 1.0;
    });
  });

  return profile;
}

function getBudgetFit(plan: Plan, budgetMindset: string): number {
  if (plan.monthlyPrice.max === 0) return 0.7;
  switch (budgetMindset) {
    case 'minimal':
      return plan.tier === 'starter' ? 1.0 : plan.tier === 'growth' ? 0.5 : 0.2;
    case 'moderate':
      return plan.tier === 'growth' ? 1.0 : plan.tier === 'starter' ? 0.8 : 0.4;
    case 'competitive':
      return plan.tier === 'premium' ? 1.0 : plan.tier === 'growth' ? 0.8 : 0.3;
    case 'best-in-class':
      return plan.tier === 'premium' ? 1.0 : plan.tier === 'enterprise' ? 0.9 : 0.4;
    default:
      return 0.7;
  }
}

function generateReasons(plan: Plan, profile: Record<string, number>): string[] {
  const reasons: string[] = [];

  if (profile.budgetSensitivity > 0.7 && plan.weights.budgetSensitivity > 0.7)
    reasons.push('Fits within your budget-conscious approach without sacrificing essentials');
  if (profile.mentalHealth > 0.6 && plan.weights.mentalHealth > 0.6) {
    const mh = plan.features.find((f) => f.name === 'Mental health');
    if (mh?.included) reasons.push(`Strong mental health support: ${mh.detail}`);
  }
  if (profile.dental > 0.6 && plan.weights.dental > 0.6)
    reasons.push('Includes the dental coverage your team needs');
  if (profile.international > 0.6 && plan.weights.international > 0.6)
    reasons.push('International coverage for your distributed team');
  if (profile.startupFriendly > 0.7 && plan.weights.startupFriendly > 0.7)
    reasons.push('Designed for fast-moving teams with quick setup');
  if (profile.scalability > 0.7 && plan.weights.scalability > 0.7)
    reasons.push('Scales smoothly as your team grows');
  if (profile.wellbeing > 0.7 && plan.weights.wellbeing > 0.7)
    reasons.push('Comprehensive wellness programme to keep your team thriving');
  if (profile.familyCoverage > 0.7 && plan.weights.familyCoverage > 0.7)
    reasons.push('Family coverage options for employees with dependents');
  if (profile.comprehensiveness > 0.8 && plan.weights.comprehensiveness > 0.8)
    reasons.push('Industry-leading breadth of coverage to attract top talent');

  if (reasons.length < 2) {
    if (plan.tier === 'starter') reasons.push('Get started quickly with no minimum commitment');
    if (plan.tier === 'growth') reasons.push('The most popular plan among similar companies');
    if (plan.tier === 'premium') reasons.push('Best-in-class benefits your team will love');
    if (plan.tier === 'enterprise') reasons.push('Fully customisable to your exact requirements');
  }

  return reasons.slice(0, 4);
}

function generateWarnings(plan: Plan, profile: Record<string, number>): string[] {
  const warnings: string[] = [];
  if (profile.dental > 0.7 && plan.weights.dental < 0.3)
    warnings.push('Does not include dental coverage');
  if (profile.international > 0.7 && plan.weights.international < 0.3)
    warnings.push('No international coverage \u2014 consider upgrading if hiring abroad');
  if (profile.mentalHealth > 0.8 && plan.weights.mentalHealth < 0.5)
    warnings.push('Limited mental health sessions \u2014 may not meet your team\'s needs');
  if (profile.scalability > 0.8 && plan.weights.scalability < 0.5)
    warnings.push('May require plan changes as your team grows significantly');
  return warnings;
}

function generateInsight(plan: Plan, profile: Record<string, number>, rank: number): string {
  if (rank === 0) {
    if (plan.tier === 'starter')
      return 'This plan gives you exactly what your team needs right now. It\'s lean, fast to set up, and lets you invest your budget where it matters most. You can always upgrade as you grow.';
    if (plan.tier === 'growth')
      return 'This is the sweet spot for your team. You get solid coverage that shows employees you\'re serious about their wellbeing, without the enterprise price tag. 60% of companies your size choose this plan.';
    if (plan.tier === 'premium')
      return 'Your team deserves the best, and this plan delivers. Unlimited mental health support, international coverage, and family options make this a powerful recruitment and retention tool.';
    return 'With your team\'s complexity, a bespoke solution makes the most sense. We\'ll design coverage that fits your exact needs across every location and entity.';
  }
  if (rank === 1) {
    return `A strong alternative worth considering. It scores ${profile.budgetSensitivity > 0.6 ? 'well on value' : 'highly on coverage'}, though your top match edges it out on the dimensions that matter most to you.`;
  }
  return 'This plan could work for specific teams within your organisation, or as a future upgrade path.';
}

export function scoreAndRankPlans(answers: UserAnswers): ScoredPlan[] {
  const profile = buildUserProfile(answers);
  const dimensions = Object.keys(profile);
  const budget = (answers.budget as string) || 'moderate';

  const scored = PLANS.map((plan) => {
    let totalScore = 0;
    let totalWeight = 0;
    let dealbreakersViolated = 0;

    dimensions.forEach((dim) => {
      const userNeed = profile[dim];
      const planStrength = plan.weights[dim as keyof typeof plan.weights] ?? 0;

      if (userNeed < 0.3) return;

      const dimScore = planStrength * userNeed;
      totalScore += dimScore;
      totalWeight += userNeed;
    });

    const dealbreakers = (answers.dealbreakers as string[]) || [];
    dealbreakers.forEach((db) => {
      const dims = PRIORITY_MAP[db] || [];
      dims.forEach((dim) => {
        if ((plan.weights[dim as keyof typeof plan.weights] || 0) < 0.5) {
          dealbreakersViolated++;
        }
      });
    });

    let normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    normalizedScore *= Math.pow(0.5, dealbreakersViolated);
    normalizedScore *= getBudgetFit(plan, budget);

    return {
      plan,
      score: normalizedScore,
      matchPercentage: 0,
      reasons: [] as string[],
      warnings: [] as string[],
      personalizedInsight: '',
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const maxScore = scored[0].score;
  const minScore = scored[scored.length - 1].score;
  const range = maxScore - minScore || 1;

  scored.forEach((s, i) => {
    const normalized = (s.score - minScore) / range;
    s.matchPercentage = Math.round(55 + normalized * 40);
    if (i > 0 && s.matchPercentage >= scored[i - 1].matchPercentage) {
      s.matchPercentage = scored[i - 1].matchPercentage - 3;
    }
    s.matchPercentage = Math.max(40, Math.min(95, s.matchPercentage));
    s.reasons = generateReasons(s.plan, profile);
    s.warnings = generateWarnings(s.plan, profile);
    s.personalizedInsight = generateInsight(s.plan, profile, i);
  });

  return scored;
}

// ─── Smart Follow-Up Tips ───────────────────────────────────────────────────

export function getSmartFollowUp(answers: Partial<UserAnswers>): string | null {
  if (answers.teamSize === '200+' && !((answers.dealbreakers as string[])?.length)) {
    return 'With a team that size, international coverage and custom integrations often become critical. Consider flagging those as must-haves.';
  }
  if (
    (answers.priorities as string[])?.includes('mental-health') &&
    answers.budget === 'minimal'
  ) {
    return 'Mental health support is a top priority, but your budget is tight. Growth plan offers 12 sessions/year at moderate cost \u2014 a solid middle ground.';
  }
  if (
    (answers.priorities as string[])?.includes('international') &&
    answers.teamSize === '1-10'
  ) {
    return 'International coverage for a small team comes at a premium. Are you actively hiring abroad, or is this a future consideration?';
  }
  return null;
}

// ─── LLM Explanation (enriches scoring with natural language) ────────────────

const PLAN_CATALOGUE = PLANS.map((p) => {
  const included = p.features
    .filter((f) => f.included)
    .map((f) => (f.detail ? `${f.name}: ${f.detail}` : f.name))
    .join(', ');
  const excluded = p.features
    .filter((f) => !f.included)
    .map((f) => f.name)
    .join(', ');
  const price =
    p.monthlyPrice.max > 0
      ? `\u20AC${p.monthlyPrice.min}\u2013${p.monthlyPrice.max}/mo per employee`
      : 'Custom pricing';
  return `${p.name} (${price})\n  Includes: ${included}\n  Excludes: ${excluded || 'Nothing \u2014 full coverage'}\n  Best for: ${p.bestFor}`;
}).join('\n\n');

function buildExplainerPrompt(answers: UserAnswers, scoredPlans: ScoredPlan[]): string {
  const top = scoredPlans[0];
  const priorities = (answers.priorities as string[]) || [];
  const priorityLabels: Record<string, string> = {
    'mental-health': 'mental health support',
    'dental-optical': 'dental & optical',
    'international': 'international coverage',
    'family': 'family-friendly benefits',
    'wellness': 'wellness programmes',
    'talent-attraction': 'talent attraction',
    'cost-effective': 'cost-effectiveness',
    'speed': 'quick setup',
  };
  const selectedPriorities = priorities.map((p) => priorityLabels[p] || p).join(', ');
  const extras = (answers.extras as string) || '';

  return `You are a health insurance advisor for Kota (kota.io), a regulated employee benefits platform in Ireland and the UK.

A user completed our plan finder. Their answers:
- Team size: ${answers.teamSize}
- Budget mindset: ${answers.budget}
- Top priorities: ${selectedPriorities || 'Not specified'}
- Must-haves: ${((answers.dealbreakers as string[]) || []).map((d) => priorityLabels[d] || d).join(', ') || 'None'}
- Additional context: ${extras || 'None provided'}

Our scoring engine ranked their top plan as ${top.plan.name} at ${top.matchPercentage}% match.

AVAILABLE PLANS (use ONLY these):
${PLAN_CATALOGUE}

Generate a personalised explanation. Respond with ONLY valid JSON:
{
  "summary": "2-3 sentences explaining WHY these plans suit THIS user. Reference their budget mindset, team size, and priorities by name. Be warm and jargon-free.",
  "topPickHeadline": "One punchy sentence about why ${top.plan.name} fits them specifically.",
  "topPickReasoning": "2-3 short paragraphs explaining the recommendation. Be specific about their answers. Mention trade-offs honestly. Do NOT use the word 'comprehensive' more than once.",
  "savingsTip": "One practical tip about getting maximum value from this plan."
}

RULES:
- Only reference features that exist in the plan data above
- Reference at least one specific user answer in every field
- Be conversational and warm, not salesy
- If budget is minimal, acknowledge the constraint honestly`;
}

export async function getAIExplanation(
  answers: UserAnswers,
  scoredPlans: ScoredPlan[],
  apiKey: string,
): Promise<AIExplanation> {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const prompt = buildExplainerPrompt(answers, scoredPlans);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 600,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  return JSON.parse(content) as AIExplanation;
}

export function getRuleBasedExplanation(
  answers: UserAnswers,
  scoredPlans: ScoredPlan[],
): AIExplanation {
  const top = scoredPlans[0];
  const priorities = (answers.priorities as string[]) || [];
  const priorityLabels: Record<string, string> = {
    'mental-health': 'mental health',
    'dental-optical': 'dental & optical',
    'international': 'international coverage',
    'family': 'family benefits',
    'wellness': 'wellness',
    'talent-attraction': 'talent attraction',
    'cost-effective': 'cost-effectiveness',
    'speed': 'quick setup',
  };
  const topPriority = priorities[0] ? priorityLabels[priorities[0]] : 'balanced coverage';

  const teamDesc =
    answers.teamSize === '1-10'
      ? 'small team'
      : answers.teamSize === '11-50'
        ? 'growing team'
        : answers.teamSize === '51-200'
          ? 'mid-size organisation'
          : 'large organisation';

  return {
    summary: `Based on your ${teamDesc}'s focus on ${topPriority}, ${top.plan.name} is your strongest match at ${top.matchPercentage}%. ${top.personalizedInsight}`,
    topPickHeadline: `${top.plan.name} covers your top priorities without unnecessary extras.`,
    topPickReasoning: top.reasons.join('. ') + '.',
    savingsTip:
      top.plan.annualSavings > 0
        ? `Annual billing saves ${top.plan.annualSavings}% \u2014 worth considering once you've confirmed the plan works for your team.`
        : 'Speak to a Kota advisor to discuss custom pricing that fits your exact needs.',
  };
}
