import api from './client'

/**
 * Projects API Service Layer
 * Prepared for Node.js + Express + Prisma REST API.
 * Future integration point: connects with GET, POST, PATCH, DELETE /api/projects.
 */

export function getProjects(params) {
  return api.get('/projects', { params })
}

export function getProject(projectId) {
  return api.get(`/projects/${projectId}`)
}

export function createProject(payload) {
  return api.post('/projects', payload)
}

export function updateProject(projectId, payload) {
  return api.patch(`/projects/${projectId}`, payload)
}

export function deleteProject(projectId) {
  return api.delete(`/projects/${projectId}`)
}

// Alias for compatibility
export const listProjects = getProjects
