// validation.middleware.js — Joi body validation factory
/**
 * Returns an Express middleware that validates req.body against the given Joi schema.
 * Responds 400 with all validation errors if it fails.
 * Replaces req.body with the sanitized value if it passes.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // collect all errors, not just the first
      stripUnknown: true,  // remove fields not in the schema
    });

    if (error) {
      const errors = error.details.map((d) => d.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    req.body = value; // use the sanitised + coerced value going forward
    next();
  };
}

module.exports = { validateBody };
