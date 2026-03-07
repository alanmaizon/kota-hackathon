import { plans, Plan, QuizAnswers } from "./plans";

interface ScoredPlan {
  plan: Plan;
  score: number;
  matchPercentage: number;
  reasons: string[];
  warnings: string[];
  personalizedInsight: string;
}

// Maps quiz answers to weight dimensions
function buildUserProfile(answers: QuizAnswers) {
  const profile: Record<string, number> = {
    budgetSensitivity: 0.5,
    comprehensiveness: 0.5,
    mentalHealth: 0.5,
    dental: 0.5,
    optical: 0.5,
    international: 0.5,
    familyCoverage: 0.3,
    wellbeing: 0.5,
    speedOfAccess: 0.5,
    startupFriendly: 0.5,
    scalability: 0.5,
  };

  // Budget influence
  switch (answers.budget) {
    case "minimal":
      profile.budgetSensitivity = 1.0;
      profile.comprehensiveness = 0.2;
      break;
    case "moderate":
      profile.budgetSensitivity = 0.6;
      profile.comprehensiveness = 0.6;
      break;
    case "competitive":
      profile.budgetSensitivity = 0.3;
      profile.comprehensiveness = 0.8;
      break;
    case "best-in-class":
      profile.budgetSensitivity = 0.1;
      profile.comprehensiveness = 1.0;
      break;
  }

  // Team size influence
  switch (answers.teamSize) {
    case "1-10":
      profile.startupFriendly = 1.0;
      profile.scalability = 0.3;
      profile.speedOfAccess = 0.9;
      break;
    case "11-50":
      profile.startupFriendly = 0.7;
      profile.scalability = 0.7;
      break;
    case "51-200":
      profile.startupFriendly = 0.3;
      profile.scalability = 0.9;
      break;
    case "200+":
      profile.startupFriendly = 0.1;
      profile.scalability = 1.0;
      break;
  }

  // Company stage influence
  switch (answers.companyStage) {
    case "pre-seed":
    case "seed":
      profile.budgetSensitivity = Math.min(profile.budgetSensitivity + 0.2, 1);
      profile.startupFriendly = Math.min(profile.startupFriendly + 0.2, 1);
      break;
    case "series-a":
    case "series-b":
      profile.comprehensiveness = Math.min(profile.comprehensiveness + 0.15, 1);
      break;
    case "growth":
    case "enterprise":
      profile.scalability = Math.min(profile.scalability + 0.2, 1);
      profile.comprehensiveness = Math.min(profile.comprehensiveness + 0.2, 1);
      break;
  }

  // Priorities boost
  const priorityMap: Record<string, string[]> = {
    "mental-health": ["mentalHealth"],
    "dental-optical": ["dental", "optical"],
    "international": ["international"],
    "family": ["familyCoverage"],
    "wellness": ["wellbeing"],
    "talent-attraction": ["comprehensiveness"],
    "cost-effective": ["budgetSensitivity"],
    "speed": ["speedOfAccess"],
  };

  answers.priorities.forEach((p) => {
    const dims = priorityMap[p] || [];
    dims.forEach((d) => {
      profile[d] = Math.min((profile[d] || 0.5) + 0.3, 1);
    });
  });

  // Dealbreakers (hard requirements)
  answers.dealbreakers.forEach((d) => {
    const dims = priorityMap[d] || [];
    dims.forEach((dim) => {
      profile[dim] = 1.0;
    });
  });

  // Importance slider values
  Object.entries(answers.importance || {}).forEach(([key, value]) => {
    if (profile[key] !== undefined) {
      profile[key] = value;
    }
  });

  // Hiring locations influence
  if (answers.hiringLocations.some((l) => l !== "domestic")) {
    profile.international = Math.min(profile.international + 0.4, 1);
  }

  return profile;
}

function generateReasons(plan: Plan, profile: Record<string, number>): string[] {
  const reasons: string[] = [];

  if (profile.budgetSensitivity > 0.7 && plan.weights.budgetSensitivity > 0.7) {
    reasons.push("Fits within your budget-conscious approach without sacrificing essentials");
  }

  if (profile.mentalHealth > 0.6 && plan.weights.mentalHealth > 0.6) {
    const mentalFeature = plan.features.find((f) => f.name === "Mental health");
    if (mentalFeature?.included) {
      reasons.push(`Strong mental health support: ${mentalFeature.detail}`);
    }
  }

  if (profile.dental > 0.6 && plan.weights.dental > 0.6) {
    reasons.push("Includes the dental coverage your team needs");
  }

  if (profile.international > 0.6 && plan.weights.international > 0.6) {
    reasons.push("International coverage for your distributed team");
  }

  if (profile.startupFriendly > 0.7 && plan.weights.startupFriendly > 0.7) {
    reasons.push("Designed for fast-moving teams with quick setup");
  }

  if (profile.scalability > 0.7 && plan.weights.scalability > 0.7) {
    reasons.push("Scales smoothly as your team grows");
  }

  if (profile.wellbeing > 0.7 && plan.weights.wellbeing > 0.7) {
    reasons.push("Comprehensive wellness programme to keep your team thriving");
  }

  if (profile.familyCoverage > 0.7 && plan.weights.familyCoverage > 0.7) {
    reasons.push("Family coverage options for employees with dependents");
  }

  if (profile.comprehensiveness > 0.8 && plan.weights.comprehensiveness > 0.8) {
    reasons.push("Industry-leading breadth of coverage to attract top talent");
  }

  // Add at least 2 generic reasons if we don't have enough
  if (reasons.length < 2) {
    if (plan.tier === "starter") reasons.push("Get started quickly with no minimum commitment");
    if (plan.tier === "growth") reasons.push("The most popular plan among similar companies");
    if (plan.tier === "premium") reasons.push("Best-in-class benefits your team will love");
    if (plan.tier === "enterprise") reasons.push("Fully customisable to your exact requirements");
  }

  return reasons.slice(0, 4);
}

function generateWarnings(plan: Plan, profile: Record<string, number>): string[] {
  const warnings: string[] = [];

  if (profile.dental > 0.7 && plan.weights.dental < 0.3) {
    warnings.push("Does not include dental coverage");
  }
  if (profile.international > 0.7 && plan.weights.international < 0.3) {
    warnings.push("No international coverage \u2014 consider upgrading if hiring abroad");
  }
  if (profile.mentalHealth > 0.8 && plan.weights.mentalHealth < 0.5) {
    warnings.push("Limited mental health sessions \u2014 may not meet your team's needs");
  }
  if (profile.scalability > 0.8 && plan.weights.scalability < 0.5) {
    warnings.push("May require plan changes as your team grows significantly");
  }

  return warnings;
}

function generateInsight(plan: Plan, profile: Record<string, number>, rank: number): string {
  if (rank === 0) {
    if (plan.tier === "starter") {
      return "This plan gives you exactly what your team needs right now. It's lean, fast to set up, and lets you invest your budget where it matters most at this stage. You can always upgrade as you grow.";
    }
    if (plan.tier === "growth") {
      return "This is the sweet spot for your team. You get comprehensive coverage that shows employees you're serious about their wellbeing, without the enterprise price tag. 60% of companies your size choose this plan.";
    }
    if (plan.tier === "premium") {
      return "Your team deserves the best, and this plan delivers. Unlimited mental health support, international coverage, and family options make this a powerful recruitment and retention tool.";
    }
    return "With your team's complexity, a bespoke solution makes the most sense. We'll design coverage that fits your exact needs across every location and entity.";
  }

  if (rank === 1) {
    return `This is a strong alternative worth considering. It scores ${profile.budgetSensitivity > 0.6 ? "well on value" : "highly on coverage"}, though your top match edges it out on the dimensions that matter most to you.`;
  }

  return "This plan could work for specific teams within your organisation, or as a future upgrade path.";
}

export function scoreAndRankPlans(answers: QuizAnswers): ScoredPlan[] {
  const profile = buildUserProfile(answers);
  const dimensions = Object.keys(profile);

  // Calculate weighted scores
  const scored = plans.map((plan) => {
    let totalScore = 0;
    let totalWeight = 0;

    dimensions.forEach((dim) => {
      const userImportance = profile[dim];
      const planStrength = plan.weights[dim as keyof typeof plan.weights] ?? 0;

      // Score = how well the plan satisfies the user's weighted need
      // Using cosine-like similarity per dimension
      const dimScore = 1 - Math.abs(userImportance - planStrength);
      const weight = userImportance; // User's priority weights the dimension

      totalScore += dimScore * weight;
      totalWeight += weight;
    });

    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      plan,
      score: normalizedScore,
      matchPercentage: 0,
      reasons: [] as string[],
      warnings: [] as string[],
      personalizedInsight: "",
    };
  });

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  // Normalize to percentages (top plan = 92-98%, scale others relative)
  const maxScore = scored[0].score;
  scored.forEach((s, i) => {
    const relativeScore = s.score / maxScore;
    s.matchPercentage = Math.round(relativeScore * 92 + (i === 0 ? 6 : 0));
    s.matchPercentage = Math.min(98, Math.max(45, s.matchPercentage));
    s.reasons = generateReasons(s.plan, profile);
    s.warnings = generateWarnings(s.plan, profile);
    s.personalizedInsight = generateInsight(s.plan, profile, i);
  });

  return scored;
}

// AI-generated summary of the recommendation
export function generateRecommendationSummary(
  topPlan: ScoredPlan,
  answers: QuizAnswers
): string {
  const teamDesc =
    answers.teamSize === "1-10"
      ? "small team"
      : answers.teamSize === "11-50"
      ? "growing team"
      : answers.teamSize === "51-200"
      ? "mid-size organisation"
      : "large organisation";

  const priorityNames: Record<string, string> = {
    "mental-health": "mental health support",
    "dental-optical": "dental and optical coverage",
    "international": "international coverage",
    "family": "family-friendly benefits",
    "wellness": "employee wellness",
    "talent-attraction": "talent attraction",
    "cost-effective": "cost-effectiveness",
    "speed": "quick implementation",
  };

  const topPriorities = answers.priorities
    .slice(0, 2)
    .map((p) => priorityNames[p] || p)
    .join(" and ");

  return `Based on your ${teamDesc}'s focus on ${topPriorities || "balanced coverage"}, we recommend **${topPlan.plan.name}** as your best match at ${topPlan.matchPercentage}% alignment. ${topPlan.personalizedInsight}`;
}

// Generate follow-up questions based on answers so far
export function getSmartFollowUp(answers: Partial<QuizAnswers>): string | null {
  if (answers.teamSize === "200+" && !answers.hiringLocations?.length) {
    return "With a team that size, are you hiring internationally? This significantly impacts which plan makes sense.";
  }

  if (
    answers.priorities?.includes("mental-health") &&
    answers.budget === "minimal"
  ) {
    return "Mental health support is a top priority, but your budget is tight. Would you consider reallocating budget from other benefits to ensure strong mental health coverage?";
  }

  if (
    answers.priorities?.includes("international") &&
    answers.teamSize === "1-10"
  ) {
    return "International coverage for a small team often comes at a premium. Are you actively hiring abroad, or is this a future consideration?";
  }

  return null;
}
