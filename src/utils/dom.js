/**
 * Small DOM utilities used across components.
 *
 * @module utils/dom
 */

/**
 * @typedef {object} ElOptions
 * @property {string} [className]
 * @property {string} [text]
 * @property {Record<string, string>} [attrs]
 * @property {(Node | string)[]} [children]
 */

/**
 * Creates an element with optional classes, attributes, text and children.
 *
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tagName
 * @param {ElOptions} [options]
 * @returns {HTMLElementTagNameMap[K]}
 */
export function el(tagName, options = {}) {
  const node = document.createElement(tagName);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      node.setAttribute(key, value);
    }
  }
  if (options.children) {
    for (const child of options.children) {
      node.append(child);
    }
  }
  return node;
}

/**
 * Removes all children from a node.
 *
 * @param {Element} node
 * @returns {void}
 */
export function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

/**
 * Formats a number as USD currency.
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Formats a rating with one decimal.
 *
 * @param {number} rating
 * @returns {string}
 */
export function formatRating(rating) {
  return rating.toFixed(1);
}
