// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const status = err.statusCode || err.status || 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(err.errors ? { errors: err.errors } : {}),
  });
}

module.exports = errorMiddleware;
