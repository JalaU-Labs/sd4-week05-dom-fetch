import { expect, test } from "@playwright/test";

const TOTAL_PRODUCTS = 24;
const PAGE_SIZE = 12;

/**
 * Builds a deterministic product fixture.
 *
 * @param {number} id
 * @returns {Record<string, unknown>}
 */
function buildProduct(id) {
  return {
    id,
    title: `Product ${id}`,
    description: `Description for product ${id}`,
    price: 10 + id,
    rating: 4.5,
    stock: 5,
    category: "test",
    thumbnail:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E",
  };
}

/**
 * Intercepts every DummyJSON request and serves deterministic fixtures.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<void>}
 */
async function installApiMock(page) {
  await page.route("https://dummyjson.com/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/products") {
      const limit = Number(url.searchParams.get("limit") ?? PAGE_SIZE);
      const skip = Number(url.searchParams.get("skip") ?? 0);
      const count = Math.max(0, Math.min(limit, TOTAL_PRODUCTS - skip));
      const products = Array.from({ length: count }, (_, index) => buildProduct(skip + index + 1));
      await route.fulfill({
        json: { products, total: TOTAL_PRODUCTS, skip, limit },
      });
      return;
    }

    if (url.pathname === "/products/search") {
      const query = (url.searchParams.get("q") ?? "").toLowerCase();
      const limit = Number(url.searchParams.get("limit") ?? PAGE_SIZE);
      const matched = Array.from({ length: TOTAL_PRODUCTS }, (_, index) =>
        buildProduct(index + 1),
      ).filter((product) => String(product.title).toLowerCase().includes(query));
      await route.fulfill({
        json: { products: matched.slice(0, limit), total: matched.length, skip: 0, limit },
      });
      return;
    }

    await route.continue();
  });
}

test.beforeEach(async ({ page }) => {
  await installApiMock(page);
  await page.goto("/");
});

test("renders the first page with twelve products and pagination", async ({ page }) => {
  await expect(page.locator("[data-product-id]")).toHaveCount(12);
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await expect(page.getByText("Requests: 1 | Cache entries: 1")).toBeVisible();
});

test("navigates to the next page", async ({ page }) => {
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.locator("[data-product-id]")).toHaveCount(12);
  await expect(page.getByText("Product 24")).toBeVisible();
});

test("filters products by search query after debounce", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search products" }).fill("Product 24");
  await expect(page.locator("[data-product-id]")).toHaveCount(1);
  await expect(page.getByText("Product 24")).toBeVisible();
  await expect(page.getByText("Page 1 of 1")).toBeVisible();
});

test("shows the empty state when no product matches", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search products" }).fill("zzz");
  await expect(page.getByText("No products match the current search.")).toBeVisible();
  await expect(page.locator("[data-product-id]")).toHaveCount(0);
});

test("serves visited pages from cache without new requests", async ({ page }) => {
  await expect(page.getByText("Requests: 1 | Cache entries: 1")).toBeVisible();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText("Requests: 2 | Cache entries: 2")).toBeVisible();

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await expect(page.getByText("Requests: 2 | Cache entries: 2")).toBeVisible();
});
