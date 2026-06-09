import * as Icons from 'lucide-react';
import { Habit, BADGES } from '../../utils/habitPresets';

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  points: number;
}

// Helper component to render Lucide icons dynamically
const EcoIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.Leaf className={className} />;
  return <IconComponent className={className} />;
};

export default function HabitTracker({ habits, onToggleHabit, points }: HabitTrackerProps) {
  
  // Group habits by categories for clean organization
  const categories = {
    transport: { label: 'Transport', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: 'Train' },
    energy: { label: 'Energy', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: 'Zap' },
    diet: { label: 'Diet', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: 'Apple' },
    waste: { label: 'Waste', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: 'Trash2' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Habit Checklist Section */}
      <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/20 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Daily Habit Tracker</h2>
          <p className="text-xs text-muted-foreground">Complete simple tasks today to dynamically lower your carbon score and earn Eco Points.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
          {habits.map((habit) => {
            const cat = categories[habit.category];
            return (
              <div 
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 select-none flex flex-col justify-between h-[130px] ${
                  habit.completed 
                    ? 'bg-primary/10 border-primary shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-primary' 
                    : 'bg-card border-border hover:bg-accent/40'
                }`}
                role="checkbox"
                aria-checked={habit.completed}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleHabit(habit.id);
                  }
                }}
              >
                <div className="flex justify-between items-start space-x-2">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.color}`}>
                      <EcoIcon name={cat.icon} className="h-3 w-3 mr-1" />
                      {cat.label}
                    </span>
                    <h3 className="text-xs font-bold text-foreground line-clamp-1">{habit.title}</h3>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    habit.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/35'
                  }`}>
                    {habit.completed && <Icons.Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-snug">{habit.description}</p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px] font-bold">
                  <span className="text-primary flex items-center">
                    <Icons.TrendingDown className="h-3 w-3 mr-0.5" />
                    -{habit.offset} kg
                  </span>
                  <span className="text-muted-foreground">
                    +{habit.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification Badges Section */}
      <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Achievements</h2>
          <p className="text-xs text-muted-foreground">Unlock unique badges as you accumulate eco points.</p>
        </div>

        <div className="space-y-3.5">
          {BADGES.map((badge) => {
            const isUnlocked = points >= badge.unlockedAtPoints;
            return (
              <div 
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-center space-x-3.5 transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-emerald-500/5 to-secondary/5 border-emerald-500/20 shadow-md relative overflow-hidden' 
                    : 'bg-card/40 border-border/50 opacity-60'
                }`}
              >
                {/* Shine overlay for unlocked badge */}
                {isUnlocked && (
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-30 animate-[shine_3s_ease-in-out_infinite]" />
                )}

                <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                  isUnlocked 
                    ? 'bg-primary border-primary/20 text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'bg-muted border-border text-muted-foreground'
                }`}>
                  <EcoIcon name={badge.icon} className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <h3 className={`text-xs font-bold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.title}
                    </h3>
                    {!isUnlocked && (
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wide">
                        {badge.unlockedAtPoints} pts
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
