/**
 * Product grid component with explicit rendering states.
 *
 * The component is a factory: it closes over its container element and exposes
 * only the state-transition methods. This keeps the rendering surface small and
 * makes every state reachable from tests.
 *
 * @module components/productGrid
 */

import { createProductCard } from "./productCard.js";
import { clearChildren, el } from "../utils/dom.js";

/**
 * @typedef {import("./productCard.js").Product} Product
 */

/**
 * @typedef {object} ProductGrid
 * @property {HTMLElement} element
 * @property {(products: Product[]) => void} render
 * @property {() => void} renderLoading
 * @property {(message: string) => void} renderError
 * @property {() => void} renderEmpty
 */

/**
 * Creates a product grid.
 *
 * @returns {ProductGrid}
 */
export function createProductGrid() {
  const element = el("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
    attrs: { role: "list" },
  });

  /**
   * @param {Product[]} products
   * @returns {void}
   */
  function render(products) {
    clearChildren(element);
    if (products.length === 0) {
      renderEmpty();
      return;
    }
    for (const product of products) {
      element.append(createProductCard(product));
    }
  }

  /**
   * @returns {void}
   */
  function renderLoading() {
    clearChildren(element);
    element.append(
      el("p", {
        className: "col-span-full py-8 text-center text-slate-500",
        text: "Loading products...",
      }),
    );
  }

  /**
   * @param {string} message
   * @returns {void}
   */
  function renderError(message) {
    clearChildren(element);
    element.append(
      el("p", {
        className: "col-span-full rounded-md bg-rose-50 px-4 py-6 text-center text-rose-700",
        text: message,
      }),
    );
  }

  /**
   * @returns {void}
   */
  function renderEmpty() {
    clearChildren(element);
    element.append(
      el("p", {
        className: "col-span-full py-8 text-center text-slate-500",
        text: "No products match the current search.",
      }),
    );
  }

  return { element, render, renderLoading, renderError, renderEmpty };
}
