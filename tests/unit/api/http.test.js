import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../src/api/errors.js";
import { getJson } from "../../../src/api/http.js";

/**
 * @param {unknown} body
 * @param {number} status
 * @returns {Response}
 */
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getJson", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns parsed JSON on success", async () => {
    const payload = { ok: true };
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(payload));

    const result = await getJson("https://example.test/data");

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      "https://example.test/data",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("throws ApiError with HTTP_ERROR on non-2xx responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(getJson("https://example.test/fail")).rejects.toMatchObject({
      name: "ApiError",
      code: "HTTP_ERROR",
      status: 500,
    });
  });

  it("throws ApiError with NETWORK_ERROR when fetch rejects", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("boom"));

    await expect(getJson("https://example.test/net")).rejects.toMatchObject({
      name: "ApiError",
      code: "NETWORK_ERROR",
    });
  });

  it("throws ApiError with PARSE_ERROR when response body is not JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("not json", { status: 200, headers: { "Content-Type": "text/plain" } }),
    );

    await expect(getJson("https://example.test/bad")).rejects.toMatchObject({
      code: "PARSE_ERROR",
    });
  });

  it("aborts with TIMEOUT when the timeout elapses", async () => {
    vi.useFakeTimers();
    /** @type {(reason: unknown) => void} */
    let abortListener = () => {};
    vi.mocked(fetch).mockImplementationOnce((_url, init) => {
      return new Promise((_resolve, reject) => {
        const signal = /** @type {AbortSignal} */ (init?.signal);
        signal.addEventListener("abort", () => {
          const err = new DOMException("aborted", "AbortError");
          reject(err);
        });
        abortListener = () => signal.dispatchEvent(new Event("abort"));
      });
    });

    const promise = getJson("https://example.test/slow", { timeoutMs: 50 });
    vi.advanceTimersByTime(60);
    abortListener();

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ code: "TIMEOUT" });
  });
});