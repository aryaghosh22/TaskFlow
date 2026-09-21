const { z } = require('zod')

const PROJECT_STATUSES = ['ACTIVE', 'COMPLETED', 'ARCHIVED']

const createProjectSchema = z.object({
  name: z.string({ required_error: 'Project name is required' })
    .trim()
    .min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional().nullable().default(''),
  status: z.enum(PROJECT_STATUSES).optional().default('ACTIVE'),
  deadline: z.string().optional().nullable(),
})

const updateProjectSchema = z.object({
  name: z.string().trim().min(3, 'Project name must be at least 3 characters').optional(),
  description: z.string().optional().nullable(),
  status: z.enum(PROJECT_STATUSES).optional(),
  deadline: z.string().optional().nullable(),
})

module.exports = {
  createProjectSchema,
  updateProjectSchema,
}
