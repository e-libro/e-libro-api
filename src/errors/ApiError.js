class ApiError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.message = message;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message = "Bad Request", details = null) {
    return new ApiError(400, message, details);
  }

  static Unauthorized(message = "Unauthorized", details = null) {
    return new ApiError(401, message, details);
  }

  static Forbidden(message = "Forbidden", details = null) {
    return new ApiError(403, message, details);
  }

  static NotFound(details = null) {
    return new ApiError(404, "Not Found", details);
  }

  static Conflict(message = "Conflict", details = null) {
    return new ApiError(409, message, details);
  }

  static UnprocessableEntity(message = "Unprocessable Entity", details = null) {
    return new ApiError(422, message, details);
  }

  static InvalidToken(message = "Invalid Token", details = null) {
    return new ApiError(498, message, details);
  }

  static RequiredToken(message = "Required Token", details = null) {
    return new ApiError(499, message, details);
  }

  static InternalServerError(
    message = "Internal Server Error",
    details = null
  ) {
    return new ApiError(500, message, details);
  }

  static NotImplemented(message = "Not Implemented", details = null) {
    return new ApiError(501, message, details);
  }

  static BadGateway(message = "Bad Gateway", details = null) {
    return new ApiError(502, message, details);
  }

  static ServiceUnavailable(message = "Service Unavailable", details = null) {
    return new ApiError(503, message, details);
  }
}

export default ApiError;
