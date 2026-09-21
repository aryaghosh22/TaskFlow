const userService = require('../services/userService')

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user.id)
    res.status(200).json({
      success: true,
      data: profile,
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body)
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
      user: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}

const listUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers()
    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProfile,
  updateProfile,
  listUsers,
}
