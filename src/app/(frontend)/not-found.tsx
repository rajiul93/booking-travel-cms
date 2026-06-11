import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <p className="text-6xl font-bold text-sky-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700"
      >
        Back to Home
      </Link>
    </div>
  )
}
