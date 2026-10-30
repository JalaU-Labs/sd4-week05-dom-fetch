/**
 * Products client for the DummyJSON API.
 *
 * The client is implemented as a factory that returns an object whose methods
 * close over private state (cache, in-flight map, active AbortController,
 * request counter and subscriber set). This design keeps every instance
 * isolated and demonstrates closure-based encapsulation.
 *
 * @module api/products
 */

import { ApiError } from "./errors.js";
import { getJson } from "./http.js";

const DEFAULT_BASE_URL = "https://dummyjson.com";

/**
 * @typedef {object} Product
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {number} rating
 * @property {number} stock
 * @property {string} category
 * @property {string} thumbnail
 */

/**
 * @typedef {object} ProductListResponse
 * @property {Product[]} products
 * @property {number} total
 * @property {number} skip
 * @property {number} limit
 */

/**
 * @typedef {object} ClientEvent
 * @property {"request" | "response" | "cache-hit" | "error" | "abort"} type
 * @property {string} [url]
 * @property {unknown} [payload]
 */

/**
 * @callback ClientListener
 * @param {ClientEvent} event
 * @returns {void}
 */

/**
 * @typedef {object} ProductsClient
 * @property {(params?: { limit?: number, skip?: number }) => Promise<ProductListResponse>} listProducts
 * @property {(id: number) => Promise<Product>} getProduct
 * @property {(query: string, params?: { limit?: number }) => Promise<ProductListResponse>} searchProducts
 * @property {() => void} abortPending
 * @property {(listener: ClientListener) => () => void} subscribe
 * @property {() => { requestCount: number, cacheSize: number, inFlight: number }} getStats
 */

/**
 * Creates an isolated products client.
 *
 * @param {{ baseUrl?: string, fetchTimeoutMs?: number }} [config]
 * @returns {ProductsClient}
 */
export function createProductsClient(config = {}) {
  const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const fetchTimeoutMs = config.fetchTimeoutMs ?? 10_000;

  /** @type {Map<string, unknown>} */
  const cache = new Map();
  /** @type {Map<string, AbortController>} */
  const inFlight = new Map();
  /** @type {Set<ClientListener>} */
  const listeners = new Set();
  let requestCount = 0;

  /**
   * Notifies every subscriber. Wrapped in try/catch so a misbehaving listener
   * cannot break the request lifecycle.
   *
   * @param {ClientEvent} event
   * @returns {void}
   */
  function notify(event) {
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("Subscriber threw during event dispatch", error);
      }
    }
  }

  /**
   * Registers a listener and returns an unsubscribe function. The unsubscribe
   * is itself a closure over the listener reference, which makes the callback
   * removal safe regardless of how many listeners exist.
   *
   * @param {ClientListener} listener
   * @returns {() => void}
   */
  function subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * Cancels every in-flight request.
   *
   * @returns {void}
   */
  function abortPending() {
    for (const controller of inFlight.values()) {
      controller.abort("caller");
    }
    inFlight.clear();
  }

  /**
   * Internal GET with caching and abort management.
   *
   * @template T
   * @param {string} url
   * @param {string} cacheKey
   * @returns {Promise<T>}
   */
  async function getCached(url, cacheKey) {
    if (cache.has(cacheKey)) {
      notify({ type: "cache-hit", url });
      return /** @type {T} */ (cache.get(cacheKey));
    }

    const previous = inFlight.get(cacheKey);
    if (previous) {
      previous.abort("superseded");
      notify({ type: "abort", url });
    }

    const controller = new AbortController();
    inFlight.set(cacheKey, controller);
    requestCount += 1;
    notify({ type: "request", url });

    try {
      const data = await getJson(url, {
        signal: controller.signal,
        timeoutMs: fetchTimeoutMs,
      });
      cache.set(cacheKey, data);
      notify({ type: "response", url, payload: data });
      return /** @type {T} */ (data);
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "NETWORK_ERROR";
      notify({ type: "error", url, payload: { code, error } });
      throw error;
    } finally {
      inFlight.delete(cacheKey);
    }
  }

  /**
   * @param {{ limit?: number, skip?: number }} [params]
   * @returns {Promise<ProductListResponse>}
   */
  async function listProducts(params = {}) {
    const limit = params.limit ?? 12;
    const skip = params.skip ?? 0;
    const url = `${baseUrl}/products?limit=${limit}&skip=${skip}`;
    return getCached(url, `list:${limit}:${skip}`);
  }

  /**
   * @param {number} id
   * @returns {Promise<Product>}
   */
  async function getProduct(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError(`Invalid product id: ${id}`, { code: "INVALID_ARGUMENT" });
    }
    const url = `${baseUrl}/products/${id}`;
    return getCached(url, `product:${id}`);
  }

  /**
   * @param {string} query
   * @param {{ limit?: number }} [params]
   * @returns {Promise<ProductListResponse>}
   */
  async function searchProducts(query, params = {}) {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      throw new ApiError("Search query cannot be empty", { code: "INVALID_ARGUMENT" });
    }
    const limit = params.limit ?? 12;
    const url = `${baseUrl}/products/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`;
    return getCached(url, `search:${trimmed}:${limit}`);
  }

  /**
   * @returns {{ requestCount: number, cacheSize: number, inFlight: number }}
   */
  function getStats() {
    return { requestCount, cacheSize: cache.size, inFlight: inFlight.size };
  }

  return {
    listProducts,
    getProduct,
    searchProducts,
    abortPending,
    subscribe,
    getStats,
  };
}