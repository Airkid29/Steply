import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StepPersonal from "../components/onboarding/StepPersonal";
import StepAcademic from "../components/onboarding/StepAcademic";
import StepSkills from "../components/onboarding/StepSkills";
import StepGoals from "../components/onboarding/StepGoals";

const stepsMeta = [
  { title: "About you", subtitle: "Let's start with the basics" },
  { title: "Your studies", subtitle: "Tell us about your academic journey" },
  { title: "Your skills", subtitle: "What can you bring to the table?" },
  { title: "Your goals", subtitle: "What are you looking for?" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState(null);

  useEffect(() => {
    if (!authUser) {
      navigate('/login', { replace: true });
      return;
    }

    setUser(authUser);
    setData((prev) => ({ ...prev, name: authUser.full_name || "", email: authUser.email || "" }));
  }, [authUser, navigate]);

  useEffect(() => {
    // Load existing profile
    if (user?.email) {
      base44.entities.UserProfile.filter({ created_by: user.email }).then((profiles) => {
        if (profiles.length > 0) {
          const p = profiles[0];
          setData((prev) => ({
            ...prev,
            ...p,
            name: p.name || prev.name,
            email: user.email,
          }));
          if (p.onboarding_step) setStep(p.onboarding_step);
        }
      }).catch(() => {});
    }
  }, [user?.email]);

  const saveProgress = async (nextStep) => {
    if (!user?.email) return;
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const saveData = { ...data, onboarding_step: nextStep };
    delete saveData.id;
    delete saveData.created_date;
    delete saveData.updated_date;
    delete saveData.created_by;
    delete saveData.email;

    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, saveData);
    } else {
      await base44.entities.UserProfile.create(saveData);
    }
  };

  const next = async () => {
    if (step < 3) {
      await saveProgress(step + 1);
      setStep(step + 1);
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = async () => {
    setSaving(true);
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const saveData = { ...data, onboarding_completed: true, onboarding_step: 4 };
    delete saveData.id;
    delete saveData.created_date;
    delete saveData.updated_date;
    delete saveData.created_by;
    delete saveData.email;

    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, saveData);
    } else {
      await base44.entities.UserProfile.create(saveData);
    }
    setSaving(false);
    navigate("/dashboard");
  };

  const handleResumeFile = (file) => {
    if (!file) return;
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!validTypes.includes(file.type)) {
      setResumeError('Upload a PDF, Word or text file.');
      return;
    }
    setResumeError(null);
    setResumeFile(file);
    setData((prev) => ({
      ...prev,
      resume_file_name: file.name,
      resume_file_type: file.type,
      resume_uploaded_at: new Date().toISOString(),
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepPersonal data={data} onChange={setData} />;
      case 1: return <StepAcademic data={data} onChange={setData} />;
      case 2: return <StepSkills data={data} onChange={setData} />;
      case 3: return <StepGoals data={data} onChange={setData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary" />
          <span className="font-display font-bold text-xl">Steply</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {stepsMeta.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-secondary">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: step > i ? "100%" : step === i ? "50%" : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Step header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Step {step + 1} of 4</p>
          <h1 className="text-2xl font-display font-bold text-foreground">{stepsMeta[step].title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{stepsMeta[step].subtitle}</p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {step === 3 && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground">Optional resume upload</p>
              <p className="text-sm text-muted-foreground">Upload your CV to help Steply understand your experience.</p>
            </div>
            <label className="group flex flex-col gap-3 rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center transition hover:border-primary hover:bg-primary/10">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(event) => handleResumeFile(event.target.files?.[0])}
              />
              <div className="text-sm text-primary font-medium">Choose a file</div>
              <div className="text-xs text-muted-foreground">PDF, Word or text file accepted</div>
            </label>
            {resumeFile && (
              <div className="mt-3 text-sm text-foreground">Selected file: {resumeFile.name}</div>
            )}
            {resumeError && (
              <div className="mt-2 text-sm text-destructive">{resumeError}</div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" onClick={prev} disabled={step === 0} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={next} className="rounded-xl px-6">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving} className="rounded-xl px-6">
              {saving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Finish setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}