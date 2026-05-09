// Week-progression engine. Tracks how far the user has ramped from 3 → 21
// reps. Source of truth is the user's current_week column; this module
// derives the per-component rep count given that week.

import { ritualForWeek } from "./ritual";

/** Convert a streak count into a notional "current week" — the engine
 *  defers to the persisted current_week column; this is only used as a
 *  bootstrap for first-session users with no week persisted yet. */
export function bootstrapWeekFromStreak(streakCount: number): number {
  if (streakCount < 7) return 1;
  return Math.min(10, Math.floor(streakCount / 7) + 1);
}

/** True iff the user has completed enough days at this week to advance. */
export function shouldAdvance(currentWeek: number, daysAtThisWeek: number): boolean {
  if (currentWeek >= 10) return false;
  // Advance after 7 days at the current week (one-week dwell time).
  return daysAtThisWeek >= 7;
}

export function nextWeek(currentWeek: number): number {
  return Math.min(10, currentWeek + 1);
}

export function previewWeek(week: number) {
  const blueprint = ritualForWeek(week);
  return {
    week,
    totalSeconds: blueprint.totalSeconds,
    perComponent: blueprint.components.map((c) => ({
      slug: c.slug,
      title: c.title,
      value: c.baseValue,
      unit: c.unit,
    })),
  };
}
