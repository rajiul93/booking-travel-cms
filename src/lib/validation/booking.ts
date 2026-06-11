import { z } from 'zod'

export const availabilityQuerySchema = z.object({
  activityId: z.coerce.number().int().positive(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
})

export const pricingQuerySchema = z.object({
  activityId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  availabilityId: z.string().min(1),
  rateId: z.coerce.number().int().positive(),
  adults: z.coerce.number().int().min(1).max(50),
  children: z.coerce.number().int().min(0).max(50).default(0),
})

export const reserveBookingSchema = z.object({
  tourId: z.coerce.number().int().positive(),
  availabilityId: z.string().min(1),
  rateId: z.number().int().positive(),
  startTimeId: z.number().int().positive().optional(),
  tourDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tourTime: z.string().min(1),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(50).default(0),
  adultPricingCategoryId: z.number().int().positive(),
  childPricingCategoryId: z.number().int().positive().optional(),
  adultPrice: z.number().positive(),
  childPrice: z.number().min(0),
  totalAmount: z.number().positive(),
  currency: z.string().length(3).default('EUR'),
  customer: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
})

export const checkoutSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
})

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>
export type PricingQuery = z.infer<typeof pricingQuerySchema>
export type ReserveBookingInput = z.infer<typeof reserveBookingSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
