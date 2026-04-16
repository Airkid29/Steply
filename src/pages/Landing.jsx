import { base44 } from "@/api/base44Client";
import { Sparkles, ArrowRight, Target, Search, FileText, Briefcase, GraduationCap, Code2, Globe, Moon, Sun, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getTheme, setTheme } from "@/lib/theme";

const steps = [
  { icon: FileText, title: "Build your profile", desc: "Tell us about your skills, studies, and goals in under 2 minutes." },
  { icon: Search, title: "Get AI-matched", desc: "Our AI finds the most relevant opportunities for your exact profile." },
  { icon: Target, title: "Take action", desc: "Understand why each opportunity fits you, then apply with a clear action plan." },
];

const stats = [
  { value: "500+", label: "Opportunities" },
  { value: "12k+", label: "Students" },
  { value: "89%", label: "AI accuracy" },
];

const types = [
  { icon: GraduationCap, label: "Scholarships", color: "bg-indigo-100 text-indigo-600" },
  { icon: Briefcase, label: "Internships", color: "bg-emerald-100 text-emerald-600" },
  { icon: Code2, label: "Hackathons", color: "bg-violet-100 text-violet-600" },
  { icon: Briefcase, label: "Junior Jobs", color: "bg-amber-100 text-amber-600" },
  { icon: Trophy, label: "Competitions", color: "bg-rose-100 text-rose-600" },
  { icon: Globe, label: "Remote", color: "bg-sky-100 text-sky-600" },
];

export default function Landing() {
  const [dark, setDark] = useState(() => getTheme() === "dark");

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    setTheme(next ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Steply</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/post-opportunity">
              <Button variant="outline" className="rounded-full px-4 h-9 text-sm hidden sm:flex">
                Post a listing
              </Button>
            </Link>
            <Button onClick={() => window.location.href = '/login'} className="rounded-full px-5 h-9 text-sm">
              Se connecter
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered matching for students and graduates
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
              The right opportunity,
              <br />
              <span className="text-primary">found for you.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Stop scrolling through hundreds of listings. Steply matches you with scholarships, internships, hackathons and jobs that truly fit your profile — across all sectors and countries.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => window.location.href = '/login'} size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link to="/post-opportunity">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post an opportunity
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Connectez-vous avec Google ou créez un compte email. Gratuit pour les étudiants.</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-8 sm:gap-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunity types */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">All sectors, all profiles</h2>
            <p className="text-sm text-muted-foreground">Tech, healthcare, law, finance, arts, sciences — Steply covers every field.</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {types.map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.color}`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
              3 steps to your next opportunity
            </h2>
            <p className="text-muted-foreground">No complexity. Just results.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Step {i + 1}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border p-8 sm:p-12 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-amber-400 text-xl">★</span>
            ))}
          </div>
          <p className="text-lg text-foreground font-medium mb-3 max-w-lg mx-auto">
            "I found my internship in 2 days. The AI explanation told me exactly why I was a strong candidate — and I used it in my cover letter."
          </p>
          <p className="text-sm text-muted-foreground">— Sarah K., Computer Science student</p>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to find your match?
          </h2>
          <p className="text-muted-foreground mb-8">Join thousands of students already using Steply.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/25">
            Sign in with Google or LinkedIn
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">Steply</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/post-opportunity" className="hover:text-foreground transition-colors">Post an opportunity</Link>
            <span>© 2026 Steply. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}