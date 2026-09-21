const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  })
}

module.exports = notFoundMiddleware
