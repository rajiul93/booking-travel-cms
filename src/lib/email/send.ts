import { Resend } from 'resend'
import { getServerEnv } from '@/lib/env'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getServerEnv().RESEND_API_KEY)
  }
  return resendClient
}

export interface BookingConfirmationEmailData {
  to: string
  customerName: string
  tourTitle: string
  tourDate: string
  tourTime: string
  adults: number
  children: number
  totalAmount: number
  currency: string
  confirmationCode: string
  bookingReference: string
}

export async function sendBookingConfirmationEmail(
  data: BookingConfirmationEmailData,
): Promise<void> {
  const env = getServerEnv()
  const resend = getResend()

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: data.to,
    subject: `Booking Confirmed — ${data.tourTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Your Dream Tourism Booking is Confirmed</h1>
        <p>Dear ${data.customerName},</p>
        <p>Thank you for booking with Dream Tourism. Your adventure awaits!</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Tour</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.tourTitle}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Date</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.tourDate}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Time</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.tourTime}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Guests</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.adults} adult(s), ${data.children} child(ren)</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Total</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.currency} ${data.totalAmount.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Reference</strong></td><td style="padding: 8px 0;">${data.bookingReference}</td></tr>
        </table>
        <p style="color: #718096; font-size: 14px;">Bókun confirmation: ${data.confirmationCode}</p>
        <p>We look forward to seeing you!<br/>Dream Tourism Team<br/><a href="https://dreamtourism.it">dreamtourism.it</a></p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`Failed to send confirmation email: ${error.message}`)
  }
}
