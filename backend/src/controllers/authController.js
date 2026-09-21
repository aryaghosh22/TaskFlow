const authService = require('../services/authService')

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const result = await authService.register({ name, email, password })
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login({ email, password })
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id)
    res.status(200).json({
      success: true,
      data: user,
      user,
    })
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}

module.exports = {
  register,
  login,
  me,
  logout,
}
