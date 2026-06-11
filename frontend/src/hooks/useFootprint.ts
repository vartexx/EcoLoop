/**
 * Custom React hook to orchestrate Carbon Footprint calculations,
 * habit tracking points, and Firestore snapshot synchronization.
 *
 * Implements accessible announcements for screen readers when sync status changes.
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "../lib/api";
import { getDeviceId } from "../lib/identity";
import type { TimelineSnapshot, CoachFeedback, FootprintProfile } from "../lib/types";
import { CarbonCalculatorInputs } from "../utils/carbonCalculator";
import { HABIT_PRESETS, Habit } from "../utils/habitPresets";

/**
 * Translates questionnaire frontend inputs to the backend-compatible profile structure.
 *
 * @param data Questionnaire inputs
 * @returns FootprintProfile mapped object
 */
export const translateToBackendProfile = (data: CarbonCalculatorInputs): FootprintProfile => {
  return {
    transport: {
      car_km_per_week: Math.round((data.petrolCarKm + data.electricCarKm) / 52),
      car_fuel: data.electricCarKm > data.petrolCarKm ? "electric" : "petrol",
      public_transit_km_per_week: Math.round(data.publicTransitKm / 52),
      short_haul_flights_per_year: data.shortFlights,
      long_haul_flights_per_year: data.longFlights,
    },
    home: {
      electricity_kwh_per_month: data.electricityKwh,
      natural_gas_kwh_per_month: data.heatingSource === "gas" ? data.heatingKwh : 0,
      household_size: 1, // standard personal share
    },
    diet: data.dietType === "meat-heavy"
      ? "heavy_meat"
      : data.dietType === "vegetarian"
      ? "vegetarian"
      : data.dietType === "vegan"
      ? "vegan"
      : "medium_meat",
    consumption: {
      goods_spend_usd_per_month: 200, // typical consumption baseline
      waste_kg_per_week: data.recycles ? 5 : 12,
    },
  };
};

/**
 * Custom hook managing the application state, caching, API calls, and sync alerts.
 */
export function useFootprint() {
  const [deviceId] = useState(getDeviceId);
  const [inputs, setInputs] = useState<CarbonCalculatorInputs | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [habits, setHabits] = useState<Habit[]>(HABIT_PRESETS);

  // Cloud Sync State
  const [cloudSnapshots, setCloudSnapshots] = useState<TimelineSnapshot[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Accessibility screen-reader announcement state
  const [announcement, setAnnouncement] = useState<string>("");

  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear after announcement to allow repeating the same message
    setTimeout(() => setAnnouncement(""), 2000);
  };

  // Sync snapshot to cloud database (Firestore)
  const syncToCloud = useCallback(async (currentInputs: CarbonCalculatorInputs) => {
    setSyncing(true);
    setSyncSuccess(false);
    setSyncError(null);
    announce("Synchronizing your carbon footprint calculations to the cloud.");

    try {
      const profile = translateToBackendProfile(currentInputs);
      
      // 1. Evaluate report on the backend
      const report = await api.evaluateProfile(profile);
      
      // 2. Upload snapshot
      await api.uploadSnapshot(deviceId, profile, report);
      
      // 3. Request advisor coaching recommendations
      const feedback = await api.fetchCoachFeedback(profile);
      setCoachFeedback(feedback);
      localStorage.setItem("ecoloop_coach_feedback", JSON.stringify(feedback));

      // 4. Reload snapshots list
      const snapshots = await api.loadSnapshots(deviceId);
      setCloudSnapshots(snapshots);

      setSyncSuccess(true);
      announce("Cloud synchronization complete. Your dashboard and history are up to date.");
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error("Cloud synchronization failed:", err);
      setSyncError("Cloud synchronization failed. Using local calculations.");
      announce("Cloud synchronization failed. Using offline rule-based fallback.");
    } finally {
      setSyncing(false);
    }
  }, [deviceId]);

  // Load state from local storage on mount
  useEffect(() => {
    const storedInputs = localStorage.getItem("ecoloop_inputs");
    const storedPoints = localStorage.getItem("ecoloop_points");
    const storedHabits = localStorage.getItem("ecoloop_habits");
    const storedFeedback = localStorage.getItem("ecoloop_coach_feedback");

    if (storedInputs) {
      const parsedInputs = JSON.parse(storedInputs);
      setInputs(parsedInputs);
      // Fetch cloud snapshots in the background
      void api.loadSnapshots(deviceId).then(setCloudSnapshots).catch(() => {});
    }
    if (storedPoints) {
      setPoints(Number(storedPoints));
    }
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
    if (storedFeedback) {
      setCoachFeedback(JSON.parse(storedFeedback));
    }
  }, [deviceId]);

  const handleWizardComplete = async (wizardData: CarbonCalculatorInputs) => {
    setInputs(wizardData);
    localStorage.setItem("ecoloop_inputs", JSON.stringify(wizardData));
    
    // Sync calculations and trigger coaching queries immediately
    await syncToCloud(wizardData);
  };

  const handleToggleHabit = (habitId: string) => {
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const nextCompleted = !h.completed;
        const pointsDiff = nextCompleted ? h.points : -h.points;
        const nextPoints = Math.max(0, points + pointsDiff);
        setPoints(nextPoints);
        localStorage.setItem("ecoloop_points", String(nextPoints));
        
        announce(
          nextCompleted
            ? `Completed habit: ${h.title}. Gained ${h.points} points. Total points is now ${nextPoints}.`
            : `Undid habit: ${h.title}. Lost ${h.points} points. Total points is now ${nextPoints}.`
        );
        return { ...h, completed: nextCompleted };
      }
      return h;
    });

    setHabits(updatedHabits);
    localStorage.setItem("ecoloop_habits", JSON.stringify(updatedHabits));
  };

  const handleReset = () => {
    localStorage.removeItem("ecoloop_inputs");
    localStorage.removeItem("ecoloop_points");
    localStorage.removeItem("ecoloop_habits");
    localStorage.removeItem("ecoloop_coach_feedback");
    setInputs(null);
    setPoints(0);
    setCoachFeedback(null);
    setCloudSnapshots([]);
    setHabits(HABIT_PRESETS.map(h => ({ ...h, completed: false })));
    announce("Dashboard data reset successfully.");
  };

  return {
    deviceId,
    inputs,
    points,
    habits,
    cloudSnapshots,
    coachFeedback,
    syncing,
    syncSuccess,
    syncError,
    announcement,
    syncToCloud,
    handleWizardComplete,
    handleToggleHabit,
    handleReset,
  };
}
