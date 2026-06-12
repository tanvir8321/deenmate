# Contributing to DeenMate

Thank you for your interest in contributing to DeenMate!

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `composer install`
4. Run `pnpm install`
5. Run `php artisan key:generate`
6. Run `php artisan migrate`
7. Run `php artisan test` to verify the setup

For local development with Docker:
```bash
docker compose up -d
```

## Coding Standards

We use several tools to maintain code quality:

- **PHP**: Laravel Pint for formatting, PHPStan for static analysis
- **JavaScript**: ESLint + Prettier

Run before committing:
```bash
./vendor/bin/pint
./vendor/bin/phpstan analyse
pnpm lint && pnpm format
php artisan test
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`feat/your-feature-name`)
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request with a clear description

## Religious Content Guidelines

Any changes to religious content (duas, adhkar, Quran text) require:
- A cited source (book + reference number)
- A second reviewer approval
- Description of the scholarly source used

## Issue Types

- **bug**: Something is not working
- **feature**: New functionality request
- **content-correction**: Error in religious content with citation
- **translation**: Language file improvements

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 license.