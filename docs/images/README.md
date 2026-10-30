# Network Evidence Screenshots

This directory contains the browser Developer Tools evidence required by the Week 05 laboratory. The screenshots must be taken from the deployed application, not from a local development server, so that they reflect the same artifact that CI publishes.

## Required files

| File                       | Scenario                                                                                     | DevTools filter |
| -------------------------- | -------------------------------------------------------------------------------------------- | --------------- |
| `network-initial-load.png` | First load of the deployed URL, showing one `/products` request                              | `dummyjson.com` |
| `network-pagination.png`   | After clicking "Next", showing a second `/products` request with `skip=12`                   | `dummyjson.com` |
| `network-search.png`       | After typing a query in the search box, showing one `/products/search` request               | `dummyjson.com` |
| `network-empty.png`        | After typing a query with no matches, showing the empty `products` array in the Response tab | `dummyjson.com` |

## How to capture

1. Open the deployed URL in Chromium, Chrome, Edge, or Brave.
2. Open Developer Tools with `F12` or `Ctrl+Shift+I`.
3. Switch to the **Network** tab.
4. Enable **Preserve log** so that requests are not cleared during navigation.
5. Type `dummyjson.com` in the filter bar.
6. Reproduce the scenario described in the table.
7. Take a screenshot of the DevTools panel that shows both the request row and, where possible, the **Response** tab with the JSON payload.
8. Save the screenshot as PNG in this directory with the exact filename from the table.

Screenshots must be legible at 100% zoom. Avoid dark mode if the text becomes hard to read in the PDF.

The PDF in `docs/documentation.pdf` embeds these images. Regenerate the PDF with `make docs` after adding or replacing any screenshot.
