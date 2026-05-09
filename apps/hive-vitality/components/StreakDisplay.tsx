interface Props {
  streakCount: number;
}

export default function StreakDisplay({ streakCount }: Props) {
  const label = streakCount === 1 ? "day" : "days";
  return (
    <div className="streak-display" aria-label={`Streak: ${streakCount} ${label}`}>
      <span className="streak-display__count">{streakCount}</span>
      <span className="streak-display__label">{label}</span>
    </div>
  );
}
