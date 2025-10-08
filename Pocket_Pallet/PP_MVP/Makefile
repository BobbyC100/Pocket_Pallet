.PHONY: help install setup dev test clean docker-up docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

setup: ## Run setup script
	@bash setup.sh

dev-backend: ## Start backend development server
	cd backend && uvicorn app.main:app --reload

dev-frontend: ## Start frontend development server
	cd frontend && npm run dev

dev-worker: ## Start Celery worker
	cd backend && celery -A app.services.celery worker --loglevel=info

test-backend: ## Run backend tests
	cd backend && pytest

test-frontend: ## Run frontend tests
	cd frontend && npm run test

lint-backend: ## Lint backend code
	cd backend && flake8 app/ && mypy app/

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

format-backend: ## Format backend code
	cd backend && black app/

format-frontend: ## Format frontend code
	cd frontend && prettier --write src/

clean: ## Clean up generated files
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf backend/dist backend/build
	rm -rf frontend/dist frontend/node_modules/.cache

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

db-migrate: ## Run database migrations
	cd backend && alembic upgrade head

db-rollback: ## Rollback last migration
	cd backend && alembic downgrade -1

db-reset: ## Reset database (WARNING: destroys all data)
	dropdb --if-exists pocket_pallet
	createdb pocket_pallet
	cd backend && alembic upgrade head

