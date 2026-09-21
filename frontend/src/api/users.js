import api from './client'

export function getUsers() {
  return api.get('/users')
}

export function getUserProfile() {
  return api.get('/users/me')
}

export function updateUserProfile(payload) {
  return api.put('/users/me', payload)
}
