import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFootprint } from "./useFootprint";
import * as api from "../lib/api";
import { CarbonCalculatorInputs } from "../utils/carbonCalculator";

vi.mock("../lib/api", () => ({
  evaluateProfile: vi.fn(),
  fetchCoachFeedback: vi.fn(),
  uploadSnapshot: vi.fn(),
  loadSnapshots: vi.fn(),
}));

describe("useFootprint Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("loads default state on initialization", () => {
    const { result } = renderHook(() => useFootprint());
    expect(result.current.inputs).toBeNull();
    expect(result.current.points).toBe(0);
    expect(result.current.syncing).toBe(false);
  });

  it("toggles habits and updates points", () => {
    const { result } = renderHook(() => useFootprint());
    
    // Toggle first habit (Reusable Bottle: 10 points)
    act(() => {
      result.current.handleToggleHabit(result.current.habits[0].id);
    });

    expect(result.current.points).toBe(10);
    expect(result.current.habits[0].completed).toBe(true);

    // Toggle again to undo
    act(() => {
      result.current.handleToggleHabit(result.current.habits[0].id);
    });

    expect(result.current.points).toBe(0);
    expect(result.current.habits[0].completed).toBe(false);
  });

  it("handles resetting state", () => {
    const { result } = renderHook(() => useFootprint());
    
    act(() => {
      result.current.handleToggleHabit(result.current.habits[0].id);
    });
    expect(result.current.points).toBe(10);

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.inputs).toBeNull();
    expect(result.current.points).toBe(0);
    expect(result.current.habits[0].completed).toBe(false);
  });

  it("synchronizes wizard data with cloud endpoints on completion", async () => {
    const mockProfile: CarbonCalculatorInputs = {
      petrolCarKm: 1000,
      electricCarKm: 0,
      publicTransitKm: 500,
      shortFlights: 1,
      longFlights: 0,
      electricityKwh: 300,
      heatingSource: "gas",
      heatingKwh: 100,
      dietType: "vegan",
      recycles: true,
      foodWaste: "low",
      hasSolar: false,
    };

    vi.mocked(api.evaluateProfile).mockResolvedValue({ total_annual_tonnes: 2.1 } as any);
    vi.mocked(api.fetchCoachFeedback).mockResolvedValue({ summary: "Good job!" } as any);
    vi.mocked(api.loadSnapshots).mockResolvedValue([{ id: "snap1" }] as any);

    const { result } = renderHook(() => useFootprint());

    await act(async () => {
      await result.current.handleWizardComplete(mockProfile);
    });

    expect(api.evaluateProfile).toHaveBeenCalled();
    expect(api.uploadSnapshot).toHaveBeenCalled();
    expect(api.fetchCoachFeedback).toHaveBeenCalled();
    expect(result.current.coachFeedback).toEqual({ summary: "Good job!" });
    expect(result.current.cloudSnapshots).toEqual([{ id: "snap1" }]);
  });
});
