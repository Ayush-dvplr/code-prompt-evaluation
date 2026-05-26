// AppError.js — operational error class used throughout controllers
// Throw this instead of generic Error so the globalErrorHandler can distinguish
// expected errors (wrong password, not found) from unexpected crashes.
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message)
    this.statusCode = statusCode
    this.code = code        // SCREAMING_SNAKE_CASE, e.g. 'NOT_FOUND'
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
