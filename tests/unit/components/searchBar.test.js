import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSearchBar } from "../../../src/components/searchBar.js";

describe("createSearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * @param {HTMLInputElement | null} input
   * @param {string} value
   * @returns {void}
   */
  function typeInto(input, value) {
    if (!input) throw new Error("input not found");
    input.value = value;
    input.dispatchEvent(new Event("input"));
  }

  it("debounces onSearch calls", () => {
    const onSearch = vi.fn();
    const bar = createSearchBar({ onSearch, debounceMs: 200 });
    const input = bar.element.querySelector("input");

    typeInto(input, "phone");
    typeInto(input, "phone c");
    typeInto(input, "phone case");

    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("phone case");
  });

  it("trims whitespace before invoking onSearch", () => {
    const onSearch = vi.fn();
    const bar = createSearchBar({ onSearch, debounceMs: 100 });
    const input = bar.element.querySelector("input");

    typeInto(input, "   laptop   ");
    vi.advanceTimersByTime(100);

    expect(onSearch).toHaveBeenCalledWith("laptop");
  });

  it("getValue and clear operate on the input", () => {
    const bar = createSearchBar({ onSearch: () => {}, debounceMs: 50 });
    const input = bar.element.querySelector("input");

    typeInto(input, "tablet");
    expect(bar.getValue()).toBe("tablet");

    bar.clear();
    expect(bar.getValue()).toBe("");
  });
});
