// Typed client for the backend API. Same-origin in production; proxied in dev.

import type {
  FootprintProfile,
  TimelineSnapshot,
  AnalysisReport,
  CoachFeedback,
} from "./types";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export function evaluateProfile(input: FootprintProfile): Promise<AnalysisReport> {
  return postJson<AnalysisReport>("/api/footprint/evaluate", input);
}

export function fetchCoachFeedback(input: FootprintProfile): Promise<CoachFeedback> {
  return postJson<CoachFeedback>("/api/coach/advise", input);
}

export function uploadSnapshot(
  deviceId: string,
  input: FootprintProfile,
  result: AnalysisReport,
): Promise<TimelineSnapshot> {
  return postJson<TimelineSnapshot>("/api/history/snapshots", {
    device_id: deviceId,
    input,
    result,
  });
}

export async function loadSnapshots(deviceId: string): Promise<TimelineSnapshot[]> {
  const res = await fetch(`/api/history/snapshots/${encodeURIComponent(deviceId)}`);
  if (!res.ok) {
    throw new Error(`Failed to load history (${res.status})`);
  }
  return (await res.json()) as TimelineSnapshot[];
}
