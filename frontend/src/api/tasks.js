import api from './client'

/**
 * Tasks API Service Layer
 * Prepared for Node.js + Express + Prisma REST API.
 * Future integration point: connects with GET, POST, PATCH, DELETE /api/tasks.
 */

export function getTasks(params) {
  return api.get('/tasks', { params })
}

export function getTask(taskId) {
  return api.get(`/tasks/${taskId}`)
}

export function createTask(payload) {
  return api.post('/tasks', payload)
}

export function updateTask(taskId, payload) {
  return api.patch(`/tasks/${taskId}`, payload)
}

export function deleteTask(taskId) {
  return api.delete(`/tasks/${taskId}`)
}

// Alias for compatibility
export const listTasks = getTasks
