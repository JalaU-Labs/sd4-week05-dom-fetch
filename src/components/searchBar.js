/**
 * Search bar component with a closure-based debounce.
 *
 * The pending timer id is private to the instance. Every keystroke clears the
 * previous timer and schedules a new one, so the onSearch callback fires only
 * after the user pauses typing. This is a canonical use of closures for state
 * that must not leak outside the component.
 *
 * @module components/searchBar
 */

import { el } from "../utils/dom.js";

/**
 * @typedef {object} SearchBarOptions
 * @property {(query: string) => void} onSearch
 * @property {number} [debounceMs]
 */

/**
 * @typedef {object} SearchBar
 * @property {HTMLElement} element
 * @property {() => string} getValue
 * @property {() => void} clear
 */

/**
 * @param {SearchBarOptions} options
 * @returns {SearchBar}
 */
export function createSearchBar({ onSearch, debounceMs = 300 }) {
  /** @type {number | undefined} */
  let timerId;

  const input = el("input", {
    className:
      "w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none",
    attrs: {
      type: "search",
      placeholder: "Search products...",
      "aria-label": "Search products",
    },
  });

  input.addEventListener("input", () => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    const value = input.value;
    timerId = window.setTimeout(() => {
      timerId = undefined;
      onSearch(value.trim());
    }, debounceMs);
  });

  const element = el("div", {
    className: "w-full",
    children: [input],
  });

  /**
   * @returns {string}
   */
  function getValue() {
    return input.value.trim();
  }

  /**
   * @returns {void}
   */
  function clear() {
    input.value = "";
  }

  return { element, getValue, clear };
}
