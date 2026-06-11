'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { MapPin, Search } from 'lucide-react'
import { DateRangePicker, type DateRange } from '@/components/booking/DateRangePicker'

interface HeroBookingSearchProps {
  locations: string[]
}

export function HeroBookingSearch({ locations }: HeroBookingSearchProps) {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
  const [error, setError] = useState<string | null>(null)

  const handleSearch = () => {
    setError(null)

    if (!dateRange.start || !dateRange.end) {
      setError('Please select check-in and check-out dates')
      return
    }

    const params = new URLSearchParams()
    if (location.trim()) {
      params.set('q', location.trim())
    }
    params.set('checkIn', format(dateRange.start, 'yyyy-MM-dd'))
    params.set('checkOut', format(dateRange.end, 'yyyy-MM-dd'))
    router.push(`/tours?${params.toString()}`)
  }

  return (
    <div className="relative z-20 mt-10">
      <div className="overflow-visible rounded-2xl bg-white p-2 shadow-2xl shadow-black/20 sm:p-3">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col border-b border-slate-200 px-4 py-3 sm:flex-row sm:border-b-0 sm:border-r lg:py-4">
            <div className="flex-1 border-b border-slate-100 py-3 sm:border-b-0 sm:border-r sm:px-4 sm:py-0">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Location
              </label>
              <input
                type="text"
                list="tour-locations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you going?"
                className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <datalist id="tour-locations">
                {locations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            <div className="flex-1 px-0 py-3 sm:px-4 sm:py-0">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Check in – Check out
              </label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                mode="range"
                placeholder="Select your travel dates"
                className="mt-1"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-4 text-sm font-bold text-slate-900 transition hover:bg-amber-300 lg:mt-0 lg:min-w-[140px]"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white">{error}</p>
      )}
    </div>
  )
}
