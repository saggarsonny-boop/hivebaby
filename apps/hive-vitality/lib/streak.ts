// Streak math with one-day forgiveness. Missing a single day does not
// break the streak; missing two consecutive days resets to 0. Adherence
// is reported separately as a percentage of the trailing 30 days.

export interface StreakInputs {
  /** Sorted ASC list of YYYY-MM-DD ritual dates. */
  ritualDates: string[];
  /** Today's date as YYYY-MM-DD. */
  today: string;
}

export interface StreakResult {
  streakCount: number;
  /** True iff the user is "on streak" today (did the ritual today OR yesterday). */
  active: boolean;
  /** Percent of the last 30 days the user did the ritual. */
  adherence30Day: number;
}

function dateOnly(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function diffDays(a: string, b: string): number {
  return Math.round(
    (dateOnly(a).getTime() - dateOnly(b).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function computeStreak({ ritualDates, today }: StreakInputs): StreakResult {
  if (ritualDates.length === 0) {
    return { streakCount: 0, active: false, adherence30Day: 0 };
  }

  const sorted = [...new Set(ritualDates)].sort();
  const last = sorted[sorted.length - 1];
  const daysSinceLast = diffDays(today, last);

  // Active if last ritual was today or yesterday. Two-day gap breaks.
  const active = daysSinceLast <= 1;
  if (daysSinceLast > 1) {
    return {
      streakCount: 0,
      active: false,
      adherence30Day: adherence(sorted, today),
    };
  }

  // Walk backwards counting consecutive days, allowing ONE skip.
  let streak = 1;
  let cursor = last;
  let skipsUsed = 0;

  for (let i = sorted.length - 2; i >= 0; i--) {
    const gap = diffDays(cursor, sorted[i]);
    if (gap === 1) {
      streak++;
      cursor = sorted[i];
    } else if (gap === 2 && skipsUsed === 0) {
      // One-day forgiveness — count it AND advance the cursor by 2.
      streak++;
      skipsUsed++;
      cursor = sorted[i];
    } else {
      break;
    }
  }

  return {
    streakCount: streak,
    active,
    adherence30Day: adherence(sorted, today),
  };
}

function adherence(sorted: string[], today: string): number {
  let hits = 0;
  for (const d of sorted) {
    if (diffDays(today, d) <= 30 && diffDays(today, d) >= 0) hits++;
  }
  return Math.round((hits / 30) * 100);
}

export function milestoneFor(streakCount: number): "30day" | "90day" | "1year" | null {
  if (streakCount >= 365) return "1year";
  if (streakCount >= 90) return "90day";
  if (streakCount >= 30) return "30day";
  return null;
}
