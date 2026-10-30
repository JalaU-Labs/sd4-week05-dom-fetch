import { describe, expect, it } from "vitest";

import { createProductCard } from "../../../src/components/productCard.js";

/**
 * @type {import("../../../src/components/productCard.js").Product}
 */
const product = {
  id: 42,
  title: "Wireless Headphones",
  description: "Noise cancelling over-ear headphones.",
  price: 129.99,
  rating: 4.7,
  stock: 23,
  category: "audio",
  thumbnail: "https://example.test/headphones.jpg",
};

describe("createProductCard", () => {
  it("renders title, description, price, rating and stock", () => {
    const card = createProductCard(product);

    expect(card.getAttribute("data-product-id")).toBe("42");
    expect(card.textContent).toContain("Wireless Headphones");
    expect(card.textContent).toContain("Noise cancelling over-ear headphones.");
    expect(card.textContent).toContain("$129.99");
    expect(card.textContent).toContain("Rating: 4.7");
    expect(card.textContent).toContain("Stock: 23");
    expect(card.textContent).toContain("audio");
  });

  it("renders an image with alt text and lazy loading", () => {
    const card = createProductCard(product);
    const img = card.querySelector("img");

    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("https://example.test/headphones.jpg");
    expect(img?.getAttribute("alt")).toBe("Wireless Headphones");
    expect(img?.getAttribute("loading")).toBe("lazy");
  });
});
