import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import VisualSummary from "./VisualSummary";

// Mock Recharts responsive container to render in jsdom
vi.mock("recharts", async () => {
  const original = await vi.importActual<any>("recharts");
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe("VisualSummary", () => {
  const footprintMock = {
    transport: 1500,
    energy: 2500,
    diet: 1000,
    waste: 200,
    total: 5200,
  };

  it("renders comparison benchmark and category breakdown donut charts", async () => {
    const { container } = render(
      <VisualSummary baseFootprint={footprintMock} dailySavings={2} />
    );

    // Verify headers
    expect(screen.getByText("Carbon Footprint Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Comparison Benchmark")).toBeInTheDocument();

    // Verify annual savings (2 kg/day * 365 days = 730 kg/year)
    // Active total = 5200 - 730 = 4470 kg. Since 4,470 is rendered in multiple areas
    // (donut center, cards), we assert that the text matches are found.
    expect(screen.getAllByText("4,470").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("-2.0")).toBeInTheDocument();

    // Verify accessibility
    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays different eco statuses according to active totals", () => {
    // BENCHMARKS: targetSustainable=2000, globalAverage=5000, nationalAverage=15000
    const { rerender } = render(
      <VisualSummary baseFootprint={{ transport: 0, energy: 0, diet: 0, waste: 0, total: 16000 }} dailySavings={0} />
    );
    expect(screen.getByText("High Footprint 🚨")).toBeInTheDocument();

    rerender(
      <VisualSummary baseFootprint={{ transport: 0, energy: 0, diet: 0, waste: 0, total: 8000 }} dailySavings={0} />
    );
    expect(screen.getByText("Moderate Footprint ⚠️")).toBeInTheDocument();

    rerender(
      <VisualSummary baseFootprint={{ transport: 0, energy: 0, diet: 0, waste: 0, total: 3000 }} dailySavings={0} />
    );
    expect(screen.getByText("Good Progress 🌱")).toBeInTheDocument();

    rerender(
      <VisualSummary baseFootprint={{ transport: 0, energy: 0, diet: 0, waste: 0, total: 1500 }} dailySavings={0} />
    );
    expect(screen.getByText("Climate Hero 🌟")).toBeInTheDocument();
  });
});
