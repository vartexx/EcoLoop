import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import FootprintWizard from "./components/calculator/FootprintWizard";
import VisualSummary from "./components/dashboard/VisualSummary";
import HabitTracker from "./components/tracker/HabitTracker";
import AICoach from "./components/coach/AICoach";
import { calculateCarbonFootprint, CarbonFootprintResult } from "./utils/carbonCalculator";
import { Sparkles, LayoutDashboard, Globe, Zap, Cloud, RefreshCw, CheckCircle2 } from "lucide-react";
import { useFootprint } from "./hooks/useFootprint";

export default function App() {
  const {
    inputs,
    points,
    habits,
    cloudSnapshots,
    coachFeedback,
    syncing,
    syncSuccess,
    announcement,
    syncToCloud,
    handleWizardComplete,
    handleToggleHabit,
    handleReset,
  } = useFootprint();

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showWizard, setShowWizard] = useState<boolean>(false);

  // Load theme state from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    const storedDarkMode = localStorage.getItem("ecoloop_darkmode");
    if (storedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeChange = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("ecoloop_darkmode", String(val));
    if (val) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const onWizardComplete = (wizardData: any) => {
    void handleWizardComplete(wizardData);
    setShowWizard(false);
  };

  // Calculations
  const baseResult: CarbonFootprintResult | null = inputs ? calculateCarbonFootprint(inputs) : null;
  const dailySavings = habits.filter(h => h.completed).reduce((sum, h) => sum + h.offset, 0);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {/* Visually hidden live region for screen-reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <div className="min-h-screen flex flex-col pb-16 space-y-6 bg-background text-foreground">
        {/* Sticky Top Navigation */}
        <Navbar 
          points={points} 
          onReset={handleReset} 
          darkMode={darkMode} 
          setDarkMode={handleThemeChange} 
          hasProfile={inputs !== null}
        />

        <main id="main" className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6">
          {inputs === null ? (
            // Landing View & Wizard flow
            <div className="py-12 flex flex-col items-center">
              {!showWizard ? (
                <div className="text-center max-w-3xl space-y-8 animate-slide-in">
                  {/* Hero Title */}
                  <div className="space-y-4">
                    <span className="inline-flex items-center text-xs font-bold text-primary px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/10">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" /> 2026 Climate Hackathon Challenge
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
                      Understand & Shrink Your{" "}
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Carbon Footprint
                      </span>
                    </h1>
                    <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      EcoLoop leverages smart calculator metrics, gamified micro-challenges, and a personalized AI Sustainability Coach to make carbon reduction transparent, achievable, and rewarding.
                    </p>
                  </div>

                  {/* Main CTA */}
                  <div>
                    <button
                      onClick={() => setShowWizard(true)}
                      className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-primary/20 hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                      Start Carbon Questionnaire
                    </button>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    <div className="glass p-6 rounded-3xl border border-white/20 text-left space-y-3.5 shadow-md">
                      <div className="p-3 bg-primary/15 rounded-2xl w-fit text-primary border border-primary/25">
                        <LayoutDashboard className="h-6 w-6" />
                      </div>
                      <h2 className="text-sm font-bold text-foreground">Interactive Averages Breakdown</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Visualize your annual footprint across Transport, Energy, Diet, and Waste using modern, interactive Recharts comparisons.
                      </p>
                    </div>

                    <div className="glass p-6 rounded-3xl border border-white/20 text-left space-y-3.5 shadow-md">
                      <div className="p-3 bg-blue-500/15 rounded-2xl w-fit text-blue-500 border border-blue-500/25">
                        <Globe className="h-6 w-6" />
                      </div>
                      <h2 className="text-sm font-bold text-foreground">Gamified Action Offset Tracker</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Check off daily green habits to earn XP, level up, unlock achievement badges, and watch your carbon score adjust in real-time.
                      </p>
                    </div>

                    <div className="glass p-6 rounded-3xl border border-white/20 text-left space-y-3.5 shadow-md">
                      <div className="p-3 bg-amber-500/15 rounded-2xl w-fit text-amber-500 border border-amber-500/25">
                        <Zap className="h-6 w-6" />
                      </div>
                      <h2 className="text-sm font-bold text-foreground">Contextual AI Coach Insights</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Interact with your embedded coach chatbot, pre-loaded with your profile metrics, to receive tailored green hacks and advice.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full animate-slide-in">
                  <h1 className="sr-only">EcoLoop Carbon Questionnaire</h1>
                  <FootprintWizard onComplete={onWizardComplete} />
                </div>
              )}
            </div>
          ) : (
            // Dashboard & Tracking View
            <div className="space-y-8 animate-slide-in">
              <h1 className="sr-only">EcoLoop Carbon Dashboard</h1>
              
              {/* Cloud Synchronization Panel */}
              <div className="glass rounded-3xl p-4 border border-white/20 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl border ${syncSuccess ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-primary/10 border-primary/20 text-primary"}`}>
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Cloud Sync Context</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {cloudSnapshots.length > 0 
                        ? `Stored ${cloudSnapshots.length} anonymous carbon snapshots in Firestore` 
                        : "Footprints calculations mapped locally"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => inputs && syncToCloud(inputs)}
                  disabled={syncing}
                  className="px-4 py-2 border border-border bg-card rounded-xl text-xs font-semibold text-foreground hover:bg-accent flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : syncSuccess ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500">Synced!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Sync to Cloud</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dashboard Visualizations */}
              {baseResult && (
                <VisualSummary 
                  baseFootprint={baseResult} 
                  dailySavings={dailySavings} 
                />
              )}

              {/* Split Habit Tracker & AI Coach Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <HabitTracker 
                  habits={habits} 
                  onToggleHabit={handleToggleHabit} 
                  points={points} 
                />
                
                <AICoach inputs={inputs} feedback={coachFeedback} />
              </div>

              {/* Historical Cloud Snapshots Table */}
              {cloudSnapshots.length > 0 && (
                <section className="glass rounded-3xl p-6 border border-white/20 shadow-xl space-y-4">
                  <div>
                    <h2 className="text-md font-bold text-foreground">Cloud Snapshot History</h2>
                    <p className="text-xs text-muted-foreground">Your anonymous footprint snapshots synchronized on Google Cloud Firestore.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="history w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-semibold text-muted-foreground border-b border-border pb-2">Snapshot Date</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground border-b border-border pb-2">Diet</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground border-b border-border pb-2">Commute (Weekly)</th>
                          <th className="text-right text-xs font-semibold text-muted-foreground border-b border-border pb-2">Emissions (t CO₂e/yr)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cloudSnapshots.map((snapshot) => (
                          <tr key={snapshot.id}>
                            <td className="text-xs text-foreground py-2.5 border-b border-border/50">
                              {new Date(snapshot.created_at).toLocaleDateString(undefined, {
                                year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </td>
                            <td className="text-xs text-foreground py-2.5 border-b border-border/50 capitalize">
                              {snapshot.input.diet.replace("_", " ")}
                            </td>
                            <td className="text-xs text-foreground py-2.5 border-b border-border/50">
                              {snapshot.input.transport.car_km_per_week} km ({snapshot.input.transport.car_fuel})
                            </td>
                            <td className="text-xs text-foreground py-2.5 border-b border-border/50 text-right font-bold">
                              {snapshot.result.total_annual_tonnes.toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
