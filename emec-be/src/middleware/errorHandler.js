const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);

  // Handle MySQL duplicate entry errors
  if (err.code === 'ER_DUP_ENTRY') {
    const message = err.sqlMessage || 'Duplicate entry. This value already exists.';
    return res.status(400).json({
      success: false,
      error: message,
      message: message
    });
  }

  // Handle custom duplicate name errors
  if (err.code === 'DUPLICATE_NAME') {
    return res.status(400).json({
      success: false,
      error: err.message,
      message: err.message
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.toString()
    })
  });
};

export default errorHandler;

