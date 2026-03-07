import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Wallet,
  Heart,
  AlertTriangle,
  Building2,
  Globe,
  Lightbulb,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { QuizAnswers } from "../data/plans";
import { getSmartFollowUp } from "../data/ai-engine";

interface QuizStep {
  id: string;
  question: string;
  subtitle: string;
  icon: React.ElementType;
  type: "single" | "multi" | "slider-multi";
  options: { value: string; label: string; desc?: string; icon?: string }[];
  field: keyof QuizAnswers;
  required?: boolean;
  maxSelections?: number;
}

const steps: QuizStep[] = [
  {
    id: "team-size",
    question: "How big is your team?",
    subtitle:
      "This helps us understand scale and recommend plans designed for teams like yours.",
    icon: Users,
    type: "single",
    field: "teamSize",
    required: true,
    options: [
      { value: "1-10", label: "1-10", desc: "Early-stage startup", icon: "🌱" },
      { value: "11-50", label: "11-50", desc: "Growing fast", icon: "🚀" },
      { value: "51-200", label: "51-200", desc: "Scaling up", icon: "📈" },
      { value: "200+", label: "200+", desc: "Enterprise", icon: "🏢" },
    ],
  },
  {
    id: "company-stage",
    question: "What stage is your company at?",
    subtitle:
      "This influences both budget flexibility and what benefits will move the needle.",
    icon: Building2,
    type: "single",
    field: "companyStage",
    required: true,
    options: [
      { value: "pre-seed", label: "Pre-seed / Bootstrapped", desc: "Just getting started" },
      { value: "seed", label: "Seed", desc: "Early funding" },
      { value: "series-a", label: "Series A", desc: "Product-market fit" },
      { value: "series-b", label: "Series B+", desc: "Scaling growth" },
      { value: "growth", label: "Growth / PE-backed", desc: "Established player" },
      { value: "enterprise", label: "Public / Enterprise", desc: "Large organisation" },
    ],
  },
  {
    id: "budget",
    question: "What's your benefits budget mindset?",
    subtitle:
      "No wrong answer \u2014 we'll find the best value at any level.",
    icon: Wallet,
    type: "single",
    field: "budget",
    required: true,
    options: [
      {
        value: "minimal",
        label: "Keep it lean",
        desc: "Cover the basics, watch the spend",
        icon: "💡",
      },
      {
        value: "moderate",
        label: "Smart investment",
        desc: "Good coverage without overspending",
        icon: "⚖️",
      },
      {
        value: "competitive",
        label: "Compete for talent",
        desc: "Above-average benefits package",
        icon: "🎯",
      },
      {
        value: "best-in-class",
        label: "Best in class",
        desc: "Industry-leading benefits, no compromises",
        icon: "👑",
      },
    ],
  },
  {
    id: "priorities",
    question: "What matters most to your team?",
    subtitle: "Pick up to 3 priorities. We'll weight our recommendations accordingly.",
    icon: Heart,
    type: "multi",
    field: "priorities",
    maxSelections: 3,
    options: [
      { value: "mental-health", label: "Mental health support", icon: "🧠" },
      { value: "dental-optical", label: "Dental & optical", icon: "🦷" },
      { value: "international", label: "International coverage", icon: "🌍" },
      { value: "family", label: "Family-friendly benefits", icon: "👨‍👩‍👧" },
      { value: "wellness", label: "Wellness programmes", icon: "🧘" },
      { value: "talent-attraction", label: "Talent attraction", icon: "🌟" },
      { value: "cost-effective", label: "Cost-effectiveness", icon: "💰" },
      { value: "speed", label: "Quick to set up", icon: "⚡" },
    ],
  },
  {
    id: "dealbreakers",
    question: "Any absolute must-haves?",
    subtitle:
      "These are non-negotiable \u2014 we'll filter out plans that don't include them.",
    icon: AlertTriangle,
    type: "multi",
    field: "dealbreakers",
    maxSelections: 3,
    options: [
      { value: "mental-health", label: "Mental health coverage", icon: "🧠" },
      { value: "dental-optical", label: "Dental included", icon: "🦷" },
      { value: "international", label: "International cover", icon: "🌍" },
      { value: "family", label: "Family coverage option", icon: "👨‍👩‍👧" },
      { value: "wellness", label: "Wellness platform", icon: "🧘" },
    ],
  },
  {
    id: "locations",
    question: "Where is your team based?",
    subtitle: "Select all that apply. This affects which coverage options are relevant.",
    icon: Globe,
    type: "multi",
    field: "hiringLocations",
    options: [
      { value: "domestic", label: "Ireland / UK only", icon: "🇮🇪" },
      { value: "eu", label: "Across Europe", icon: "🇪🇺" },
      { value: "us", label: "United States", icon: "🇺🇸" },
      { value: "global", label: "Global / Remote-first", icon: "🌍" },
    ],
  },
  {
    id: "pain-points",
    question: "What's frustrating about benefits today?",
    subtitle:
      "Understanding your current pain helps us find a solution, not just a plan.",
    icon: Lightbulb,
    type: "multi",
    field: "currentPainPoints",
    options: [
      { value: "too-complex", label: "Too complex to manage", icon: "😵" },
      { value: "too-expensive", label: "Costs keep rising", icon: "📈" },
      { value: "low-usage", label: "Employees don't use it", icon: "🤷" },
      { value: "no-flexibility", label: "One-size-fits-all", icon: "📦" },
      { value: "poor-support", label: "Bad provider support", icon: "😤" },
      { value: "first-time", label: "Setting up for the first time", icon: "🆕" },
    ],
  },
];

export function QuizFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    teamSize: "",
    budget: "",
    priorities: [],
    dealbreakers: [],
    currentPainPoints: [],
    companyStage: "",
    hiringLocations: [],
    importance: {},
  });
  const [smartTip, setSmartTip] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSingleSelect = useCallback(
    (value: string) => {
      const newAnswers = { ...answers, [step.field]: value };
      setAnswers(newAnswers);

      // Check for smart follow-up
      const tip = getSmartFollowUp(newAnswers);
      setSmartTip(tip);

      // Auto-advance after short delay
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep((s) => s + 1);
          setSmartTip(null);
        }
      }, 400);
    },
    [answers, step, currentStep]
  );

  const handleMultiSelect = useCallback(
    (value: string) => {
      const current = (answers[step.field] as string[]) || [];
      const maxSel = step.maxSelections || Infinity;

      let updated: string[];
      if (current.includes(value)) {
        updated = current.filter((v) => v !== value);
      } else if (current.length < maxSel) {
        updated = [...current, value];
      } else {
        return; // at max
      }

      const newAnswers = { ...answers, [step.field]: updated };
      setAnswers(newAnswers);

      const tip = getSmartFollowUp(newAnswers);
      setSmartTip(tip);
    },
    [answers, step]
  );

  const canContinue = () => {
    if (step.type === "single") {
      return !!(answers[step.field] as string);
    }
    if (step.type === "multi") {
      return ((answers[step.field] as string[]) || []).length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      setSmartTip(null);
    } else {
      // Done — navigate to results
      setIsAnalyzing(true);
      setTimeout(() => {
        navigate("/results", { state: { answers } });
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setSmartTip(null);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-12 h-12 text-primary" />
          </motion.div>
          <h2 className="text-2xl" style={{ fontWeight: 600 }}>
            Analysing your responses...
          </h2>
          <p className="text-muted-foreground">
            Our AI is scoring plans across 11 dimensions to find your best match
          </p>
          <div className="max-w-xs mx-auto">
            <motion.div
              className="h-2 bg-secondary rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Evaluating budget alignment...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Matching coverage requirements...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Generating personalised insights...
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-4">
              <step.icon className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl mb-2" style={{ fontWeight: 600 }}>
              {step.question}
            </h2>
            <p className="text-muted-foreground">{step.subtitle}</p>
            {step.maxSelections && (
              <p className="text-sm text-primary mt-1" style={{ fontWeight: 500 }}>
                Select up to {step.maxSelections}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {step.options.map((option) => {
              const isSelected =
                step.type === "single"
                  ? answers[step.field] === option.value
                  : ((answers[step.field] as string[]) || []).includes(
                      option.value
                    );

              return (
                <motion.button
                  key={option.value}
                  onClick={() =>
                    step.type === "single"
                      ? handleSingleSelect(option.value)
                      : handleMultiSelect(option.value)
                  }
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isSelected
                      ? "border-primary bg-secondary shadow-sm"
                      : "border-border bg-white hover:border-primary/30 hover:shadow-sm"
                  }`}
                >
                  {option.icon && (
                    <span className="text-2xl shrink-0">{option.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`block ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {option.label}
                    </span>
                    {option.desc && (
                      <span className="text-sm text-muted-foreground">
                        {option.desc}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* AI Smart Tip */}
          <AnimatePresence>
            {smartTip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3"
              >
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm" style={{ fontWeight: 500, color: '#92400e' }}>
                    AI Insight
                  </p>
                  <p className="text-sm" style={{ color: '#a16207' }}>
                    {smartTip}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {(step.type === "multi" || !canContinue()) && (
          <Button
            onClick={handleNext}
            disabled={!canContinue()}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {currentStep === steps.length - 1 ? "Get my results" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
