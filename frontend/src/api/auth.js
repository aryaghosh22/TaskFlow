import api from './client'

/**
 * Authentication API Service Layer
 * Prepared for Node.js + Express + Prisma REST API (JWT-based).
 * Note: These endpoints represent future backend integration points.
 * For client-side demo and testing, session state is managed in AuthContext.
 */

export function loginUser(credentials) {
  return api.post('/auth/login', credentials)
}

export function registerUser(userData) {
  return api.post('/auth/register', userData)
}

export function getCurrentUser() {
  return api.get('/auth/me')
}

export function logoutUser() {
  return api.post('/auth/logout')
}

// Aliases for compatibility
export const loginRequest = loginUser
export const registerRequest = registerUser
export const logoutRequest = logoutUser
export const getCurrentUserRequest = getCurrentUser
