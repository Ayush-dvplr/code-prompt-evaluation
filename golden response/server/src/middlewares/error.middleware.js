// error.middleware.js — global error handler, registered last in App.js
function errorMiddleware(err, req, res, next) {
  console.error('Server error:', err.message);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
}

module.exports = errorMiddleware;
