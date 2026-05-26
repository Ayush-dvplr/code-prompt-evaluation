// src/middlewares/validation.middleware.js
const Joi = require('joi');

/**
 * Returns a middleware that validates req.body against the provided Joi schema.
 * If validation fails, responds with 400 and details.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ message: 'Validation failed', errors: details });
    }
    req.body = value; // use sanitized values
    next();
  };
}

module.exports = { validateBody };
