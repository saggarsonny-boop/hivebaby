// Identity affirmation shown after the ritual completes. The wording is
// "I am someone who moves every day" — identity-first, not goal-first,
// because the engine's whole UX bet is on identity reinforcement over
// progress tracking.

export default function IdentityImprint() {
  return (
    <p className="identity-imprint" role="note">
      I am someone who moves every day.
      <span className="identity-imprint__aside">Not a workout. A practice.</span>
    </p>
  );
}
