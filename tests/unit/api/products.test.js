import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../src/api/errors.js";
import { createProductsClient } from "../../../src/api/products.js";

/**
 * @param {unknown} body
 * @param {number} [status]
 * @returns {Response}
 */
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** @type {{ products: unknown[], total: number, skip: number, limit: number }} */
const listPayload = {
  products: [
    {
      id: 1,
      title: "Phone",
      description: "A phone",
      price: 99,
      rating: 4.5,
      stock: 10,
      category: "electronics",
      thumbnail: "https://example.test/1.jpg",
    },
  ],
  total: 1,
  skip: 0,
  limit: 12,
};

/**
 * Builds a fresh Response on each invocation. Required because a Response body
 * can only be consumed once, and the client may issue several requests within
 * a single test.
 *
 * @returns {Promise<Response>}
 */
function freshListResponse() {
  return Promise.resolve(jsonResponse(listPayload));
}

describe("createProductsClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and caches listProducts across calls", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(listPayload));
    const client = createProductsClient({ baseUrl: "https://dummy.test" });

    const first = await client.listProducts({ limit: 12, skip: 0 });
    const second = await client.listProducts({ limit: 12, skip: 0 });

    expect(first).toEqual(listPayload);
    expect(second).toEqual(listPayload);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(client.getStats()).toEqual({ requestCount: 1, cacheSize: 1, inFlight: 0 });
  });

  it("notifies subscribers on request, response and cache-hit", async () => {
    vi.mocked(fetch).mockImplementationOnce(freshListResponse);
    const client = createProductsClient({ baseUrl: "https://dummy.test" });
    /** @type {string[]} */
    const events = [];
    const unsubscribe = client.subscribe((event) => events.push(event.type));

    await client.listProducts();
    await client.listProducts();
    await client.listProducts();

    expect(events).toEqual(["request", "response", "cache-hit", "cache-hit"]);

    unsubscribe();
    await client.listProducts();

    expect(events).toEqual(["request", "response", "cache-hit", "cache-hit"]);
  });

  it("unsubscribe stops delivering events", async () => {
    vi.mocked(fetch).mockImplementation(freshListResponse);
    const client = createProductsClient({ baseUrl: "https://dummy.test" });
    /** @type {number} */
    let calls = 0;
    const unsubscribe = client.subscribe(() => {
      calls += 1;
    });

    await client.listProducts({ limit: 1 });
    const callsBefore = calls;
    unsubscribe();
    await client.listProducts({ limit: 2 });

    expect(calls).toBe(callsBefore);
  });

  it("keeps independent state per client instance", async () => {
    vi.mocked(fetch).mockImplementation(freshListResponse);
    const a = createProductsClient({ baseUrl: "https://a.test" });
    const b = createProductsClient({ baseUrl: "https://b.test" });

    await a.listProducts();
    await b.listProducts();

    expect(a.getStats().cacheSize).toBe(1);
    expect(b.getStats().cacheSize).toBe(1);
    expect(a.getStats().requestCount).toBe(1);
    expect(b.getStats().requestCount).toBe(1);
  });

  it("rejects invalid product ids with INVALID_ARGUMENT", async () => {
    const client = createProductsClient({ baseUrl: "https://dummy.test" });
    await expect(client.getProduct(0)).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
    await expect(client.getProduct(1.5)).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects empty search queries with INVALID_ARGUMENT", async () => {
    const client = createProductsClient({ baseUrl: "https://dummy.test" });
    await expect(client.searchProducts("   ")).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("propagates HTTP errors as ApiError and notifies subscribers", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, 500));
    const client = createProductsClient({ baseUrl: "https://dummy.test" });
    /** @type {string[]} */
    const events = [];
    client.subscribe((event) => events.push(event.type));

    await expect(client.getProduct(7)).rejects.toBeInstanceOf(ApiError);
    expect(events).toEqual(["request", "error"]);
  });

  it("abortPending cancels in-flight requests", async () => {
    /** @type {AbortSignal | undefined} */
    let captured;
    vi.mocked(fetch).mockImplementationOnce((_url, init) => {
      captured = /** @type {AbortSignal} */ (init?.signal);
      return new Promise((_resolve, reject) => {
        captured?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      });
    });
    const client = createProductsClient({ baseUrl: "https://dummy.test" });

    const pending = client.listProducts();
    client.abortPending();

    await expect(pending).rejects.toMatchObject({ code: "ABORTED" });
    expect(captured?.aborted).toBe(true);
  });
});
