SHELL := /bin/sh
.DEFAULT_GOAL := help

PNPM ?= pnpm
DOCKER_COMPOSE ?= docker compose

.PHONY: help install clean dev build preview test-unit test-e2e test-e2e-install lint format format-check typecheck verify docker-build docker-up-dev docker-up-prod docker-down docker-logs docker-ps

help:
	@echo "Available targets:"
	@echo "  install           Install dependencies with pnpm"
	@echo "  clean             Remove build, cache and node_modules artifacts"
	@echo "  dev               Start the development server on host"
	@echo "  build             Build the production bundle"
	@echo "  preview           Preview the production build"
	@echo "  test-unit         Run unit tests with Vitest"
	@echo "  test-e2e          Run end-to-end tests with Playwright"
	@echo "  test-e2e-install  Install Playwright Chromium"
	@echo "  lint              Run ESLint"
	@echo "  format            Format with Prettier"
	@echo "  format-check      Verify Prettier formatting"
	@echo "  typecheck         Type-check JS with tsc"
	@echo "  verify            Run lint, format:check, typecheck, unit tests and build"
	@echo "  docker-build      Build the production Docker image"
	@echo "  docker-up-dev     Start the dev profile in Docker on port 5173"
	@echo "  docker-up-prod    Build and start the prod profile in Docker on port 8080"
	@echo "  docker-down       Stop all Docker services"
	@echo "  docker-logs       Follow Docker logs"
	@echo "  docker-ps         List Docker services"

install:
	$(PNPM) install --frozen-lockfile

clean:
	rm -rf dist coverage playwright-report test-results src/css/output.css
	rm -rf node_modules

dev:
	$(PNPM) run dev

build:
	$(PNPM) run build

preview:
	$(PNPM) run preview

test-unit:
	$(PNPM) run test

test-e2e:
	$(PNPM) run test:e2e

test-e2e-install:
	$(PNPM) exec playwright install --with-deps chromium

lint:
	$(PNPM) run lint

format:
	$(PNPM) run format

format-check:
	$(PNPM) run format:check

typecheck:
	$(PNPM) run typecheck

verify:
	$(PNPM) run verify

docker-build:
	$(DOCKER_COMPOSE) --profile prod build prod

docker-up-dev:
	$(DOCKER_COMPOSE) --profile dev up -d dev

docker-up-prod:
	$(DOCKER_COMPOSE) --profile prod up -d --build prod

docker-down:
	$(DOCKER_COMPOSE) --profile dev --profile prod down

docker-logs:
	$(DOCKER_COMPOSE) --profile dev --profile prod logs -f

docker-ps:
	$(DOCKER_COMPOSE) --profile dev --profile prod ps