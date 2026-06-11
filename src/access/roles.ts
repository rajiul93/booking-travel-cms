import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export type UserRole = 'admin' | 'staff'

function getUserRole(user: unknown): UserRole | undefined {
  const appUser = user as User | null | undefined
  return appUser?.role as UserRole | undefined
}

export const isAdmin: Access = ({ req: { user } }) => {
  return getUserRole(user) === 'admin'
}

export const isAdminOrStaff: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = getUserRole(user)
  return role === 'admin' || role === 'staff'
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return getUserRole(user) === 'admin'
}

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (getUserRole(user) === 'admin') return true
  return { id: { equals: user.id } }
}

export const staffCanManageTours: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = getUserRole(user)
  return role === 'admin' || role === 'staff'
}

export const staffCanViewBookings: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = getUserRole(user)
  return role === 'admin' || role === 'staff'
}
