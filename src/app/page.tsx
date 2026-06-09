'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import CarbonWizard from '@/components/calculator/CarbonWizard';
import InteractiveDashboard from '@/components/dashboard/InteractiveDashboard';
import HabitTracker from '@/components/tracker/HabitTracker';
import AICoach from '@/components/coach/AICoach';
import { CarbonCalculatorInputs, calculateCarbonFootprint, CarbonFootprintResult } from '@/utils/carbonCalculator';
import { HABIT_PRESETS, Habit } from '@/utils/habitPresets';
import { Leaf, Award, Shield, Sparkles, LayoutDashboard, Globe, Zap } from 'lucide-react';

export default function Home() {
  const [inputs, setInputs] = useState<CarbonCalculatorInputs | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [habits, setHabits] = useState<Habit[]>(HABIT_PRESETS);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showWizard, setShowWizard] = useState<boolean>(false);

  // Load state from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    
    const storedInputs = localStorage.getItem('ecoloop_inputs');
    const storedPoints = localStorage.getItem('ecoloop_points');
    const storedHabits = localStorage.getItem('ecoloop_habits');
    const storedDarkMode = localStorage.getItem('ecoloop_darkmode');

    if (storedInputs) {
      setInputs(JSON.parse(storedInputs));
    }
    if (storedPoints) {
      setPoints(Number(storedPoints));
    }
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
    if (storedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Sync state modifications to local storage
  const handleWizardComplete = (wizardData: CarbonCalculatorInputs) => {
    setInputs(wizardData);
    localStorage.setItem('ecoloop_inputs', JSON.stringify(wizardData));
    setShowWizard(false);
  };

  const handleToggleHabit = (habitId: string) => {
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const nextCompleted = !h.completed;
        // Adjust points
        const pointsDiff = nextCompleted ? h.points : -h.points;
        const nextPoints = Math.max(0, points + pointsDiff);
        setPoints(nextPoints);
        localStorage.setItem('ecoloop_points', String(nextPoints));
        return { ...h, completed: nextCompleted };
      }
      return h;
    });

    setHabits(updatedHabits);
    localStorage.setItem('ecoloop_habits', JSON.stringify(updatedHabits));
  };

  const handleReset = () => {
    localStorage.removeItem('ecoloop_inputs');
    localStorage.removeItem('ecoloop_points');
    localStorage.removeItem('ecoloop_habits');
    setInputs(null);
    setPoints(0);
    setHabits(HABIT_PRESETS.map(h => ({ ...h, completed: false })));
    setShowWizard(false);
  };

  const handleThemeChange = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem('ecoloop_darkmode', String(val));
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
    <div className="min-h-screen flex flex-col pb-16 space-y-6">
      {/* Sticky Top Navigation */}
      <Navbar 
        points={points} 
        onReset={handleReset} 
        darkMode={darkMode} 
        setDarkMode={handleThemeChange} 
        hasProfile={inputs !== null}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6">
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
                    Understand & Shrink Your{' '}
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
                    className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-primary/20 hover:scale-105 transition-all duration-200"
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
                    <h3 className="text-sm font-bold text-foreground">Interactive Averages Breakdown</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Visualize your annual footprint across Transport, Energy, Diet, and Waste using modern, interactive Recharts comparisons.
                    </p>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-white/20 text-left space-y-3.5 shadow-md">
                    <div className="p-3 bg-blue-500/15 rounded-2xl w-fit text-blue-500 border border-blue-500/25">
                      <Globe className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Gamified Action Offset Tracker</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Check off daily green habits to earn XP, level up, unlock achievement badges, and watch your carbon score adjust in real-time.
                    </p>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-white/20 text-left space-y-3.5 shadow-md">
                    <div className="p-3 bg-amber-500/15 rounded-2xl w-fit text-amber-500 border border-amber-500/25">
                      <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Contextual AI Coach Insights</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Interact with your embedded coach chatbot, pre-loaded with your profile metrics, to receive tailored green hacks and advice.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full animate-slide-in">
                <CarbonWizard onComplete={handleWizardComplete} />
              </div>
            )}
          </div>
        ) : (
          // Dashboard & Tracking View
          <div className="space-y-8 animate-slide-in">
            {/* Dashboard Visualizations */}
            {baseResult && (
              <InteractiveDashboard 
                baseFootprint={baseResult} 
                dailySavings={dailySavings} 
              />
            )}

            {/* Split Habit Tracker & AI Coach Grid */}
            <div className="grid grid-cols-1 gap-6">
              <HabitTracker 
                habits={habits} 
                onToggleHabit={handleToggleHabit} 
                points={points} 
              />
              
              <AICoach inputs={inputs} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
