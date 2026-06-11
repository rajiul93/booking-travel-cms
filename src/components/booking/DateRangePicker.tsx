'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DateRange {
  start: Date | null
  end: Date | null
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  mode?: 'range' | 'single'
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

const POPOVER_WIDTH_RANGE = 580
const POPOVER_WIDTH_SINGLE = 300

function formatRangeLabel(range: DateRange, mode: 'range' | 'single'): string {
  if (!range.start) return ''

  if (mode === 'single') {
    return format(range.start, 'MMMM dd, yyyy')
  }

  if (!range.end) {
    return format(range.start, 'MMMM dd')
  }

  const sameYear = range.start.getFullYear() === range.end.getFullYear()
  const startFmt = format(range.start, 'MMMM dd')
  const endFmt = sameYear
    ? format(range.end, 'MMMM dd')
    : format(range.end, 'MMMM dd, yyyy')

  return `${startFmt} ~ ${endFmt}`
}

function MonthGrid({
  month,
  range,
  hoverDate,
  minDate,
  maxDate,
  mode,
  onSelect,
  onHover,
}: {
  month: Date
  range: DateRange
  hoverDate: Date | null
  minDate: Date
  maxDate?: Date
  mode: 'range' | 'single'
  onSelect: (date: Date) => void
  onHover: (date: Date | null) => void
}) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = monthStart.getDay()

  const previewEnd =
    mode === 'range' && range.start && !range.end && hoverDate ? hoverDate : range.end

  const isInRange = (day: Date) => {
    if (!range.start || !previewEnd) return false
    const start = isBefore(range.start, previewEnd) ? range.start : previewEnd
    const end = isAfter(range.start, previewEnd) ? range.start : previewEnd
    return (
      (isAfter(day, start) || isSameDay(day, start)) &&
      (isBefore(day, end) || isSameDay(day, end))
    )
  }

  const isRangeStart = (day: Date) =>
    range.start != null && isSameDay(day, range.start)

  const isRangeEnd = (day: Date) => {
    const end = previewEnd
    return end != null && isSameDay(day, end)
  }

  return (
    <div className="min-w-[240px]">
      <p className="mb-3 text-center text-sm font-semibold text-slate-800">
        {format(month, 'MMMM, yyyy')}
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-medium text-sky-600">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7">
        {Array.from({ length: startPad }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const disabled =
            isBefore(day, minDate) || (maxDate != null && isAfter(day, maxDate))
          const inRange = isInRange(day)
          const rangeStart = isRangeStart(day)
          const rangeEnd = isRangeEnd(day)
          const isEndpoint = rangeStart || rangeEnd

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              onMouseEnter={() => onHover(day)}
              onMouseLeave={() => onHover(null)}
              className={cn(
                'relative flex h-9 items-center justify-center text-sm transition',
                !isSameMonth(day, month) && 'text-slate-300',
                disabled && 'cursor-not-allowed text-slate-300',
                !disabled && !inRange && 'text-slate-700 hover:bg-sky-50',
                inRange && !isEndpoint && 'bg-sky-500 text-white',
                isEndpoint && 'z-10 bg-sky-600 font-semibold text-white',
                rangeStart && rangeEnd && 'rounded-md',
                rangeStart && !rangeEnd && 'rounded-l-md',
                rangeEnd && !rangeStart && 'rounded-r-md',
                rangeStart && rangeEnd && rangeStart !== rangeEnd && 'rounded-none',
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangePicker({
  value,
  onChange,
  mode = 'range',
  placeholder = 'Select dates',
  minDate = startOfDay(new Date()),
  maxDate,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })
  const [viewMonth, setViewMonth] = useState(startOfMonth(value.start ?? new Date()))
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const popoverWidth = mode === 'range' ? POPOVER_WIDTH_RANGE : POPOVER_WIDTH_SINGLE

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const viewportPadding = 16
    const centeredLeft = rect.left + rect.width / 2 - popoverWidth / 2
    const left = Math.min(
      Math.max(viewportPadding, centeredLeft),
      window.innerWidth - popoverWidth - viewportPadding,
    )

    setPopoverPos({
      top: rect.bottom + 12,
      left,
    })
  }, [popoverWidth])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    updatePosition()

    const handleReposition = () => updatePosition()
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = (day: Date) => {
    if (isBefore(day, minDate) || (maxDate != null && isAfter(day, maxDate))) return

    if (mode === 'single') {
      onChange({ start: day, end: day })
      setOpen(false)
      return
    }

    if (!value.start || (value.start && value.end)) {
      onChange({ start: day, end: null })
      return
    }

    if (isBefore(day, value.start)) {
      onChange({ start: day, end: value.start })
    } else {
      onChange({ start: value.start, end: day })
    }
    setOpen(false)
  }

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev
      if (next) {
        requestAnimationFrame(updatePosition)
      }
      return next
    })
  }

  const label = formatRangeLabel(value, mode)

  const popover =
    open && mounted
      ? createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-modal="true"
            aria-label="Date picker"
            style={{
              position: 'fixed',
              top: popoverPos.top,
              left: popoverPos.left,
              width: popoverWidth,
              zIndex: 9999,
            }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="shrink-0 rounded-full p-1.5 text-sky-600 hover:bg-sky-50"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 flex-1 flex-col gap-6 sm:flex-row sm:gap-8">
                <MonthGrid
                  month={viewMonth}
                  range={value}
                  hoverDate={hoverDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  mode={mode}
                  onSelect={handleSelect}
                  onHover={setHoverDate}
                />
                {mode === 'range' && (
                  <MonthGrid
                    month={addMonths(viewMonth, 1)}
                    range={value}
                    hoverDate={hoverDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    mode={mode}
                    onSelect={handleSelect}
                    onHover={setHoverDate}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="shrink-0 rounded-full p-1.5 text-sky-600 hover:bg-sky-50"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="w-full text-left text-sm text-slate-800 outline-none"
      >
        {label || <span className="text-slate-400">{placeholder}</span>}
      </button>

      {popover}
    </div>
  )
}
