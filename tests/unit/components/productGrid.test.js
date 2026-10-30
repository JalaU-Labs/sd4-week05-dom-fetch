import { describe, expect, it } from "vitest";

import { createProductGrid } from "../../../src/components/productGrid.js";

/**
 * @type {import("../../../src/components/productCard.js").Product[]}
 */
const products = [
  {
    id: 1,
    title: "A",
    description: "First",
    price: 10,
    rating: 4.1,
    stock: 5,
    category: "x",
    thumbnail: "https://example.test/a.jpg",
  },
  {
    id: 2,
    title: "B",
    description: "Second",
    price: 20,
    rating: 3.5,
    stock: 8,
    category: "y",
    thumbnail: "https://example.test/b.jpg",
  },
];

describe("createProductGrid", () => {
  it("renders one card per product", () => {
    const grid = createProductGrid();
    grid.render(products);

    const cards = grid.element.querySelectorAll("[data-product-id]");
    expect(cards).toHaveLength(2);
  });

  it("renders empty state when given an empty array", () => {
    const grid = createProductGrid();
    grid.render([]);

    expect(grid.element.textContent).toContain("No products match the current search.");
    expect(grid.element.querySelectorAll("[data-product-id]")).toHaveLength(0);
  });

  it("renders loading state", () => {
    const grid = createProductGrid();
    grid.renderLoading();

    expect(grid.element.textContent).toContain("Loading products...");
  });

  it("renders error state with the given message", () => {
    const grid = createProductGrid();
    grid.renderError("Could not load products: NETWORK_ERROR");

    expect(grid.element.textContent).toContain("Could not load products: NETWORK_ERROR");
  });

  it("replaces previous content on subsequent renders", () => {
    const grid = createProductGrid();
    grid.render(products);
    grid.renderLoading();

    expect(grid.element.querySelectorAll("[data-product-id]")).toHaveLength(0);
    expect(grid.element.textContent).toContain("Loading products...");
  });
});
