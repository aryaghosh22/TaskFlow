const projectService = require('../services/projectService')

const listProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user.id)
    res.status(200).json({
      success: true,
      data: projects,
    })
  } catch (error) {
    next(error)
  }
}

const getProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const project = await projectService.getProjectById(id, req.user.id)
    res.status(200).json({
      success: true,
      data: project,
    })
  } catch (error) {
    next(error)
  }
}

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user.id, req.body)
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    })
  } catch (error) {
    next(error)
  }
}

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const project = await projectService.updateProject(id, req.user.id, req.body)
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    })
  } catch (error) {
    next(error)
  }
}

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.deleteProject(id, req.user.id)
    res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
}
