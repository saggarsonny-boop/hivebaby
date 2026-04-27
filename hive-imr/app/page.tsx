export default function Home() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">HiveIMR</p>
        <h1>Intelligent Medical Records.</h1>
        <p className="lede">
          The EMR was built for billing. The IMR is built for care. Role-aware,
          AI-native, patient-centred — a substrate for the next decade of
          clinical work.
        </p>
        <p className="status">
          Scaffold online. Core app lands in Phase 2.
        </p>
      </header>

      <section className="grid">
        <article className="card">
          <h2>For clinicians</h2>
          <p>Handoff notes, clinical summaries, discharge summaries, order justifications — drafted in your role&rsquo;s voice, signed by you.</p>
        </article>
        <article className="card">
          <h2>For institutions</h2>
          <p>One substrate. Eight roles. Auditable AI generations. No vendor lock-in. Free at the base tier, forever.</p>
        </article>
        <article className="card">
          <h2>For patients</h2>
          <p>Records that travel with you, not with the building.</p>
        </article>
      </section>
    </main>
  );
}
