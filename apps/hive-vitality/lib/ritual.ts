import type { ComponentSlug, RitualBlueprint, RitualComponent } from "@/types/vitality";

// Canonical ritual component definitions. Order is the order shown in the
// guided ritual — never reshuffle without a CHANGELOG entry; the muscle
// memory of the practice depends on the sequence being identical day to
// day. The mantra is "Balance after One, Squat and Hinge after Three".

const COMPONENTS: RitualComponent[] = [
  {
    slug: "tibetan_1",
    title: "Tibetan Rite One — spinning",
    baseValue: 3,
    unit: "reps",
    progresses: true,
    coach: "Stand. Arms wide. Spin clockwise. Eyes soft on a fixed point as you turn.",
  },
  {
    slug: "balance_left",
    title: "Single-leg balance — left, eyes open",
    baseValue: 5,
    unit: "seconds",
    progresses: false,
    coach: "Right foot up. Five counts eyes open. Then five counts eyes closed.",
  },
  {
    slug: "balance_right",
    title: "Single-leg balance — right, eyes open",
    baseValue: 5,
    unit: "seconds",
    progresses: false,
    coach: "Left foot up. Five counts eyes open. Then five counts eyes closed.",
  },
  {
    slug: "tibetan_2",
    title: "Tibetan Rite Two — leg raises",
    baseValue: 3,
    unit: "reps",
    progresses: true,
    coach: "On your back. Head and legs lift together as you exhale.",
  },
  {
    slug: "tibetan_3",
    title: "Tibetan Rite Three — kneeling backbend",
    baseValue: 3,
    unit: "reps",
    progresses: true,
    coach: "Kneel. Hands on the back of your thighs. Open your chest as you arch.",
  },
  {
    slug: "squat_hold",
    title: "Deep squat hold",
    baseValue: 25,
    unit: "seconds",
    progresses: false,
    coach: "Heels down. Knees wide. Hold the bottom for 20–30 seconds.",
  },
  {
    slug: "hip_hinge",
    title: "Hip hinge — slow",
    baseValue: 5,
    unit: "reps",
    progresses: false,
    coach: "Stand. Push hips back. Spine long. Five slow reps.",
  },
  {
    slug: "tibetan_4",
    title: "Tibetan Rite Four — table",
    baseValue: 3,
    unit: "reps",
    progresses: true,
    coach: "Sit. Hands behind. Press hips up to a table. Drop the head back.",
  },
  {
    slug: "bridges",
    title: "Bridge holds",
    baseValue: 21,
    unit: "reps",
    progresses: false,
    coach: "On your back, knees bent. Press hips up, hold one count, lower. Twenty-one.",
  },
  {
    slug: "figure_4_left",
    title: "Figure-4 stretch — left",
    baseValue: 30,
    unit: "seconds",
    progresses: false,
    coach: "Right ankle on left knee. Pull the left thigh in. Breathe.",
  },
  {
    slug: "figure_4_right",
    title: "Figure-4 stretch — right",
    baseValue: 30,
    unit: "seconds",
    progresses: false,
    coach: "Left ankle on right knee. Pull the right thigh in. Breathe.",
  },
  {
    slug: "plank",
    title: "Plank — 80 count",
    baseValue: 80,
    unit: "seconds",
    progresses: false,
    coach: "Forearms or hands. Body in a line. Eighty counts. Soft breath.",
  },
  {
    slug: "tibetan_5",
    title: "Tibetan Rite Five — flow",
    baseValue: 3,
    unit: "reps",
    progresses: true,
    coach: "Down dog to up dog and back. Move with the breath.",
  },
  {
    slug: "sumo_squats",
    title: "Sumo squats",
    baseValue: 21,
    unit: "reps",
    progresses: false,
    coach: "Wide stance, toes out. Sit straight down between the heels. Twenty-one.",
  },
];

export function ritualForWeek(currentWeek: number): RitualBlueprint {
  const week = Math.min(10, Math.max(1, currentWeek));
  const components = COMPONENTS.map((c) => ({
    ...c,
    baseValue: c.progresses ? progressedValue(c.baseValue, week) : c.baseValue,
  }));
  const totalSeconds = components.reduce(
    (acc, c) => acc + estimateSeconds(c),
    0,
  );
  return { components, totalSeconds };
}

/** Tibetan rep count ramps from 3 → 21 over 10 weeks. Linear: +2/week. */
export function progressedValue(base: number, week: number): number {
  if (base !== 3) return base;
  return Math.min(21, 3 + (week - 1) * 2);
}

function estimateSeconds(c: RitualComponent): number {
  if (c.unit === "seconds") return c.baseValue;
  // Each rep ≈ 4 seconds for Tibetans, 3 seconds for sumo squats / bridges /
  // hinges. Close enough for a 15-minute target.
  const perRep = c.slug.startsWith("tibetan") ? 4 : 3;
  return c.baseValue * perRep;
}

export function getComponent(slug: ComponentSlug): RitualComponent | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}

export const ALL_COMPONENT_SLUGS: ComponentSlug[] = COMPONENTS.map((c) => c.slug);
