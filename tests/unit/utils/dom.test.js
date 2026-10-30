import { describe, expect, it } from "vitest";

import { clearChildren, el, formatPrice, formatRating } from "../../../src/utils/dom.js";

describe("dom utilities", () => {
  it("creates an element with text, class and attributes", () => {
    const node = el("p", {
      className: "text-sm",
      text: "hello",
      attrs: { "data-role": "greeting" },
    });

    expect(node.tagName).toBe("P");
    expect(node.className).toBe("text-sm");
    expect(node.textContent).toBe("hello");
    expect(node.getAttribute("data-role")).toBe("greeting");
  });

  it("appends children in order", () => {
    const childA = el("span", { text: "a" });
    const childB = el("span", { text: "b" });
    const parent = el("div", { children: [childA, childB] });

    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]).toBe(childA);
    expect(parent.children[1]).toBe(childB);
  });

  it("clearChildren removes every child", () => {
    const parent = el("div", { children: [el("span"), el("span")] });
    clearChildren(parent);
    expect(parent.children).toHaveLength(0);
  });

  it("formats prices as USD", () => {
    expect(formatPrice(99)).toBe("$99.00");
  });

  it("formats ratings with one decimal", () => {
    expect(formatRating(4.567)).toBe("4.6");
  });
});
