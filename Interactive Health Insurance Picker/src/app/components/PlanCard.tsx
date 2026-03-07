import { motion } from "motion/react";
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Crown,
  TrendingUp,
  Sprout,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    tier: string;
    tagline: string;
    monthlyPrice: { min: number; max: number };
    annualSavings: number;
    features: { name: string; included: boolean; detail?: string; highlight?: boolean }[];
    coverageHighlights: string[];
    bestFor: string;
    color: string;
  };
  matchPercentage: number;
  reasons: string[];
  warnings: string[];
  personalizedInsight: string;
  rank: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onCompare?: () => void;
}

const tierIcons: Record<string, React.ElementType> = {
  starter: Sprout,
  growth: TrendingUp,
  premium: Crown,
  enterprise: Building2,
};

export function PlanCard({
  plan,
  matchPercentage,
  reasons,
  warnings,
  personalizedInsight,
  rank,
  isSelected,
  onSelect,
  onCompare,
}: PlanCardProps) {
  const [expanded, setExpanded] = useState(rank === 0);
  const TierIcon = tierIcons[plan.tier] || Sparkles;
  const isTopPick = rank === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.15 }}
      className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all ${
        isTopPick
          ? "border-primary shadow-lg shadow-primary/10"
          : isSelected
          ? "border-primary/50 shadow-md"
          : "border-border hover:border-primary/30 hover:shadow-md"
      }`}
    >
      {isTopPick && (
        <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center gap-2 text-sm" style={{ fontWeight: 500 }}>
          <Sparkles className="w-4 h-4" />
          Best match for your team
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${plan.color}15` }}
            >
              <TierIcon className="w-5 h-5" style={{ color: plan.color }} />
            </div>
            <div>
              <h3 className="text-lg" style={{ fontWeight: 600 }}>
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
            </div>
          </div>

          <div className="text-right">
            <div
              className="text-2xl"
              style={{ fontWeight: 700, color: plan.color }}
            >
              {matchPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">match</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          {plan.monthlyPrice.max > 0 ? (
            <>
              <span className="text-2xl" style={{ fontWeight: 700 }}>
                &euro;{plan.monthlyPrice.min}-{plan.monthlyPrice.max}
              </span>
              <span className="text-sm text-muted-foreground">
                /employee/month
              </span>
            </>
          ) : (
            <span className="text-lg" style={{ fontWeight: 600 }}>
              Custom pricing
            </span>
          )}
          {plan.annualSavings > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Save {plan.annualSavings}% annually
            </Badge>
          )}
        </div>

        {/* AI Insight */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm" style={{ lineHeight: 1.6 }}>
              {personalizedInsight}
            </p>
          </div>
        </div>

        {/* Why this plan */}
        {reasons.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-muted-foreground" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Why this plan fits
            </p>
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: plan.color }}
                />
                <span className="text-sm">{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2 mb-4">
            {warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-amber-600"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-sm">{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Coverage highlights */}
        <div className="flex flex-wrap gap-2 mb-4">
          {plan.coverageHighlights.map((h) => (
            <Badge key={h} variant="outline" className="text-xs">
              {h}
            </Badge>
          ))}
        </div>

        {/* Expandable features */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mb-2 cursor-pointer"
          style={{ fontWeight: 500 }}
        >
          {expanded ? "Hide" : "Show"} all features
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 mb-4"
          >
            {plan.features.map((f) => (
              <div
                key={f.name}
                className={`flex items-center gap-2 text-sm ${
                  f.highlight ? "bg-secondary/30 -mx-2 px-2 py-1 rounded-lg" : ""
                }`}
              >
                {f.included ? (
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-gray-300 shrink-0" />
                )}
                <span
                  className={f.included ? "" : "text-muted-foreground"}
                >
                  {f.name}
                </span>
                {f.detail && f.included && (
                  <span className="text-muted-foreground ml-auto text-xs">
                    {f.detail}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <button
            onClick={onSelect}
            className={`flex-1 py-3 px-4 rounded-xl text-sm transition-all cursor-pointer ${
              isTopPick
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={{ fontWeight: 500 }}
          >
            {plan.monthlyPrice.max > 0 ? "Get a quote" : "Talk to sales"}
          </button>
          <button
            onClick={onCompare}
            className="py-3 px-4 rounded-xl text-sm border border-border hover:bg-muted transition-colors cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Compare
          </button>
        </div>
      </div>
    </motion.div>
  );
}
