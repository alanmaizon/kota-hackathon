import OpenAI from 'openai';
import { PLANS } from '../data/plans';
import type { AIRecommendation, UserAnswers } from '../types';

const SYSTEM_PROMPT = `You are Kota's friendly AI health insurance advisor. Your role is to analyse a user's responses and recommend the most suitable health insurance plan from Kota's four offerings.

Available plans:
1. Essential (£35/month): Basic GP (6/year), emergency care, basic dental, NHS top-up. Best for: healthy young professionals, tight budgets.
2. Standard (£75/month): Unlimited GP, 3 specialist referrals/year, comprehensive dental, optical (£150/year), 6 mental health sessions, 4 physio sessions. Best for: couples, active professionals.
3. Premium (£140/month): Unlimited GP & specialists, full dental & orthodontics, optical (£300/year), unlimited mental health, unlimited physio, £500 gym benefit, maternity, cancer care, private hospital rooms. Best for: families, mental health priority, fitness-focused.
4. Elite (£250/month): Everything in Premium plus worldwide cover, private suites, health concierge, annual MOT, fertility support, executive health screening. Best for: executives, frequent travellers, complex needs.

Analyse the user's profile holistically. Consider their situation, coverage needs, health status, priorities, budget, and any personal details they shared.

Respond ONLY with a valid JSON object in this exact format:
{
  "recommendedPlanId": "essential|standard|premium|elite",
  "matchScore": <number 70-99>,
  "headline": "<one punchy personalised sentence about why this plan fits them>",
  "reasoning": "<2-3 warm, conversational paragraphs explaining the recommendation. Be specific about their answers. Be encouraging and human.>",
  "keyBenefits": ["<benefit 1>", "<benefit 2>", "<benefit 3>", "<benefit 4>"],
  "savingsTip": "<optional practical tip about getting maximum value from this plan>"
}

Important: Always respect the user's budget constraint. If they said "under £50", only recommend Essential. If they said "£50-£100", recommend Essential or Standard. Match their actual needs thoughtfully.`;

function buildUserProfile(answers: UserAnswers): string {
  const budgetMap: Record<string, string> = {
    under_50: 'under £50/month',
    '50_100': '£50–£100/month',
    '100_200': '£100–£200/month',
    over_200: 'over £200/month',
  };

  const situationMap: Record<string, string> = {
    new_job: 'just started a new job',
    self_employed: 'self-employed/freelance',
    switching: 'switching from another provider',
    first_time: 'first-time buyer',
    family_change: 'family circumstances changed',
  };

  const coverageMap: Record<string, string> = {
    just_me: 'just themselves',
    me_partner: 'themselves and their partner',
    me_family: 'themselves and their family',
    my_team: 'their team/employees',
  };

  const healthMap: Record<string, string> = {
    great: 'excellent health (rarely needs a GP)',
    good: 'good health (occasional visits)',
    managing: 'managing a condition or on medication',
    complex: 'complex needs requiring frequent care',
  };

  const priorities = Array.isArray(answers.priorities) ? answers.priorities : [];
  const priorityLabels: Record<string, string> = {
    dental: 'dental coverage',
    mental_health: 'mental health support',
    physio: 'physiotherapy & sports',
    optical: 'vision & optical',
    fast_access: 'fast specialist access',
    family_care: 'maternity & family care',
    travel: 'worldwide/travel cover',
    wellness: 'gym & wellness benefits',
  };

  const lines = [
    `Situation: ${situationMap[answers.situation as string] ?? answers.situation}`,
    `Coverage: covering ${coverageMap[answers.coverage as string] ?? answers.coverage}`,
    `Health: ${healthMap[answers.health as string] ?? answers.health}`,
    `Priorities: ${priorities.length > 0 ? priorities.map((p) => priorityLabels[p] ?? p).join(', ') : 'not specified'}`,
    `Budget: ${budgetMap[answers.budget as string] ?? answers.budget}`,
  ];

  if (answers.extras && String(answers.extras).trim()) {
    lines.push(`Additional context: "${answers.extras}"`);
  }

  return lines.join('\n');
}

export async function getAIRecommendation(answers: UserAnswers, apiKey: string): Promise<AIRecommendation> {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const userProfile = buildUserProfile(answers);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Please recommend a Kota health insurance plan for this user:\n\n${userProfile}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  const parsed = JSON.parse(content) as AIRecommendation;

  // Validate the recommended plan exists
  const planExists = PLANS.some((p) => p.id === parsed.recommendedPlanId);
  if (!planExists) {
    parsed.recommendedPlanId = 'standard'; // safe fallback
  }

  return parsed;
}

export function getRuleBased(answers: UserAnswers): AIRecommendation {
  const budget = answers.budget as string;
  const priorities = Array.isArray(answers.priorities) ? answers.priorities : [];
  const health = answers.health as string;

  let planId = 'standard';
  let score = 78;

  if (budget === 'under_50') {
    planId = 'essential';
    score = 82;
  } else if (budget === 'over_200') {
    planId = 'elite';
    score = 85;
  } else if (budget === '100_200') {
    planId = 'premium';
    score = 80;
  } else {
    planId = 'standard';
    score = 78;
  }

  // Boost score for health complexity
  if (health === 'complex') score = Math.min(score + 5, 95);

  // Adjust for priorities
  if (priorities.includes('travel') && planId !== 'elite') {
    if (budget === 'over_200' || budget === '100_200') {
      planId = 'elite';
      score = 83;
    }
  }

  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1];

  return {
    recommendedPlanId: planId,
    matchScore: score,
    headline: `The ${plan.name} plan looks like a great fit for your needs.`,
    reasoning: `Based on your budget and priorities, we've matched you with the ${plan.name} plan at £${plan.monthlyPrice}/month. This plan provides ${plan.tagline.toLowerCase()} and covers the key areas you highlighted as important.\n\nThe ${plan.name} plan gives you ${plan.features.slice(0, 3).join(', ')}, which aligns well with what you're looking for. It's designed for people in similar situations to yours and offers excellent value for money.`,
    keyBenefits: plan.features.slice(0, 4),
    savingsTip: 'Review your plan usage quarterly to ensure it still matches your needs as your life changes.',
  };
}
