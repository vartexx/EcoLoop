'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Plane, Train, Zap, Home, Flame, 
  Apple, Trash2, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Leaf
} from 'lucide-react';
import { CarbonCalculatorInputs, DEFAULT_INPUTS } from '@/utils/carbonCalculator';

interface CarbonWizardProps {
  onComplete: (inputs: CarbonCalculatorInputs) => void;
}

type StepId = 'intro' | 'transport' | 'energy' | 'diet-waste';

export default function CarbonWizard({ onComplete }: CarbonWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<CarbonCalculatorInputs>(DEFAULT_INPUTS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: { id: StepId; title: string; desc: string }[] = [
    { id: 'intro', title: 'Welcome to EcoLoop', desc: 'Discover your annual carbon footprint in under 2 minutes.' },
    { id: 'transport', title: 'Transit Habits', desc: 'Tell us how you commute and travel around the world.' },
    { id: 'energy', title: 'Household Energy', desc: 'Provide your monthly home utility consumption details.' },
    { id: 'diet-waste', title: 'Diet & Lifestyle', desc: 'Share your eating habits and recycling practices.' }
  ];

  const currentStep = steps[stepIndex];

  const handleInputChange = (field: keyof CarbonCalculatorInputs, value: string | boolean) => {
    let parsedValue: string | number | boolean = value;
    
    if (typeof value === 'string' && field !== 'dietType' && field !== 'heatingSource' && field !== 'foodWaste') {
      const num = Number(value);
      parsedValue = isNaN(num) ? 0 : num;
    }

    setFormData(prev => ({
      ...prev,
      [field]: parsedValue
    }));

    // Clear error for the field once user starts typing/editing
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep.id === 'transport') {
      if (formData.petrolCarKm < 0) newErrors.petrolCarKm = 'Distance cannot be negative';
      if (formData.electricCarKm < 0) newErrors.electricCarKm = 'Distance cannot be negative';
      if (formData.publicTransitKm < 0) newErrors.publicTransitKm = 'Distance cannot be negative';
      if (formData.shortFlights < 0) newErrors.shortFlights = 'Flight count cannot be negative';
      if (formData.longFlights < 0) newErrors.longFlights = 'Flight count cannot be negative';
    }

    if (currentStep.id === 'energy') {
      if (formData.electricityKwh < 0) newErrors.electricityKwh = 'Electricity cannot be negative';
      if (formData.heatingKwh < 0) newErrors.heatingKwh = 'Heating value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (stepIndex < steps.length - 1) {
        setStepIndex(prev => prev + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Step Indicators */}
      {stepIndex > 0 && (
        <div className="mb-8 flex items-center justify-between px-2">
          {steps.slice(1).map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepIndex > stepNum;
            const isActive = stepIndex === stepNum;
            return (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center relative flex-1">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : isActive 
                        ? 'border-primary text-primary bg-primary/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNum}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 2 && (
                  <div 
                    className={`h-0.5 flex-1 mx-2 rounded transition-all duration-500 ${
                      stepIndex > stepNum ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`} 
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Wizard Form Container */}
      <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep.id}
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{currentStep.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{currentStep.desc}</p>
            </div>

            {/* Step Content */}
            {currentStep.id === 'intro' && (
              <div className="py-6 flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                  <Leaf className="h-10 w-10 animate-bounce" />
                </div>
                <div className="text-center space-y-3 max-w-md">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    By answering a few simple questions about your transportation, home energy consumption, and dietary habits, we will estimate your carbon footprint and guide you on actionable steps to shrink it.
                  </p>
                  <p className="text-xs text-primary font-semibold">
                    🌱 All calculations are stored locally in your browser.
                  </p>
                </div>
              </div>
            )}

            {currentStep.id === 'transport' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 flex items-center space-x-1">
                  <Car className="h-4 w-4" /> <span>Road Mileage (km per year)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Petrol/Diesel Car</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.petrolCarKm}
                      onChange={e => handleInputChange('petrolCarKm', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition ${
                        errors.petrolCarKm ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                      }`}
                    />
                    {errors.petrolCarKm && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" />{errors.petrolCarKm}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Electric Vehicle (EV)</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.electricCarKm}
                      onChange={e => handleInputChange('electricCarKm', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition ${
                        errors.electricCarKm ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                      }`}
                    />
                    {errors.electricCarKm && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" />{errors.electricCarKm}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 mb-3 flex items-center space-x-1">
                      <Train className="h-4 w-4" /> <span>Public Transit</span>
                    </h3>
                    <label className="block text-xs font-medium text-foreground mb-1">Bus/Train (km per year)</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.publicTransitKm}
                      onChange={e => handleInputChange('publicTransitKm', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition ${
                        errors.publicTransitKm ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                      }`}
                    />
                    {errors.publicTransitKm && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" />{errors.publicTransitKm}</p>}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 mb-3 flex items-center space-x-1">
                      <Plane className="h-4 w-4" /> <span>Aviation (flights per year)</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-foreground mb-1">Short (&lt; 3 hrs)</label>
                        <input 
                          type="number"
                          min="0"
                          value={formData.shortFlights}
                          onChange={e => handleInputChange('shortFlights', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition ${
                            errors.shortFlights ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-foreground mb-1">Long (&gt; 3 hrs)</label>
                        <input 
                          type="number"
                          min="0"
                          value={formData.longFlights}
                          onChange={e => handleInputChange('longFlights', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition ${
                            errors.longFlights ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                          }`}
                        />
                      </div>
                    </div>
                    {(errors.shortFlights || errors.longFlights) && (
                      <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" />Flight counts invalid</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep.id === 'energy' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 mb-3 flex items-center space-x-1">
                      <Zap className="h-4 w-4" /> <span>Electricity</span>
                    </h3>
                    <label className="block text-xs font-medium text-foreground mb-1">Average Monthly Usage (kWh)</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.electricityKwh}
                      onChange={e => handleInputChange('electricityKwh', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition ${
                        errors.electricityKwh ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                      }`}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Typical home is ~300-500 kWh/month.</p>
                    {errors.electricityKwh && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" />{errors.electricityKwh}</p>}

                    <div className="mt-4 flex items-center">
                      <input 
                        type="checkbox" 
                        id="hasSolar"
                        checked={formData.hasSolar}
                        onChange={e => handleInputChange('hasSolar', e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 bg-input mr-2"
                      />
                      <label htmlFor="hasSolar" className="text-xs font-medium text-foreground">We use Solar Panels at home ☀️</label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 mb-3 flex items-center space-x-1">
                      <Flame className="h-4 w-4" /> <span>Home Heating</span>
                    </h3>
                    <label className="block text-xs font-medium text-foreground mb-1">Heating Source</label>
                    <select
                      value={formData.heatingSource}
                      onChange={e => handleInputChange('heatingSource', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition mb-3"
                    >
                      <option value="gas">Natural Gas</option>
                      <option value="oil">Heating Oil</option>
                      <option value="electricity">Electric Heat / Heat Pump</option>
                      <option value="biomass">Biomass / Wood</option>
                      <option value="none">No Heating / Green Energy Only</option>
                    </select>

                    {formData.heatingSource !== 'none' && (
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          {formData.heatingSource === 'oil' ? 'Monthly Oil usage (Litres)' : 'Average Monthly heating (kWh)'}
                        </label>
                        <input 
                          type="number"
                          min="0"
                          value={formData.heatingKwh}
                          onChange={e => handleInputChange('heatingKwh', e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition ${
                            errors.heatingKwh ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                          }`}
                        />
                        {errors.heatingKwh && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" />{errors.heatingKwh}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep.id === 'diet-waste' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 mb-3 flex items-center space-x-1">
                      <Apple className="h-4 w-4" /> <span>Diet Style</span>
                    </h3>
                    <label className="block text-xs font-medium text-foreground mb-1.5">What is your typical diet?</label>
                    <div className="space-y-2">
                      {[
                        { val: 'meat-heavy', label: '🥩 Meat-Heavy (lots of red meat/dairy)' },
                        { val: 'average', label: '🥗 Average (mixed meats & vegetables)' },
                        { val: 'vegetarian', label: '🍳 Vegetarian (no meat, includes dairy/eggs)' },
                        { val: 'vegan', label: '🌱 Vegan (100% plant-based)' }
                      ].map(option => (
                        <label key={option.val} className="flex items-center p-2.5 rounded-xl border border-border hover:bg-accent/40 cursor-pointer transition">
                          <input 
                            type="radio" 
                            name="dietType"
                            value={option.val}
                            checked={formData.dietType === option.val}
                            onChange={() => handleInputChange('dietType', option.val)}
                            className="text-primary focus:ring-primary mr-3"
                          />
                          <span className="text-xs font-medium text-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 mb-3 flex items-center space-x-1">
                      <Trash2 className="h-4 w-4" /> <span>Waste & Recycling</span>
                    </h3>
                    
                    <div className="flex items-center p-2.5 rounded-xl border border-border bg-input/50 mb-4">
                      <input 
                        type="checkbox" 
                        id="recycles"
                        checked={formData.recycles}
                        onChange={e => handleInputChange('recycles', e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 mr-3"
                      />
                      <label htmlFor="recycles" className="text-xs font-medium text-foreground cursor-pointer">
                        We actively sort and recycle packaging (glass, metal, paper) ♻️
                      </label>
                    </div>

                    <label className="block text-xs font-medium text-foreground mb-1.5">Food waste level in your house</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'low', label: 'Minimal 🗑️' },
                        { val: 'medium', label: 'Average 🍕' },
                        { val: 'high', label: 'Frequent 🍎' }
                      ].map(level => (
                        <button
                          key={level.val}
                          type="button"
                          onClick={() => handleInputChange('foodWaste', level.val)}
                          className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition ${
                            formData.foodWaste === level.val 
                              ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                              : 'border-border bg-input text-foreground hover:bg-accent/40'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Food waste decay releases powerful greenhouse gases in landfills.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={stepIndex === 0}
                className={`flex items-center space-x-1 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  stepIndex === 0 
                    ? 'border-transparent text-muted-foreground/45 cursor-not-allowed' 
                    : 'border-border bg-card text-foreground hover:bg-accent'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-primary/20 hover:scale-[1.02] focus:scale-[0.98] transition-all duration-200"
              >
                <span>{stepIndex === steps.length - 1 ? 'Calculate Footprint' : 'Next Step'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
