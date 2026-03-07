import { useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, RotateCcw, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PlanCard } from "./PlanCard";
import { PlanComparison } from "./PlanComparison";
import {
  scoreAndRankPlans,
  generateRecommendationSummary,
} from "../data/ai-engine";
import { QuizAnswers } from "../data/plans";

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = (location.state as { answers: QuizAnswers })?.answers;
  const [view, setView] = useState<"results" | "compare">("results");
  const [comparePlans, setComparePlans] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (!answers) {
      navigate("/");
    }
  }, [answers, navigate]);

  if (!answers) return null;

  const scoredPlans = scoreAndRankPlans(answers);
  const summary = generateRecommendationSummary(scoredPlans[0], answers);

  const handleCompare = (planId: string) => {
    const newSet = new Set(comparePlans);
    if (newSet.has(planId)) {
      newSet.delete(planId);
    } else {
      newSet.add(planId);
    }
    setComparePlans(newSet);

    if (newSet.size >= 2) {
      setView("compare");
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Simulated AI responses based on keywords
    setTimeout(() => {
      let response =
        "That's a great question! Based on your profile, I'd recommend discussing this with one of our benefits advisors who can provide specific guidance for your team.";

      const lower = userMsg.toLowerCase();
      if (lower.includes("price") || lower.includes("cost") || lower.includes("budget")) {
        response = `Based on your team size of ${answers.teamSize} employees, the ${scoredPlans[0].plan.name} plan would cost approximately €${scoredPlans[0].plan.monthlyPrice.min}-${scoredPlans[0].plan.monthlyPrice.max} per employee per month. You can save ${scoredPlans[0].plan.annualSavings}% with annual billing. Want me to break down the total cost?`;
      } else if (lower.includes("mental health") || lower.includes("therapy") || lower.includes("counselling")) {
        const mhFeature = scoredPlans[0].plan.features.find((f) => f.name === "Mental health");
        response = `Great question! Your recommended plan (${scoredPlans[0].plan.name}) includes ${mhFeature?.detail || "mental health coverage"}. This covers therapy sessions, counselling, and access to our Employee Assistance Programme. ${scoredPlans[0].plan.tier === "premium" ? "As a Premium member, your team gets unlimited sessions." : "If mental health is a top priority, consider the Premium plan for unlimited sessions."}`;
      } else if (lower.includes("dental") || lower.includes("teeth")) {
        const dentalFeature = scoredPlans[0].plan.features.find((f) => f.name === "Dental");
        response = dentalFeature?.included
          ? `Yes! ${scoredPlans[0].plan.name} includes dental coverage: ${dentalFeature.detail}. This covers check-ups, cleanings, fillings, and basic dental work.`
          : `The ${scoredPlans[0].plan.name} plan doesn't include dental. If dental is important, the Growth plan includes dental coverage up to €750/year.`;
      } else if (lower.includes("switch") || lower.includes("change") || lower.includes("upgrade")) {
        response =
          "Absolutely! You can upgrade your plan at any time. Downgrades take effect at your next renewal date. There's no penalty for switching — we want you on the plan that fits best.";
      } else if (lower.includes("family") || lower.includes("spouse") || lower.includes("dependent")) {
        response = `Family coverage options are available on our Premium and Enterprise plans. This lets employees add their spouse and dependent children. The Premium plan includes this at an additional per-dependent rate that we can quote for you.`;
      } else if (lower.includes("how long") || lower.includes("setup") || lower.includes("start")) {
        response = `Most plans can be set up within 48 hours. ${scoredPlans[0].plan.tier === "enterprise" ? "Enterprise plans with custom requirements typically take 1-2 weeks for white-glove onboarding." : "You'll get a dedicated account manager to guide you through the process."} Your team will have access from day one.`;
      }

      setChatMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 800);
  };

  if (view === "compare") {
    const plansToCompare =
      comparePlans.size >= 2
        ? scoredPlans.filter((sp) => comparePlans.has(sp.plan.id))
        : scoredPlans.slice(0, 3);

    return (
      <PlanComparison
        plans={plansToCompare}
        onBack={() => setView("results")}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <Badge variant="secondary">AI Recommendation</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl mb-4" style={{ fontWeight: 700 }}>
          Your personalised results
        </h1>
        <div className="bg-white rounded-2xl border border-border p-6">
          <p className="text-muted-foreground" style={{ lineHeight: 1.7 }}>
            {summary.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="text-primary" style={{ fontWeight: 600 }}>
                  {part}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setView("compare")}
        >
          Compare all plans
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/")}>
          <RotateCcw className="w-4 h-4" />
          Retake quiz
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="w-4 h-4" />
          Ask a question
        </Button>
      </motion.div>

      {/* AI Chat */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8 bg-white rounded-2xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border/50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm" style={{ fontWeight: 600 }}>
              Ask Kota AI
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Powered by your quiz answers
            </span>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Ask anything about your recommended plans
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "How much will this cost my team?",
                    "What mental health support is included?",
                    "Can I upgrade later?",
                    "How fast can we get set up?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setChatInput(q);
                        setTimeout(() => {
                          setChatInput("");
                          setChatMessages((prev) => [
                            ...prev,
                            { role: "user", text: q },
                          ]);
                          // Trigger response
                          const event = new CustomEvent("chat-send", {
                            detail: q,
                          });
                          window.dispatchEvent(event);
                        }, 100);
                        // Simulate response
                        const lower = q.toLowerCase();
                        setTimeout(() => {
                          let response =
                            "That's a great question! Let me look into that for you.";
                          if (lower.includes("cost")) {
                            response = `Based on your team size of ${answers.teamSize} employees, the ${scoredPlans[0].plan.name} plan would cost approximately €${scoredPlans[0].plan.monthlyPrice.min}-${scoredPlans[0].plan.monthlyPrice.max} per employee per month. You can save ${scoredPlans[0].plan.annualSavings}% with annual billing.`;
                          } else if (lower.includes("mental")) {
                            const mhFeature = scoredPlans[0].plan.features.find((f) => f.name === "Mental health");
                            response = `Your recommended plan includes ${mhFeature?.detail || "mental health coverage"}. This covers therapy sessions, counselling, and access to our Employee Assistance Programme.`;
                          } else if (lower.includes("upgrade")) {
                            response =
                              "Yes! You can upgrade your plan at any time with no penalty. Downgrades take effect at your next renewal date.";
                          } else if (lower.includes("set up") || lower.includes("fast")) {
                            response = `Most plans can be set up within 48 hours. You'll get a dedicated account manager to guide you through the process.`;
                          }
                          setChatMessages((prev) => [
                            ...prev,
                            { role: "ai", text: response },
                          ]);
                        }, 800);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                  style={{ lineHeight: 1.6 }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border/50 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              placeholder="Ask about coverage, pricing, setup..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              onClick={handleChatSend}
              disabled={!chatInput.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Plan cards */}
      <div className="space-y-6">
        {scoredPlans.map((sp, i) => (
          <PlanCard
            key={sp.plan.id}
            plan={sp.plan}
            matchPercentage={sp.matchPercentage}
            reasons={sp.reasons}
            warnings={sp.warnings}
            personalizedInsight={sp.personalizedInsight}
            rank={i}
            isSelected={comparePlans.has(sp.plan.id)}
            onSelect={() => {
              // Simulated action
            }}
            onCompare={() => handleCompare(sp.plan.id)}
          />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-8 text-center"
      >
        <h3 className="text-xl mb-2" style={{ fontWeight: 600 }}>
          Ready to protect your team?
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get a personalised quote in minutes. Our team will set everything up
          so you can focus on building your company.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-5 rounded-xl shadow-lg gap-2">
            Get your quote
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="px-8 py-5 rounded-xl gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Talk to an advisor
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
