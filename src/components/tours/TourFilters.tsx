'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'food-wine', label: 'Food & Wine' },
  { value: 'nature', label: 'Nature' },
  { value: 'city-tours', label: 'City Tours' },
  { value: 'day-trips', label: 'Day Trips' },
]

export function TourFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/tours?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search tours..."
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => updateParams('q', e.target.value)}
          className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>
      <select
        defaultValue={searchParams.get('category') ?? ''}
        onChange={(e) => updateParams('category', e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  )
}
