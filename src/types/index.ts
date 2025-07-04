import { Request } from 'express'

export interface UserData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  tenantId?: number
}

export interface SanitizedUserData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface sanitizedQuery {
  currentPage: number
  perPage: number
  q?: string
  role?: string
}

export interface RegisterUserRequest extends Request {
  body: UserData
}

export interface LoginData {
  email: string
  password: string
}

export interface LoginUserRequest extends Request {
  body: LoginData
}

export interface Auth extends Request {
  auth: {
    sub: string
    role: string
    id: string
  }
}

export type AuthCookie = {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenPayload {
  id: string
  sub: string
  role: string
}

export type TenantData = {
  name: string
  address: string
}

export interface epxressResponseTenant {
  id: number
  name: string
  address: string
}

export type createUserData = {
  firstName: string
  lastName: string
  email: string
  role: string
  tenantId: number
}

export interface createUserRequest extends Request {
  body: createUserData
}
