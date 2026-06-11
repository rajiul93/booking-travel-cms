import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function jsonSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return jsonError(error.errors.map((e) => e.message).join(', '), 422)
  }

  if (error instanceof Error) {
    console.error('API Error:', error.message)
    return jsonError(error.message, 500)
  }

  return jsonError('An unexpected error occurred', 500)
}
