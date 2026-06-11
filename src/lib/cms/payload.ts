import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

/** Single Payload instance per request — avoids repeated initialization. */
export const getPayloadCached = cache(async () => getPayload({ config }))
