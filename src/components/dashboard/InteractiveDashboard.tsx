'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  TrendingDown, Globe, Award, ShieldAlert, Sparkles, HelpCircle 
} from 'lucide-react';
import { CarbonFootprintResult, BENCHMARKS } from '@/utils/carbonCalculator';

interface InteractiveDashboardProps {
  baseFootprint: CarbonFootprintResult;
  dailySavings: number;
}

export default function InteractiveDashboard({ baseFootprint, dailySavings }: InteractiveDashboardProps) {
  const [mounted, setMounted] = useState(false);

  // Avoid SSR issues with Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate projected annual savings
  const annualSavings = Math.round(dailySavings * 365);
  const activeTotal = Math.max(0, baseFootprint.total - annualSavings);
  const activeTransport = Math.max(0, baseFootprint.transport - Math.round(annualSavings * 0.4)); // assume 40% transport savings offset
  const activeEnergy = Math.max(0, baseFootprint.energy - Math.round(annualSavings * 0.3));
  const activeDiet = Math.max(0, baseFootprint.diet - Math.round(annualSavings * 0.2));
  const activeWaste = Math.max(0, baseFootprint.waste - Math.round(annualSavings * 0.1));

  // Pie chart data
  const pieData = [
    { name: 'Transport', value: activeTransport, color: '#10b981' }, // Emerald 500
    { name: 'Energy', value: activeEnergy, color: '#34d399' },    // Emerald 400
    { name: 'Diet', value: activeDiet, color: '#059669' },      // Emerald 600
    { name: 'Waste', value: activeWaste, color: '#a7f3d0' }       // Emerald 200
  ].filter(item => item.value > 0);

  // Comparison bar chart data
  const barData = [
    { name: 'You (Active)', footprint: activeTotal, fill: '#059669' },
    { name: 'Global Avg', footprint: BENCHMARKS.globalAverage, fill: '#64748b' },
    { name: 'National Avg', footprint: BENCHMARKS.nationalAverage, fill: '#ef4444' }
  ];

  // Grade/Feedback based on active total
  const getEcoStatus = (total: number) => {
    if (total <= BENCHMARKS.targetSustainable) {
      return { label: 'Climate Hero 🌟', color: 'text-green-500 bg-green-500/10 border-green-500/20', desc: 'Fantastic! Your footprint meets the global sustainable climate targets.' };
    }
    if (total <= BENCHMARKS.globalAverage) {
      return { label: 'Good Progress 🌱', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: 'Great! You are below the global average footprint. Keep cutting!' };
    }
    if (total < BENCHMARKS.nationalAverage) {
      return { label: 'Moderate Footprint ⚠️', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', desc: 'You are below your national average, but above global sustainability standards.' };
    }
    return { label: 'High Footprint 🚨', color: 'text-red-500 bg-red-500/10 border-red-500/20', desc: 'Your carbon footprint is higher than average. Complete more daily tasks to lower it!' };
  };

  const status = getEcoStatus(activeTotal);

  if (!mounted) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Footprint Score card */}
        <div className="glass rounded-3xl p-6 border border-white/20 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual Projection</span>
              <h3 className="text-3xl font-extrabold text-foreground mt-1 flex items-baseline">
                {activeTotal.toLocaleString()}{' '}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg CO2e</span>
              </h3>
            </div>
            <div className="bg-primary/10 p-2.5 rounded-2xl text-primary border border-primary/20">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{status.desc}</p>
          </div>
        </div>

        {/* Daily Savings card */}
        <div className="glass rounded-3xl p-6 border border-white/20 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Habit Offset</span>
              <h3 className="text-3xl font-extrabold text-primary mt-1 flex items-baseline">
                -{dailySavings.toFixed(1)}{' '}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg CO2e</span>
              </h3>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-500 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground leading-relaxed block">
              Daily habit completions translate to a projected annual savings of{' '}
              <strong className="text-foreground">{annualSavings.toLocaleString()} kg CO2e</strong>!
            </span>
          </div>
        </div>

        {/* Benchmark Card */}
        <div className="glass rounded-3xl p-6 border border-white/20 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Global Target</span>
              <h3 className="text-3xl font-extrabold text-foreground mt-1 flex items-baseline">
                {BENCHMARKS.targetSustainable.toLocaleString()}{' '}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg CO2e</span>
              </h3>
            </div>
            <div className="bg-slate-500/10 p-2.5 rounded-2xl text-muted-foreground border border-slate-500/20">
              <Globe className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground leading-relaxed block">
              To halt global warming at 1.5°C, individual annual targets need to hit{' '}
              <strong className="text-foreground">2,000 kg CO2e</strong> by 2030.
            </span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Donut) */}
        <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="text-md font-bold text-foreground">Carbon Footprint Breakdown</h3>
            <p className="text-xs text-muted-foreground">Your active emissions by lifestyle categories.</p>
          </div>

          <div className="h-64 mt-4 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(21, 34, 56, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      color: '#fff' 
                    }}
                    formatter={(value) => [`${value} kg CO2e/yr`, 'Emissions']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-foreground font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-muted-foreground">No emissions to display!</div>
            )}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground">{activeTotal.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total kg/yr</span>
            </div>
          </div>
        </div>

        {/* Benchmark Comparison (Bar) */}
        <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="text-md font-bold text-foreground">Comparison Benchmark</h3>
            <p className="text-xs text-muted-foreground">How you compare against national and global carbon metrics.</p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 10 }} 
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(21, 34, 56, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff' 
                  }}
                  formatter={(value) => [`${value} kg CO2e/yr`, 'Carbon Footprint']}
                />
                <Bar 
                  dataKey="footprint" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
