class NotFoundError extends Error {}

const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || (error instanceof NotFoundError ? 404 : 500);
  const response = {
    message: error.message || "Internal server error"
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export {
  notFound,
  errorHandler
};
