'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HeroSlide {
  id: string
  imageUrl: string
  alt: string
}

interface HeroImageSliderProps {
  slides: HeroSlide[]
  autoplay?: boolean
  interval?: number
}

export function HeroImageSlider({
  slides,
  autoplay = true,
  interval = 5,
}: HeroImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const slideCount = slides.length
  const canNavigate = slideCount > 1
  const shouldAutoplay = autoplay && canNavigate && !reduceMotion && !isPaused
  const safeInterval = Math.min(15, Math.max(3, interval))

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (activeIndex >= slideCount) {
      setActiveIndex(0)
    }
  }, [activeIndex, slideCount])

  const goTo = useCallback(
    (index: number) => {
      if (!canNavigate) return
      const next = (index + slideCount) % slideCount
      setActiveIndex(next)
    },
    [canNavigate, slideCount],
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (!shouldAutoplay) return
    const timer = window.setInterval(goNext, safeInterval * 1000)
    return () => window.clearInterval(timer)
  }, [shouldAutoplay, safeInterval, goNext])

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = event.changedTouches[0]?.clientX - touchStartX.current
    touchStartX.current = null
    if (delta === undefined || Math.abs(delta) < 48) return
    if (delta < 0) goNext()
    else goPrev()
  }

  if (slideCount === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-slate-800 to-slate-900" />
    )
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Homepage hero images"
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex
        return (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              isActive ? 'z-10 opacity-100' : 'z-0 opacity-0',
            )}
            aria-hidden={!isActive}
          >
            <div
              className={cn(
                'relative h-full w-full',
                isActive && !reduceMotion && 'animate-hero-ken-burns',
              )}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        )
      })}

      {canNavigate && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="pointer-events-auto absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 sm:left-5 sm:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="pointer-events-auto absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 sm:right-5 sm:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="pointer-events-auto absolute right-4 top-24 flex gap-2 sm:right-6 sm:top-28">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 rounded-full shadow-sm transition-all',
                  index === activeIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/60 hover:bg-white/90',
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
