/**
 * Application entry point.
 * Bootstraps the UI once the DOM is fully parsed.
 *
 * @module main
 */

/**
 * Initializes the application.
 * Renders a confirmation message until the API integration is implemented.
 *
 * @returns {void}
 */
function bootstrap() {
  const app = document.querySelector("#app");

  if (!(app instanceof HTMLElement)) {
    console.error("#app element not found in the document.");
    return;
  }

  const message = document.createElement("p");
  message.className = "mt-4 text-slate-700";
  message.textContent = "Application skeleton loaded successfully.";
  app.appendChild(message);
}

bootstrap();