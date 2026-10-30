/**
 * Thin wrapper around the global fetch API that adds timeout handling,
 * JSON parsing and consistent error mapping through ApiError.
 *
 * @module api/http
 */

import { ApiError } from "./errors.js";

/**
 * @typedef {object} HttpOptions
 * @property {AbortSignal} [signal] - Caller-provided abort signal.
 * @property {number} [timeoutMs] - Timeout in milliseconds. Defaults to 10000.
 * @property {Record<string, string>} [headers] - Extra request headers.
 */

/**
 * Performs a GET request and returns parsed JSON.
 *
 * @template T
 * @param {string} url
 * @param {HttpOptions} [options]
 * @returns {Promise<T>}
 */
export async function getJson(url, options = {}) {
  const { signal, timeoutMs = 10_000, headers } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);

  // Bridge caller signal with the internal controller so either can abort.
  const onCallerAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) {
      onCallerAbort();
    } else {
      signal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  try {
    /** @type {Response} */
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json", ...headers },
        signal: controller.signal,
      });
    } catch (error) {
      if (isAbortReason(controller, signal, error)) {
        throw new ApiError("Request aborted", {
          code: controller.signal.reason === "timeout" ? "TIMEOUT" : "ABORTED",
          cause: error,
        });
      }
      throw new ApiError("Network request failed", { code: "NETWORK_ERROR", cause: error });
    }

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status} on ${url}`, {
        status: response.status,
        code: "HTTP_ERROR",
        cause: response,
      });
    }

    try {
      return /** @type {T} */ (await response.json());
    } catch (error) {
      throw new ApiError("Failed to parse JSON response", { code: "PARSE_ERROR", cause: error });
    }
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onCallerAbort);
  }
}

/**
 * Determines whether the thrown error was caused by an abort.
 *
 * @param {AbortController} controller
 * @param {AbortSignal | undefined} callerSignal
 * @param {unknown} error
 * @returns {boolean}
 */
function isAbortReason(controller, callerSignal, error) {
  if (controller.signal.aborted) return true;
  if (callerSignal?.aborted) return true;
  return error instanceof Error && error.name === "AbortError";
}
