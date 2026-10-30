/**
 * Error thrown by the API layer with a machine-readable code.
 *
 * @module api/errors
 */

/**
 * @typedef {"NETWORK_ERROR" | "HTTP_ERROR" | "PARSE_ERROR" | "ABORTED" | "TIMEOUT" | "INVALID_ARGUMENT"} ApiErrorCode
 */

/**
 * @typedef {object} ApiErrorOptions
 * @property {number} [status] - HTTP status code, when applicable.
 * @property {ApiErrorCode} code - Machine-readable error code.
 * @property {unknown} [cause] - Underlying error or response payload.
 */

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {ApiErrorOptions} options
   */
  constructor(message, { status, code, cause }) {
    super(message);
    this.name = "ApiError";
    /** @type {number | undefined} */
    this.status = status;
    /** @type {ApiErrorCode} */
    this.code = code;
    /** @type {unknown} */
    this.cause = cause;
  }
}

/**
 * Type guard for ApiError instances.
 *
 * @param {unknown} value
 * @returns {value is ApiError}
 */
export function isApiError(value) {
  return value instanceof ApiError;
}
