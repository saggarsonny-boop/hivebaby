export type Tier = "free" | "basic" | "pro" | "premium";

export type ComponentSlug =
  | "tibetan_1"
  | "balance_left"
  | "balance_right"
  | "tibetan_2"
  | "tibetan_3"
  | "squat_hold"
  | "hip_hinge"
  | "tibetan_4"
  | "bridges"
  | "figure_4_left"
  | "figure_4_right"
  | "plank"
  | "tibetan_5"
  | "sumo_squats";

export interface RitualComponent {
  slug: ComponentSlug;
  title: string;
  /** Seconds, OR rep count — see `unit`. */
  baseValue: number;
  /** "seconds" for holds; "reps" for counted movements. */
  unit: "seconds" | "reps";
  /** True iff this component progresses 3 → 21 over 10 weeks. False = static. */
  progresses: boolean;
  /** One-line plain-language coach instruction shown above the timer. */
  coach: string;
}

export interface RitualBlueprint {
  components: RitualComponent[];
  totalSeconds: number;
}

export interface SessionPayload {
  /** ISO date — YYYY-MM-DD. */
  ritualDate: string;
  durationSeconds: number;
  currentWeek: number;
  /** Slugs of components the user actually finished. */
  completedComponents: ComponentSlug[];
  reflectionText?: string;
  moodRating?: 1 | 2 | 3 | 4 | 5;
}

export interface UserState {
  id: number;
  clerkUserId: string;
  email: string | null;
  tier: Tier;
  currentWeek: number;
  streakCount: number;
  ritualCount: number;
}
