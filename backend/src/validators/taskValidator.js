const { z } = require('zod')

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const createTaskSchema = z.object({
  title: z.string({ required_error: 'Task title is required' })
    .trim()
    .min(1, 'Task title cannot be empty'),
  description: z.string().optional().nullable().default(''),
  projectId: z.string({ required_error: 'Project ID is required' })
    .min(1, 'Project ID is required'),
  status: z.enum(TASK_STATUSES).optional().default('TODO'),
  priority: z.enum(TASK_PRIORITIES).optional().default('MEDIUM'),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional().default([]),
})

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title cannot be empty').optional(),
  description: z.string().optional().nullable(),
  projectId: z.string().min(1).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
})

module.exports = {
  createTaskSchema,
  updateTaskSchema,
}
