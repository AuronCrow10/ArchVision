export function errorHandler(err, req, res, _next) {
  console.error('[error]', err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'Validation error',
      details: err.errors,
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';

  res.status(status).json({ error: message });
}
