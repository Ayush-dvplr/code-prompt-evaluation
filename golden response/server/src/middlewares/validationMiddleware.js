// validationMiddleware.js — Joi body validation factory
// Returns Express middleware that validates req.body against a Joi schema.
// Responds 400 with all field-level errors if validation fails.
// Replaces req.body with the sanitized + coerced value if it passes.
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,  // collect all errors, not just the first
      stripUnknown: true, // drop fields not defined in the schema
    })

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key || d.path.join('.'),
        message: d.message,
      }))
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors,
      })
    }

    req.body = value
    next()
  }
}

module.exports = { validateBody }
