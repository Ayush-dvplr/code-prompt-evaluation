// src/middlewares/error.middleware.js
/**
 * Central error handling middleware.
 * Sends JSON response with { message, status }.
 */
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message, status });
}

module.exports = errorHandler;
