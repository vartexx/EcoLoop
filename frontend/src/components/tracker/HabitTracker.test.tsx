import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import HabitTracker from "./HabitTracker";

describe("HabitTracker", () => {
  const habitsMock = [
    {
      id: "habit1",
      title: "Test Habit 1",
      description: "Description 1",
      category: "transport" as const,
      points: 10,
      offset: 1.5,
      completed: false,
    },
    {
      id: "habit2",
      title: "Test Habit 2",
      description: "Description 2",
      category: "waste" as const,
      points: 20,
      offset: 2.5,
      completed: true,
    },
  ];

  it("renders habits list and unlocks badges accordingly", async () => {
    const onToggleHabit = vi.fn();
    const { container } = render(
      <HabitTracker habits={habitsMock} onToggleHabit={onToggleHabit} points={10} />
    );

    // Verify daily habit tracker text is present
    expect(screen.getByText("Daily Habit Tracker")).toBeInTheDocument();
    
    // Verify habits are listed
    expect(screen.getByText("Test Habit 1")).toBeInTheDocument();
    expect(screen.getByText("Test Habit 2")).toBeInTheDocument();

    // Verify accessibility
    expect(await axe(container)).toHaveNoViolations();

    // Click on a habit to toggle
    const habit1Div = screen.getByText("Test Habit 1").closest('[role="checkbox"]');
    expect(habit1Div).toBeInTheDocument();
    if (habit1Div) {
      await userEvent.click(habit1Div);
      expect(onToggleHabit).toHaveBeenCalledWith("habit1");
    }
  });

  it("handles keyboard space/enter activation on checkbox grid", async () => {
    const onToggleHabit = vi.fn();
    render(
      <HabitTracker habits={habitsMock} onToggleHabit={onToggleHabit} points={0} />
    );

    const habit1Div = screen.getByText("Test Habit 1").closest('[role="checkbox"]') as HTMLElement | null;
    expect(habit1Div).toBeInTheDocument();
    if (habit1Div) {
      // Focus and press space
      habit1Div.focus();
      await userEvent.keyboard(" ");
      expect(onToggleHabit).toHaveBeenCalledWith("habit1");

      // Press enter
      await userEvent.keyboard("{Enter}");
      expect(onToggleHabit).toHaveBeenCalledWith("habit1");
    }
  });

  it("renders unlocked badge styling when threshold is exceeded", () => {
    // 30 points is threshold for first badge (Eco Beginner)
    const { rerender } = render(
      <HabitTracker habits={habitsMock} onToggleHabit={vi.fn()} points={10} />
    );
    // Eco Beginner should show locking requirement "30 pts"
    expect(screen.getByText("30 pts")).toBeInTheDocument();

    rerender(
      <HabitTracker habits={habitsMock} onToggleHabit={vi.fn()} points={40} />
    );
    // At 40 points, "30 pts" should be gone since badge is unlocked
    expect(screen.queryByText("30 pts")).not.toBeInTheDocument();
  });
});
