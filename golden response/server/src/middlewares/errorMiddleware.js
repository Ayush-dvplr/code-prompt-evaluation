// errorMiddleware.js — global error handler, registered last in app.js
// Handles AppError (operational), Mongoose validation, duplicate key, and JWT errors.
// All other errors are treated as unexpected 500s.

function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let code = err.code || 'INTERNAL_ERROR'
  let errors = []

  // Mongoose validation error (e.g. required field missing)
  if (err.name === 'ValidationError') {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = 'Validation failed'
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))
  }

  // MongoDB duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409
    code = 'DUPLICATE_KEY'
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    message = `${field} already exists`
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    code = 'TOKEN_INVALID'
    message = 'Token is invalid'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    code = 'TOKEN_EXPIRED'
    message = 'Token has expired'
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    code = 'INVALID_ID'
    message = `Invalid ${err.path}`
  }

  // Hide internals of unexpected server errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong'
    code = 'INTERNAL_ERROR'
  } else if (statusCode === 500) {
    console.error('[Server Error]', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    errors,
  })
}

module.exports = errorMiddleware
