export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <section>
      <h1 className="text-3xl font-semibold text-amber-400">Person</h1>
      <p className="mt-2 text-zinc-400">Person ID: {id}</p>
    </section>
  )
}
