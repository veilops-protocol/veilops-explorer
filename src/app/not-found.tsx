import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="page flex min-h-[70vh] flex-col justify-center pt-24">
      <div className="label">404 / not found</div>
      <h1 className="h-display mt-6 text-6xl sm:text-8xl">Nothing here.<br /><span className="text-mute">Not even ciphertext.</span></h1>
      <div className="mt-10"><Link href="/" className="btn-ghost">Return home →</Link></div>
    </section>
  );
}
