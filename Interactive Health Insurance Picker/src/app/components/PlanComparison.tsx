import { motion } from "motion/react";
import { Check, X, ArrowLeft, Sparkles } from "lucide-react";
import { Plan } from "../data/plans";
import { Button } from "./ui/button";

interface ComparisonProps {
  plans: { plan: Plan; matchPercentage: number }[];
  onBack: () => void;
}

export function PlanComparison({ plans: scoredPlans, onBack }: ComparisonProps) {
  // Gather all unique feature names
  const allFeatures = new Map<string, boolean>();
  scoredPlans.forEach(({ plan }) => {
    plan.features.forEach((f) => {
      if (!allFeatures.has(f.name)) {
        allFeatures.set(f.name, true);
      }
    });
  });
  const featureNames = Array.from(allFeatures.keys());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </Button>
        <h2 className="text-xl" style={{ fontWeight: 600 }}>
          Plan Comparison
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 min-w-[200px]"></th>
              {scoredPlans.map(({ plan, matchPercentage }) => (
                <th
                  key={plan.id}
                  className="p-4 text-center min-w-[180px]"
                >
                  <div
                    className="rounded-xl p-4 border-2"
                    style={{
                      borderColor:
                        matchPercentage > 90 ? plan.color : "var(--border)",
                      backgroundColor:
                        matchPercentage > 90
                          ? `${plan.color}08`
                          : "transparent",
                    }}
                  >
                    <p style={{ fontWeight: 600 }}>{plan.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Sparkles
                        className="w-3 h-3"
                        style={{ color: plan.color }}
                      />
                      <span
                        className="text-sm"
                        style={{ fontWeight: 700, color: plan.color }}
                      >
                        {matchPercentage}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.monthlyPrice.max > 0
                        ? `€${plan.monthlyPrice.min}-${plan.monthlyPrice.max}/mo`
                        : "Custom"}
                    </p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureNames.map((featureName, i) => (
              <tr
                key={featureName}
                className={i % 2 === 0 ? "bg-muted/30" : ""}
              >
                <td className="p-3 text-sm" style={{ fontWeight: 500 }}>
                  {featureName}
                </td>
                {scoredPlans.map(({ plan }) => {
                  const feature = plan.features.find(
                    (f) => f.name === featureName
                  );
                  return (
                    <td key={plan.id} className="p-3 text-center">
                      {feature?.included ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <Check className="w-5 h-5 text-green-500" />
                          {feature.detail && (
                            <span className="text-xs text-muted-foreground">
                              {feature.detail}
                            </span>
                          )}
                        </div>
                      ) : feature ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
