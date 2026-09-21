const taskService = require('../services/taskService')

const listTasks = async (req, res, next) => {
  try {
    const result = await taskService.getTasks(req.user.id, req.query)
    res.status(200).json({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
    })
  } catch (error) {
    next(error)
  }
}

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const task = await taskService.getTaskById(id, req.user.id)
    res.status(200).json({
      success: true,
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body)
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const task = await taskService.updateTask(id, req.user.id, req.body)
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await taskService.deleteTask(id, req.user.id)
    res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
}
