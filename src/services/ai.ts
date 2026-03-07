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
    case '11-30':
      profile.startupFriendly = 0.8;
      profile.scalability = 0.5;
      break;
    case '31-200':
      profile.startupFriendly = 0.3;
      profile.scalability = 0.85;
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
  switch (budgetMindset) {
    case 'minimal':
      return plan.tier === 'startup' ? 1.0 : plan.tier === 'scaleup' ? 0.5 : 0.2;
    case 'moderate':
      return plan.tier === 'scaleup' ? 1.0 : plan.tier === 'startup' ? 0.8 : 0.4;
    case 'competitive':
      return plan.tier === 'scaleup' ? 0.9 : plan.tier === 'growth' ? 1.0 : 0.4;
    case 'best-in-class':
      return plan.tier === 'growth' ? 1.0 : plan.tier === 'scaleup' ? 0.6 : 0.3;
    default:
      return 0.7;
  }
}

function generateReasons(plan: Plan, profile: Record<string, number>): string[] {
  const reasons: string[] = [];

  if (profile.budgetSensitivity > 0.7 && plan.weights.budgetSensitivity > 0.7)
    reasons.push('Fits within your budget-conscious approach without sacrificing essentials');
  if (profile.mentalHealth > 0.6 && plan.weights.mentalHealth > 0.6)
    reasons.push('Strong mental health support included');
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
    if (plan.tier === 'startup') reasons.push('Get started quickly with core & flexible benefits');
    if (plan.tier === 'scaleup') reasons.push('Lower per-employee cost with live onboarding support');
    if (plan.tier === 'growth') reasons.push('Full access to a dedicated team of benefits experts');
  }

  return reasons.slice(0, 4);
}

function generateWarnings(plan: Plan, profile: Record<string, number>): string[] {
  const warnings: string[] = [];
  if (profile.dental > 0.7 && plan.weights.dental < 0.3)
    warnings.push('Limited dental coverage on this tier');
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
    if (plan.tier === 'startup')
      return 'This plan gives you exactly what your team needs right now. It\'s lean, fast to set up, and lets you invest your budget where it matters most. You can always upgrade as you grow.';
    if (plan.tier === 'scaleup')
      return 'This is the sweet spot for your team. You get efficient people & finance processes at a lower per-employee cost, with live onboarding to get you started right.';
    return 'With your team\'s size and ambition, a full-service solution makes the most sense. Your dedicated team of benefits experts will design coverage that fits your exact needs.';
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
    return 'With a team that size, international coverage and expert support often become critical. Consider flagging those as must-haves.';
  }
  if (
    (answers.priorities as string[])?.includes('mental-health') &&
    answers.budget === 'minimal'
  ) {
    return 'Mental health support is a top priority, but your budget is tight. The Scaleup plan offers strong coverage at a lower per-employee cost \u2014 a solid middle ground.';
  }
  if (
    (answers.priorities as string[])?.includes('international') &&
    answers.teamSize === '1-10'
  ) {
    return 'International coverage for a small team comes at a premium. Are you actively hiring abroad, or is this a future consideration?';
  }
  return null;
}

// ─── AI Chat (contextual Q&A about recommended plans) ────────────────────────

export async function chatWithKotaAI(
  question: string,
  scoredPlans: ScoredPlan[],
  chatHistory: { role: 'user' | 'ai'; text: string }[],
  onToken?: (token: string) => void,
): Promise<string> {
  const apiKey = (import.meta.env.VITE_ANTHROPIC_API_KEY as string) || '';
  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    throw new Error('No API key configured');
  }

  const planContext = scoredPlans
    .map(
      (sp) =>
        `${sp.plan.name} (${sp.matchPercentage}% match, ${sp.plan.price}, ${sp.plan.teamSize})\n` +
        `  Features: ${sp.plan.features.filter((f) => f.included).map((f) => f.detail ? `${f.name}: ${f.detail}` : f.name).join(', ')}\n` +
        `  Not included: ${sp.plan.features.filter((f) => !f.included).map((f) => f.name).join(', ') || 'Nothing — full coverage'}\n` +
        `  Best for: ${sp.plan.bestFor}\n` +
        `  Insight: ${sp.personalizedInsight}`,
    )
    .join('\n\n');

  const systemPrompt = `You are a helpful health insurance advisor for Kota (kota.io), a regulated employee benefits platform in Ireland and the UK.

The user just completed our plan finder. Here are their results:

${planContext}

RULES:
- Answer based ONLY on the plan data above. Do not invent features or pricing.
- Be precise and specific — reference actual plan names, features, and prices.
- Keep answers concise (2-4 sentences). A comparison may be slightly longer but stay focused.
- Be warm and conversational, not salesy. Never pressure the user.
- If you don't know something or the plan data doesn't cover it, say so honestly and suggest booking a demo at https://partner.kota.io/kota-demo rather than guessing.
- Kota operates in Ireland and the UK only. Do not claim coverage in other countries.
- Kota covers employee benefits only. Do not claim coverage for pets, vehicles, or other non-employee categories.
- Kota is regulated by the Central Bank of Ireland.`;

  const messages: { role: 'user' | 'assistant'; content: string }[] = [];

  // Add conversation history
  for (const msg of chatHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  // Add current question
  messages.push({ role: 'user', content: question });

  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { error?: { message?: string } }).error?.message || `API error ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.text) {
          fullText += event.delta.text;
          onToken?.(event.delta.text);
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }

  if (!fullText) throw new Error('No response from AI');
  return fullText;
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
      : answers.teamSize === '11-30'
        ? 'growing team'
        : answers.teamSize === '31-200'
          ? 'mid-size organisation'
          : 'large organisation';

  return {
    summary: `Based on your ${teamDesc}'s focus on ${topPriority}, ${top.plan.name} is your strongest match at ${top.matchPercentage}%. ${top.personalizedInsight}`,
    topPickHeadline: `${top.plan.name} covers your top priorities without unnecessary extras.`,
    topPickReasoning: top.reasons.join('. ') + '.',
    savingsTip: 'Book a demo with our team to get a personalised quote tailored to your specific needs and team size.',
  };
}
