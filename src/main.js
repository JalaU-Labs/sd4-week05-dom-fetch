/**
 * Application entry point.
 *
 * Wires the products API client with the presentational components. The
 * orchestration state (current query, current page, page size) is kept inside
 * the bootstrap closure and only mutated through small helpers, which keeps
 * the data flow predictable.
 *
 * @module main
 */

import { createProductsClient } from "./api/products.js";
import { isApiError } from "./api/errors.js";
import { createProductGrid } from "./components/productGrid.js";
import { createSearchBar } from "./components/searchBar.js";
import { el } from "./utils/dom.js";

const PAGE_SIZE = 12;

/**
 * Retrieves a required element by selector, or throws if missing.
 *
 * Returning HTMLElement (not HTMLElement | null) lets callers store the result
 * in a const binding whose type remains non-null inside nested closures, which
 * is what TypeScript requires for stable narrowing.
 *
 * @param {string} selector
 * @returns {HTMLElement}
 */
function mustGetElement(selector) {
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLElement)) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return node;
}

/**
 * Renders a pagination bar with previous and next buttons.
 *
 * @param {{ page: number, totalPages: number, onChange: (page: number) => void }} options
 * @returns {HTMLElement}
 */
function createPagination({ page, totalPages, onChange }) {
  const previous = el("button", {
    className:
      "rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
    text: "Previous",
    attrs: { type: "button" },
  });
  previous.disabled = page <= 1;
  previous.addEventListener("click", () => onChange(page - 1));

  const next = el("button", {
    className:
      "rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
    text: "Next",
    attrs: { type: "button" },
  });
  next.disabled = page >= totalPages;
  next.addEventListener("click", () => onChange(page + 1));

  const label = el("span", {
    className: "text-sm text-slate-600",
    text: `Page ${page} of ${Math.max(totalPages, 1)}`,
  });

  return el("div", {
    className: "flex w-full items-center justify-between",
    children: [previous, label, next],
  });
}

/**
 * Initializes the application.
 *
 * @returns {void}
 */
function bootstrap() {
  const searchSection = mustGetElement("#search-section");
  const gridSection = mustGetElement("#grid-section");
  const paginationSection = mustGetElement("#pagination-section");
  const statusSection = mustGetElement("#status-section");

  const client = createProductsClient();
  const grid = createProductGrid();

  /** @type {{ query: string, page: number, totalPages: number }} */
  const state = { query: "", page: 1, totalPages: 1 };

  const searchBar = createSearchBar({
    onSearch: (query) => {
      state.query = query;
      state.page = 1;
      void load();
    },
  });

  searchSection.append(searchBar.element);
  gridSection.append(grid.element);

  client.subscribe((event) => {
    if (event.type === "error") {
      console.warn("API error event", event.payload);
    }
  });

  /**
   * Loads the current page, either by search query or by listing.
   *
   * @returns {Promise<void>}
   */
  async function load() {
    grid.renderLoading();
    paginationSection.replaceChildren();
    statusSection.textContent = "";

    try {
      const response =
        state.query.length > 0
          ? await client.searchProducts(state.query, { limit: PAGE_SIZE })
          : await client.listProducts({ limit: PAGE_SIZE, skip: (state.page - 1) * PAGE_SIZE });

      state.totalPages = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
      grid.render(response.products);
      renderPagination();
      renderStatus();
    } catch (error) {
      if (isApiError(error)) {
        grid.renderError(`Could not load products: ${error.code}`);
      } else {
        grid.renderError("Unexpected error while loading products.");
      }
    }
  }

  /**
   * @returns {void}
   */
  function renderPagination() {
    paginationSection.replaceChildren(
      createPagination({
        page: state.page,
        totalPages: state.totalPages,
        onChange: (nextPage) => {
          state.page = nextPage;
          void load();
        },
      }),
    );
  }

  /**
   * @returns {void}
   */
  function renderStatus() {
    const stats = client.getStats();
    statusSection.textContent = `Requests: ${stats.requestCount} | Cache entries: ${stats.cacheSize}`;
  }

  void load();
}

bootstrap();
