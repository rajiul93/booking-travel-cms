export type BokunHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface BokunPricePerCategory {
  id: number
  title?: string
  ticketCategory: 'ADULT' | 'CHILD' | 'TEENAGER' | 'INFANT' | string
  price: {
    amount: number
    currency: string
  }
}

export interface BokunRatePrice {
  activityRateId: number
  pricePerCategoryUnit: BokunPricePerCategory[]
}

export interface BokunAvailability {
  id: string
  date: number
  localizedDate: string
  startTime?: string
  startTimeId?: number
  unlimitedAvailability: boolean
  availabilityCount: number
  bookedParticipants: number
  minParticipants: number
  defaultRateId: number
  pricesByRate: BokunRatePrice[]
  unavailable: boolean
  soldOut: boolean
}

export interface BokunCheckoutSubmitRequest {
  activityBookings: Array<{
    activityId: number
    date: string
    startTimeId?: number
    rateId: number
    passengers: Array<{
      pricingCategoryId: number
      quantity: number
    }>
  }>
  customer: {
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
  }
}

export interface BokunCheckoutSubmitResponse {
  booking: {
    confirmationCode: string
    status: string
    totalPrice: number
    currency: string
  }
}

export interface BokunConfirmResponse {
  booking: {
    confirmationCode: string
    status: string
  }
}

export interface BokunWebhookPayload {
  eventType: string
  activityId?: number
  date?: string
  timestamp?: number
  confirmationCode?: string
}
