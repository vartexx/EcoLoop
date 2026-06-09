'use client';

import React from 'react';
import { Leaf, Sun, Moon, RotateCcw, Award } from 'lucide-react';

interface NavbarProps {
  points: number;
  onReset: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  hasProfile: boolean;
}

export default function Navbar({ points, onReset, darkMode, setDarkMode, hasProfile }: NavbarProps) {
  const level = Math.floor(points / 50) + 1;
  const nextLevelPoints = level * 50;
  const prevLevelPoints = (level - 1) * 50;
  const progressPercent = Math.min(100, Math.max(0, ((points - prevLevelPoints) / 50) * 100));

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4">
      <nav 
        className="glass rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg border border-white/20 dark:border-white/5 transition-all duration-300"
        aria-label="Main Navigation"
      >
        {/* Brand Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-primary/20 p-2 rounded-xl text-primary flex items-center justify-center animate-pulse">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EcoLoop
          </span>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center space-x-4">
          {hasProfile && (
            <div className="hidden sm:flex items-center space-x-3 bg-muted px-4 py-1.5 rounded-full border border-border">
              <div className="flex items-center space-x-1.5 text-primary">
                <Award className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Lvl {level}</span>
              </div>
              
              {/* Level progress bar */}
              <div className="w-16 h-2 bg-background/50 rounded-full overflow-hidden relative" title={`${points % 50}/50 pts for next level`}>
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <span className="text-xs font-bold text-foreground">
                {points} <span className="text-muted-foreground font-normal">pts</span>
              </span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors duration-200 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Reset profile button */}
          {hasProfile && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset your profile and calculator details? This will delete all progress.')) {
                  onReset();
                }
              }}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-colors duration-200 border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Reset Application Profile"
              title="Reset Profile"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
