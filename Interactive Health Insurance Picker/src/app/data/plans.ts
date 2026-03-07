export interface PlanFeature {
  name: string;
  included: boolean;
  detail?: string;
  highlight?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tier: "starter" | "growth" | "premium" | "enterprise";
  tagline: string;
  monthlyPrice: { min: number; max: number }; // per employee per month range
  annualSavings: number; // percentage
  features: PlanFeature[];
  coverageHighlights: string[];
  bestFor: string;
  color: string;
  icon: string;
  // Scoring weights for AI matching
  weights: {
    budgetSensitivity: number; // 0-1, how budget-friendly
    comprehensiveness: number; // 0-1, breadth of coverage
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

export const plans: Plan[] = [
  {
    id: "essential",
    name: "Kota Essential",
    tier: "starter",
    tagline: "Core protection for lean teams",
    monthlyPrice: { min: 35, max: 55 },
    annualSavings: 10,
    features: [
      { name: "GP visits", included: true, detail: "Unlimited consultations" },
      { name: "Hospital cover", included: true, detail: "Semi-private room" },
      { name: "Prescription drugs", included: true, detail: "Up to \u20ac500/year" },
      { name: "Mental health", included: true, detail: "6 sessions/year" },
      { name: "Dental", included: false },
      { name: "Optical", included: false },
      { name: "International cover", included: false },
      { name: "Wellness programme", included: false },
      { name: "Employee Assistance Programme", included: true, detail: "24/7 helpline" },
      { name: "Onboarding support", included: true },
    ],
    coverageHighlights: [
      "Perfect for teams under 15",
      "Quick 48-hour setup",
      "No minimum commitment",
    ],
    bestFor: "Early-stage startups and small teams who need solid basics without overspending",
    color: "#00b894",
    icon: "Sprout",
    weights: {
      budgetSensitivity: 0.95,
      comprehensiveness: 0.3,
      mentalHealth: 0.4,
      dental: 0.0,
      optical: 0.0,
      international: 0.0,
      familyCoverage: 0.2,
      wellbeing: 0.2,
      speedOfAccess: 0.8,
      startupFriendly: 0.95,
      scalability: 0.4,
    },
  },
  {
    id: "growth",
    name: "Kota Growth",
    tier: "growth",
    tagline: "The most popular choice for scaling teams",
    monthlyPrice: { min: 65, max: 95 },
    annualSavings: 12,
    features: [
      { name: "GP visits", included: true, detail: "Unlimited consultations" },
      { name: "Hospital cover", included: true, detail: "Private room", highlight: true },
      { name: "Prescription drugs", included: true, detail: "Up to \u20ac1,500/year" },
      { name: "Mental health", included: true, detail: "12 sessions/year", highlight: true },
      { name: "Dental", included: true, detail: "Up to \u20ac750/year" },
      { name: "Optical", included: true, detail: "Up to \u20ac300/year" },
      { name: "International cover", included: false },
      { name: "Wellness programme", included: true, detail: "Digital platform access", highlight: true },
      { name: "Employee Assistance Programme", included: true, detail: "24/7 + counselling" },
      { name: "Onboarding support", included: true, detail: "Dedicated account manager" },
    ],
    coverageHighlights: [
      "Chosen by 60% of Kota customers",
      "Dental & optical included",
      "Wellness platform access",
    ],
    bestFor: "Growing companies (15-100 employees) who want comprehensive benefits that attract talent",
    color: "#6C5CE7",
    icon: "TrendingUp",
    weights: {
      budgetSensitivity: 0.6,
      comprehensiveness: 0.7,
      mentalHealth: 0.7,
      dental: 0.8,
      optical: 0.8,
      international: 0.0,
      familyCoverage: 0.5,
      wellbeing: 0.7,
      speedOfAccess: 0.7,
      startupFriendly: 0.7,
      scalability: 0.8,
    },
  },
  {
    id: "premium",
    name: "Kota Premium",
    tier: "premium",
    tagline: "Best-in-class benefits for ambitious teams",
    monthlyPrice: { min: 120, max: 175 },
    annualSavings: 15,
    features: [
      { name: "GP visits", included: true, detail: "Unlimited + specialist direct access" },
      { name: "Hospital cover", included: true, detail: "Private room + worldwide", highlight: true },
      { name: "Prescription drugs", included: true, detail: "Unlimited" },
      { name: "Mental health", included: true, detail: "Unlimited sessions", highlight: true },
      { name: "Dental", included: true, detail: "Up to \u20ac1,500/year", highlight: true },
      { name: "Optical", included: true, detail: "Up to \u20ac600/year" },
      { name: "International cover", included: true, detail: "EU + UK", highlight: true },
      { name: "Wellness programme", included: true, detail: "Full platform + stipend" },
      { name: "Employee Assistance Programme", included: true, detail: "24/7 + in-person counselling" },
      { name: "Onboarding support", included: true, detail: "White-glove setup" },
      { name: "Family coverage option", included: true, detail: "Spouse + dependents" },
      { name: "Health screening", included: true, detail: "Annual check-up" },
    ],
    coverageHighlights: [
      "Unlimited mental health support",
      "International EU + UK coverage",
      "Annual health screenings",
    ],
    bestFor: "Companies competing for top talent who want to offer industry-leading benefits",
    color: "#e17055",
    icon: "Crown",
    weights: {
      budgetSensitivity: 0.2,
      comprehensiveness: 0.95,
      mentalHealth: 1.0,
      dental: 0.95,
      optical: 0.9,
      international: 0.9,
      familyCoverage: 0.9,
      wellbeing: 0.95,
      speedOfAccess: 0.9,
      startupFriendly: 0.4,
      scalability: 0.9,
    },
  },
  {
    id: "enterprise",
    name: "Kota Enterprise",
    tier: "enterprise",
    tagline: "Fully customised for large organisations",
    monthlyPrice: { min: 0, max: 0 }, // custom pricing
    annualSavings: 20,
    features: [
      { name: "Everything in Premium", included: true, highlight: true },
      { name: "Custom plan design", included: true, detail: "Tailored to your org" },
      { name: "Global coverage", included: true, detail: "Worldwide", highlight: true },
      { name: "Dedicated success team", included: true },
      { name: "API integrations", included: true, detail: "HRIS, payroll, etc." },
      { name: "Custom reporting", included: true, detail: "Usage & ROI analytics" },
      { name: "Multi-entity support", included: true },
      { name: "Compliance support", included: true, detail: "Multi-jurisdiction" },
    ],
    coverageHighlights: [
      "Fully bespoke plan design",
      "Global multi-entity support",
      "Dedicated success team",
    ],
    bestFor: "Large organisations (200+) with complex needs across multiple locations",
    color: "#0984e3",
    icon: "Building2",
    weights: {
      budgetSensitivity: 0.1,
      comprehensiveness: 1.0,
      mentalHealth: 1.0,
      dental: 1.0,
      optical: 1.0,
      international: 1.0,
      familyCoverage: 1.0,
      wellbeing: 1.0,
      speedOfAccess: 0.5,
      startupFriendly: 0.1,
      scalability: 1.0,
    },
  },
];

export type QuizAnswers = {
  teamSize: string;
  budget: string;
  priorities: string[];
  dealbreakers: string[];
  currentPainPoints: string[];
  companyStage: string;
  hiringLocations: string[];
  importance: Record<string, number>;
};
