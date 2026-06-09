import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import App from "./App";
import type { AnalysisReport, CoachFeedback } from "./lib/types";

// Mock the API layer so the integration test runs without a backend.
vi.mock("./lib/api", () => ({
  evaluateProfile: vi.fn(),
  fetchCoachFeedback: vi.fn(),
  uploadSnapshot: vi.fn(),
  loadSnapshots: vi.fn(),
}));

import * as api from "./lib/api";

const result: AnalysisReport = {
  breakdown_kg: { transport: 2000, home: 1000, diet: 1500, consumption: 500 },
  total_annual_kg: 5000,
  total_annual_tonnes: 5.0,
  comparison: {
    global_average_annual_kg: 4800,
    sustainable_target_annual_kg: 2000,
    ratio_to_global_average: 1.04,
    ratio_to_sustainable_target: 2.5,
  },
};

const insights: CoachFeedback = {
  summary: "Your footprint is above the sustainable target.",
  recommendations: [
    { category: "transport", action: "Drive less", estimated_annual_savings_kg: 400 },
  ],
  source: "rules",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.loadSnapshots).mockResolvedValue([]);
  vi.mocked(api.evaluateProfile).mockResolvedValue(result);
  vi.mocked(api.fetchCoachFeedback).mockResolvedValue(insights);
  vi.mocked(api.uploadSnapshot).mockResolvedValue({
    id: "snapshot1",
    created_at: new Date().toISOString(),
    device_id: "dev-123",
    input: {} as never,
    result,
  });
});

// Mock Recharts responsive container to render in jsdom
vi.mock("recharts", async () => {
  const original = await vi.importActual<any>("recharts");
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe("App", () => {
  it("renders with no accessibility violations on landing", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("navigates to the questionnaire when CTA is clicked", async () => {
    render(<App />);
    const cta = screen.getByRole("button", { name: /start carbon questionnaire/i });
    expect(cta).toBeInTheDocument();

    await userEvent.click(cta);
    expect(screen.getByText(/discover your annual carbon footprint/i)).toBeInTheDocument();
  });

  it("can reset profile state", async () => {
    // Put dummy inputs in localStorage to simulate completed state
    localStorage.setItem("ecoloop_inputs", JSON.stringify({ petrolCarKm: 100 }));
    
    render(<App />);
    
    // Reset button should be visible in Navbar
    const resetBtn = screen.getByTitle(/reset profile/i);
    expect(resetBtn).toBeInTheDocument();

    // Stub window.confirm to return true
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    await userEvent.click(resetBtn);
    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByText(/start carbon questionnaire/i)).toBeInTheDocument();
    
    confirmSpy.mockRestore();
    localStorage.clear();
  });
});
