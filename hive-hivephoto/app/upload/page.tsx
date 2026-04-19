import UploadZone from '@/components/upload/UploadZone'

export default function UploadPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-amber-400">Upload</h1>
      <p className="text-zinc-400">Direct-to-R2 upload. Browser computes SHA-256 before presign.</p>
      <UploadZone />
    </section>
  )
}
