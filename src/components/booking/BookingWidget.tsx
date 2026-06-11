'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseISO, startOfDay } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { DateRangePicker, type DateRange } from '@/components/booking/DateRangePicker'
import { Minus, Plus, Calendar, Clock, Loader2 } from 'lucide-react'

interface BokunAvailabilitySlot {
  id: string
  localizedDate: string
  startTime?: string
  startTimeId?: number
  defaultRateId: number
  availabilityCount: number
  pricesByRate: Array<{
    activityRateId: number
    pricePerCategoryUnit: Array<{
      id: number
      ticketCategory: string
      price: { amount: number; currency: string }
    }>
  }>
}

interface PricingData {
  adultPrice: number
  childPrice: number
  totalAmount: number
  currency: string
  adultPricingCategoryId: number
  childPricingCategoryId?: number
  startTimeId?: number
}

interface BookingWidgetProps {
  tourId: number
  bokunActivityId: number
  tourTitle: string
  initialCheckIn?: string
  initialCheckOut?: string
}

function parseDateParam(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function BookingWidget({
  tourId,
  bokunActivityId,
  tourTitle,
  initialCheckIn,
  initialCheckOut,
}: BookingWidgetProps) {
  const initialDate = parseDateParam(initialCheckIn)
  const [dateRange, setDateRange] = useState<DateRange>({
    start: initialDate,
    end: initialDate,
  })
  const selectedDate = dateRange.start
    ? dateRange.start.toISOString().split('T')[0]
    : ''
  const [slots, setSlots] = useState<BokunAvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<BokunAvailabilitySlot | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [pricing, setPricing] = useState<PricingData | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingPricing, setLoadingPricing] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true)
    setError(null)
    setSelectedSlot(null)
    setPricing(null)

    try {
      const params = new URLSearchParams({
        activityId: String(bokunActivityId),
        start: date,
        end: date,
      })
      const res = await fetch(`/api/booking/availability?${params}`)
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.error ?? 'Failed to load availability')
      }

      setSlots(json.data.availabilities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability')
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [bokunActivityId])

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate)
    }
  }, [selectedDate, fetchSlots])

  useEffect(() => {
    if (!selectedSlot || !selectedDate) {
      setPricing(null)
      return
    }

    const fetchPricing = async () => {
      setLoadingPricing(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          activityId: String(bokunActivityId),
          date: selectedDate,
          availabilityId: selectedSlot.id,
          rateId: String(selectedSlot.defaultRateId),
          adults: String(adults),
          children: String(children),
        })
        const res = await fetch(`/api/booking/pricing?${params}`)
        const json = await res.json()

        if (!json.success) {
          throw new Error(json.error ?? 'Failed to load pricing')
        }

        setPricing(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pricing')
        setPricing(null)
      } finally {
        setLoadingPricing(false)
      }
    }

    fetchPricing()
  }, [selectedSlot, selectedDate, adults, children, bokunActivityId])

  const handleCheckout = async () => {
    if (!selectedSlot || !pricing || !selectedDate) return

    if (!customer.firstName || !customer.lastName || !customer.email) {
      setError('Please fill in all required customer details')
      return
    }

    setLoadingCheckout(true)
    setError(null)

    try {
      const reserveRes = await fetch('/api/booking/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          availabilityId: selectedSlot.id,
          rateId: selectedSlot.defaultRateId,
          startTimeId: pricing.startTimeId ?? selectedSlot.startTimeId,
          tourDate: selectedDate,
          tourTime: selectedSlot.startTime ?? 'Flexible',
          adults,
          children,
          adultPricingCategoryId: pricing.adultPricingCategoryId,
          childPricingCategoryId: pricing.childPricingCategoryId,
          adultPrice: pricing.adultPrice,
          childPrice: pricing.childPrice,
          totalAmount: pricing.totalAmount,
          currency: pricing.currency,
          customer,
        }),
      })

      const reserveJson = await reserveRes.json()
      if (!reserveJson.success) {
        throw new Error(reserveJson.error ?? 'Reservation failed')
      }

      const checkoutRes = await fetch('/api/booking/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: reserveJson.data.bookingId }),
      })

      const checkoutJson = await checkoutRes.json()
      if (!checkoutJson.success) {
        throw new Error(checkoutJson.error ?? 'Checkout failed')
      }

      window.location.href = checkoutJson.data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setLoadingCheckout(false)
    }
  }

  const travelStart = useMemo(() => parseDateParam(initialCheckIn), [initialCheckIn])
  const maxDate = useMemo(() => parseDateParam(initialCheckOut), [initialCheckOut])
  const minDate = useMemo(() => {
    const today = startOfDay(new Date())
    if (travelStart && travelStart > today) return travelStart
    return today
  }, [travelStart])

  const handleDateChange = (range: DateRange) => {
    if (!range.start) {
      setDateRange({ start: null, end: null })
      return
    }

    if (maxDate && range.start > maxDate) {
      setDateRange({ start: maxDate, end: maxDate })
      return
    }

    setDateRange({ start: range.start, end: range.start })
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
      <h2 className="text-lg font-bold text-slate-900">Book {tourTitle}</h2>
      <p className="mt-1 text-sm text-slate-500">Live availability · Secure checkout</p>
      {initialCheckIn && initialCheckOut && (
        <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
          Travel window: {initialCheckIn} to {initialCheckOut}
        </p>
      )}

      <div className="mt-6 space-y-5">
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Calendar className="h-4 w-4" />
            Select Date
          </label>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateChange}
            mode="single"
            minDate={minDate}
            maxDate={maxDate ?? undefined}
            placeholder="Pick a booking date"
            className="mt-2"
          />
        </div>

        {loadingSlots && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading time slots...
          </div>
        )}

        {selectedDate && !loadingSlots && slots.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Clock className="h-4 w-4" />
              Time Slot
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    selectedSlot?.id === slot.id
                      ? 'border-sky-600 bg-sky-50 text-sky-700'
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {slot.startTime ?? 'Flexible'}
                  <span className="block text-xs text-slate-500">
                    {slot.availabilityCount} left
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && !loadingSlots && slots.length === 0 && (
          <p className="text-sm text-amber-600">No availability for this date.</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Adults</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="rounded-full border border-slate-300 p-1 hover:bg-slate-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults(Math.min(20, adults + 1))}
                className="rounded-full border border-slate-300 p-1 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Children</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="rounded-full border border-slate-300 p-1 hover:bg-slate-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{children}</span>
              <button
                type="button"
                onClick={() => setChildren(Math.min(20, children + 1))}
                className="rounded-full border border-slate-300 p-1 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {loadingPricing && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating price...
          </div>
        )}

        {pricing && !loadingPricing && (
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span>Adults × {adults}</span>
              <span>{formatCurrency(pricing.adultPrice * adults, pricing.currency)}</span>
            </div>
            {children > 0 && (
              <div className="mt-1 flex justify-between">
                <span>Children × {children}</span>
                <span>{formatCurrency(pricing.childPrice * children, pricing.currency)}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-sky-600">
                {formatCurrency(pricing.totalAmount, pricing.currency)}
              </span>
            </div>
          </div>
        )}

        {pricing && (
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <input
              type="text"
              placeholder="First name *"
              value={customer.firstName}
              onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Last name *"
              value={customer.lastName}
              onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email *"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!pricing || loadingCheckout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingCheckout && <Loader2 className="h-4 w-4 animate-spin" />}
          {loadingCheckout ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  )
}
