// Vitest setup: register jest-dom and vitest-axe (accessibility) matchers.
import "@testing-library/jest-dom/vitest";
import * as axeMatchers from "vitest-axe/matchers";
import { expect, vi } from "vitest";

expect.extend(axeMatchers);

// Mock scrollIntoView since jsdom does not implement it
window.HTMLElement.prototype.scrollIntoView = vi.fn();
