import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TourCardProps {
  slug: string
  title: string
  shortDescription: string
  location: string
  duration: string
  rating?: number | null
  reviewCount?: number | null
  coverImageUrl?: string | null
  priceFrom?: number | null
  checkIn?: string
  checkOut?: string
}

export function TourCard({
  slug,
  title,
  shortDescription,
  location,
  duration,
  rating,
  reviewCount,
  coverImageUrl,
  priceFrom,
  checkIn,
  checkOut,
}: TourCardProps) {
  const hrefParams = new URLSearchParams()
  if (checkIn) hrefParams.set('checkIn', checkIn)
  if (checkOut) hrefParams.set('checkOut', checkOut)
  const query = hrefParams.toString()

  return (
    <Link
      href={query ? `/tours/${slug}?${query}` : `/tours/${slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No image
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-sky-600">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{shortDescription}</p>
        <div className="mt-4 flex items-center justify-between">
          {rating != null && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              {reviewCount != null && (
                <span className="text-slate-400">({reviewCount})</span>
              )}
            </div>
          )}
          {priceFrom != null && (
            <span className="text-sm font-semibold text-sky-600">
              From {formatCurrency(priceFrom)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
