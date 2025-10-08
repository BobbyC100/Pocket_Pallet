# Contributing to Pocket Pallet

Thank you for your interest in contributing to Pocket Pallet!

## Development Setup

1. Fork and clone the repository
2. Follow setup instructions in README.md
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Run tests and linting
6. Commit with clear messages
7. Push and create a pull request

## Code Style

### Backend (Python)
- Follow PEP 8
- Use type hints
- Format with Black
- Lint with Flake8
- Max line length: 100 characters

### Frontend (TypeScript)
- Use functional components with hooks
- Type everything (avoid `any`)
- Follow React best practices
- Use meaningful variable names
- Keep components small and focused

## Commit Messages

Use conventional commit format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat(api): add wine version history endpoint

- Implement GET /wines/{id}/versions
- Add pagination support
- Include author information
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm run test
```

## Questions?

Open an issue or contact the maintainers.

