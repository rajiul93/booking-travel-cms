'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { DateRangePicker, type DateRange } from '@/components/booking/DateRangePicker'
import type { HomepageDestination } from '@/lib/cms/queries'
import { cn } from '@/lib/utils'

interface HeroBookingSearchProps {
  destinations: HomepageDestination[]
  className?: string
}

export function HeroBookingSearch({ destinations, className }: HeroBookingSearchProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<HomepageDestination | null>(null)
  const [locationOpen, setLocationOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const locationRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!locationOpen) return

    updateDropdownPosition()

    const handleReposition = () => updateDropdownPosition()
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [locationOpen, updateDropdownPosition])

  useEffect(() => {
    if (!locationOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        locationRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }
      setLocationOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [locationOpen])

  const handleSearch = () => {
    setError(null)

    if (!selected) {
      setError('Please select a destination')
      return
    }

    if (!dateRange.start || !dateRange.end) {
      setError('Please select check-in and check-out dates')
      return
    }

    const params = new URLSearchParams()
    params.set('country', selected.countryCode)
    if (selected.searchQuery && selected.searchQuery !== selected.name) {
      params.set('q', selected.searchQuery)
    }
    params.set('checkIn', format(dateRange.start, 'yyyy-MM-dd'))
    params.set('checkOut', format(dateRange.end, 'yyyy-MM-dd'))
    router.push(`/tours?${params.toString()}`)
  }

  const toggleLocation = () => {
    setLocationOpen((open) => {
      const next = !open
      if (next) {
        requestAnimationFrame(updateDropdownPosition)
      }
      return next
    })
  }

  const locationDropdown =
    locationOpen && mounted
      ? createPortal(
          <ul
            ref={dropdownRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 10000,
            }}
            className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          >
            {destinations.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                Add countries in Admin → Countries
              </li>
            ) : (
              destinations.map((destination) => (
                <li key={`${destination.countryCode}-${destination.name}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected?.name === destination.name}
                    onClick={() => {
                      setSelected(destination)
                      setLocationOpen(false)
                      setError(null)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-sky-50',
                      selected?.name === destination.name && 'bg-sky-50 text-sky-800',
                    )}
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      {destination.flag}
                    </span>
                    <span className="font-medium text-slate-800">{destination.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>,
          document.body,
        )
      : null

  return (
    <div className={cn('relative z-30 w-full', className)}>
      <div className="overflow-visible rounded-2xl border border-white/20 bg-white p-2 shadow-2xl shadow-black/30 sm:p-3">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col overflow-visible border-b border-slate-200 px-4 py-3 sm:flex-row sm:border-b-0 sm:border-r lg:py-4">
            <div
              ref={locationRef}
              className={cn(
                'relative flex-1 border-b border-slate-100 py-3 sm:border-b-0 sm:border-r sm:px-4 sm:py-0',
                locationOpen && 'z-50',
              )}
            >
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Location
              </label>

              <button
                ref={triggerRef}
                type="button"
                onClick={toggleLocation}
                className="mt-1 flex w-full items-center justify-between gap-2 text-left text-sm outline-none"
                aria-expanded={locationOpen}
                aria-haspopup="listbox"
              >
                {selected ? (
                  <span className="flex items-center gap-2 text-slate-800">
                    <span className="text-xl leading-none" aria-hidden>
                      {selected.flag}
                    </span>
                    <span className="font-medium">{selected.name}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Where are you going?</span>
                )}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-slate-400 transition',
                    locationOpen && 'rotate-180',
                  )}
                />
              </button>
            </div>

            <div className="relative z-0 min-w-0 flex-1 px-0 py-3 sm:px-4 sm:py-0">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Check in – Check out
              </label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                mode="range"
                placeholder="Select dates"
                className="mt-1 min-w-0"
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

      {locationDropdown}
    </div>
  )
}
