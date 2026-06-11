import { describe, expect, it, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import AICoach from "./AICoach";
import { DEFAULT_INPUTS } from "../../utils/carbonCalculator";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("AICoach", () => {
  it("renders with initial tips when no feedback is provided", async () => {
    const { container } = render(<AICoach inputs={DEFAULT_INPUTS} feedback={null} />);

    // Verify coach header is visible
    expect(screen.getByText("AI Sustainability Coach")).toBeInTheDocument();

    // Verify standard welcome text and initial tips
    expect(screen.getByText(/lifestyle adjustments/i)).toBeInTheDocument();

    // Verify accessibility
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders custom feedback recommendations when feedback is provided", () => {
    const mockFeedback = {
      summary: "Excellent results!",
      recommendations: [
        { category: "transport", action: "Drive an electric car", estimated_annual_savings_kg: 500 },
        { category: "diet", action: "Try a vegan diet", estimated_annual_savings_kg: 300 }
      ],
      source: "gemini" as const
    };

    render(<AICoach inputs={DEFAULT_INPUTS} feedback={mockFeedback} />);

    // Verify Gemini source text and nested recommendation texts using regex matchers
    expect(screen.getByText(/GCP Vertex AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Excellent results!/i)).toBeInTheDocument();
    expect(screen.getByText(/DRIVE AN ELECTRIC CAR/i)).toBeInTheDocument();
  });

  it("sends a query and displays the typed message and coach response", async () => {
    vi.useFakeTimers();
    render(<AICoach inputs={DEFAULT_INPUTS} feedback={null} />);

    const input = screen.getByPlaceholderText("Ask about carbon offsets...");
    const sendBtn = screen.getByLabelText("Send Message");

    // Type query using fireEvent (synchronous, compatible with fake timers)
    fireEvent.change(input, { target: { value: "Tell me about electric cars" } });
    fireEvent.click(sendBtn);

    // Verify user message displays
    expect(screen.getByText("Tell me about electric cars")).toBeInTheDocument();

    // Fast-forward timer by 950ms to trigger response
    await act(async () => {
      vi.advanceTimersByTime(950);
    });

    // Verify coach response displays
    expect(screen.getByText(/Transport Emission Breakdown/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("sends query when suggestion quick chip is clicked", async () => {
    vi.useFakeTimers();
    render(<AICoach inputs={DEFAULT_INPUTS} feedback={null} />);

    const chip = screen.getByRole("button", { name: "Compare transport" });
    fireEvent.click(chip);

    // Verify chip query was sent
    expect(screen.getByText("How does petrol vs electric vs bus compare?")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(950);
    });

    expect(screen.getByText(/Transport Emission Breakdown/i)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
