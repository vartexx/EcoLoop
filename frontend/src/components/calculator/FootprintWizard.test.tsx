import { describe, expect, it, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import FootprintWizard from "./FootprintWizard";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("FootprintWizard", () => {
  it("renders the introduction step and passes accessibility check", async () => {
    const onComplete = vi.fn();
    const { container } = render(<FootprintWizard onComplete={onComplete} />);
    
    // Check title
    expect(screen.getByText("Welcome to EcoLoop")).toBeInTheDocument();
    
    // Check accessibility
    expect(await axe(container)).toHaveNoViolations();
  });

  it("navigates through the wizard steps and submits form", async () => {
    const onComplete = vi.fn();
    render(<FootprintWizard onComplete={onComplete} />);

    // Step 1: Intro -> Click Next Step
    fireEvent.click(screen.getByRole("button", { name: /next step/i }));

    // Step 2: Transit Habits
    expect(screen.getByText("Road Mileage (km per year)")).toBeInTheDocument();

    // Input negative value and wait for state updates to flush
    const petrolInput = screen.getByLabelText("Petrol/Diesel Car");
    
    await act(async () => {
      fireEvent.change(petrolInput, { target: { value: "-50" } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    });
    
    expect(screen.getByText("Distance cannot be negative")).toBeInTheDocument();

    // Fix the error
    await act(async () => {
      fireEvent.change(petrolInput, { target: { value: "1000" } });
    });

    // Click next
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    });

    // Step 3: Household Energy
    expect(screen.getByText("Electricity")).toBeInTheDocument();
    const electricityInput = screen.getByLabelText("Average Monthly Usage (kWh)");
    
    await act(async () => {
      fireEvent.change(electricityInput, { target: { value: "300" } });
    });

    // Select solar checkbox
    const solarCheckbox = screen.getByLabelText(/we use solar panels/i);
    await act(async () => {
      fireEvent.click(solarCheckbox);
    });

    // Select natural gas heating and monthly heat usage
    const heatingSourceSelect = screen.getByLabelText("Heating Source");
    await act(async () => {
      fireEvent.change(heatingSourceSelect, { target: { value: "gas" } });
    });
    
    const heatingInput = screen.getByLabelText("Average Monthly heating (kWh)");
    await act(async () => {
      fireEvent.change(heatingInput, { target: { value: "150" } });
    });

    // Click next
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    });

    // Step 4: Diet & Lifestyle
    expect(screen.getByText("Diet Style")).toBeInTheDocument();
    
    // Select vegan diet
    const veganRadio = screen.getByLabelText(/vegan/i);
    await act(async () => {
      fireEvent.click(veganRadio);
    });

    // Toggle recycling checkbox
    const recycleCheckbox = screen.getByLabelText(/actively sort and recycle/i) as HTMLInputElement;
    if (!recycleCheckbox.checked) {
      await act(async () => {
        fireEvent.click(recycleCheckbox);
      });
    }

    // Toggle food waste level button (e.g. Minimal)
    const lowWasteBtn = screen.getByRole("button", { name: /minimal/i });
    await act(async () => {
      fireEvent.click(lowWasteBtn);
    });

    // Submit
    const submitBtn = screen.getByRole("button", { name: /calculate footprint/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        petrolCarKm: 1000,
        electricityKwh: 300,
        hasSolar: true,
        heatingSource: "gas",
        heatingKwh: 150,
        dietType: "vegan",
        recycles: true,
        foodWaste: "low",
      })
    );
  });

  it("can navigate backwards with Back button", async () => {
    const onComplete = vi.fn();
    render(<FootprintWizard onComplete={onComplete} />);

    // Next
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    });
    expect(screen.getByText("Road Mileage (km per year)")).toBeInTheDocument();

    // Back
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /back/i }));
    });
    expect(screen.getByText("Welcome to EcoLoop")).toBeInTheDocument();
  });
});
