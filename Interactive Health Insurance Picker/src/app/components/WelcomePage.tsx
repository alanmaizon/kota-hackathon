import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Shield,
  Sparkles,
  Clock,
  Users,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";

const benefits = [
  {
    icon: Brain,
    title: "AI-powered matching",
    desc: "Our engine analyses 11 dimensions to find your perfect fit",
  },
  {
    icon: Clock,
    title: "2 minutes, not 2 hours",
    desc: "A few thoughtful questions replace endless comparison spreadsheets",
  },
  {
    icon: Shield,
    title: "Personalised insights",
    desc: "Understand why a plan suits you, not just what it covers",
  },
  {
    icon: Users,
    title: "Built for teams",
    desc: "Recommendations tailored to your team size, stage, and goals",
  },
];

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm" style={{ fontWeight: 500 }}>AI-Powered Plan Picker</span>
        </div>

        <h1
          className="text-3xl sm:text-5xl tracking-tight mb-4"
          style={{ fontWeight: 700, lineHeight: 1.15 }}
        >
          Find the right health plan
          <br />
          <span className="text-primary">for your team</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10" style={{ lineHeight: 1.7 }}>
          Stop guessing. Answer a few quick questions about your team and
          priorities, and we'll match you with the plan that actually fits —
          with clear reasoning for every recommendation.
        </p>

        <Button
          onClick={() => navigate("/quiz")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group"
        >
          Find your plan
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Takes about 2 minutes &middot; No signup required
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid sm:grid-cols-2 gap-4 mt-16"
      >
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            className="bg-white rounded-xl border border-border p-5 flex gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <b.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm" style={{ fontWeight: 600 }}>
                {b.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{b.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center"
      >
        <p className="text-sm text-muted-foreground mb-3">
          Trusted by teams at
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
          {["Intercom", "Stripe", "Personio", "Wayflyer", "Flipdish"].map(
            (name) => (
              <span
                key={name}
                className="text-sm tracking-wide"
                style={{ fontWeight: 600, letterSpacing: '0.05em' }}
              >
                {name}
              </span>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
