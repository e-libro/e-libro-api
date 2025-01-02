import ApiError from "../errors/ApiError.js";
import logger from "../logger/logger.js";

function apiErrorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    logger.log({ level: "error", message: err.message });

    return res.status(err.code).json({
      status: "error",
      message: err.message,
      data: null,
      error: {
        code: err.code,
        details: err.message,
      },
    });
  }

  logger.log({ level: "error", message: err.message });

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    data: null,
    error: {
      code: 500,
      details: err.message,
    },
  });
}

export default apiErrorHandler;
