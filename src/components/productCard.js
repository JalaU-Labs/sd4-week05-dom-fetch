/**
 * Product card component.
 *
 * @module components/productCard
 */

import { el, formatPrice, formatRating } from "../utils/dom.js";

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
 * Builds a product card element.
 *
 * @param {Product} product
 * @returns {HTMLElement}
 */
export function createProductCard(product) {
  const image = el("img", {
    className: "h-48 w-full object-cover",
    attrs: {
      src: product.thumbnail,
      alt: product.title,
      loading: "lazy",
    },
  });

  const title = el("h3", {
    className: "mt-4 text-lg font-semibold text-slate-900",
    text: product.title,
  });

  const description = el("p", {
    className: "mt-1 line-clamp-2 text-sm text-slate-600",
    text: product.description,
  });

  const price = el("span", {
    className: "text-base font-bold text-slate-900",
    text: formatPrice(product.price),
  });

  const rating = el("span", {
    className: "text-sm text-amber-600",
    text: `Rating: ${formatRating(product.rating)}`,
  });

  const stock = el("span", {
    className: "text-sm text-slate-500",
    text: `Stock: ${product.stock}`,
  });

  const meta = el("div", {
    className: "mt-2 flex items-center justify-between",
    children: [price, rating],
  });

  const footer = el("div", {
    className: "mt-2 flex items-center justify-between",
    children: [stock, el("span", { className: "text-xs text-slate-400", text: product.category })],
  });

  const body = el("div", {
    className: "p-4",
    children: [title, description, meta, footer],
  });

  return el("article", {
    className:
      "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md",
    attrs: { "data-product-id": String(product.id) },
    children: [image, body],
  });
}
