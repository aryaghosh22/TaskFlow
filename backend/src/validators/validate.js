const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source])
      req[source] = parsed
      next()
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const formattedErrors = {}
        for (const issue of err.errors) {
          const path = issue.path.join('.') || 'field'
          if (!formattedErrors[path]) {
            formattedErrors[path] = issue.message
          }
        }
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        })
      }
      next(err)
    }
  }
}

module.exports = validate
