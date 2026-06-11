import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/metadata'
import { Mail, MapPin, Phone } from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Get in touch with Dream Tourism for tour inquiries and support.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">Contact Us</h1>
      <p className="mt-4 text-lg text-slate-600">
        Have questions about a tour or need help with your booking? We&apos;re here to help.
      </p>

      <div className="mt-10 space-y-6">
        <div className="flex items-start gap-4">
          <Mail className="mt-1 h-5 w-5 text-sky-600" />
          <div>
            <p className="font-semibold text-slate-900">Email</p>
            <a href="mailto:info@dreamtourism.it" className="text-sky-600 hover:underline">
              info@dreamtourism.it
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Phone className="mt-1 h-5 w-5 text-sky-600" />
          <div>
            <p className="font-semibold text-slate-900">Phone</p>
            <p className="text-slate-600">+39 000 000 0000</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <MapPin className="mt-1 h-5 w-5 text-sky-600" />
          <div>
            <p className="font-semibold text-slate-900">Location</p>
            <p className="text-slate-600">Italy</p>
          </div>
        </div>
      </div>

      <form className="mt-12 space-y-4" action="mailto:info@dreamtourism.it" method="post" encType="text/plain">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none"
        />
        <textarea
          name="message"
          placeholder="Your message"
          rows={5}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}
