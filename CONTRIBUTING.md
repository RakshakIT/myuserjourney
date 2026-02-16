# Contributing to MyUserJourney

Thank you for your interest in contributing to MyUserJourney! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/myuserjourney.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/myuserjourney.git
cd myuserjourney
npm install
cp .env.example .env
# Configure your .env file with database credentials
npm run db:push
npm run dev
```

The application will be available at `http://localhost:5000`.

### Environment Variables

See `.env.example` for all required and optional environment variables.

## How to Contribute

### Types of Contributions

- **Bug fixes** - Fix reported issues
- **New features** - Implement features from the roadmap or your own ideas
- **Documentation** - Improve docs, add examples, fix typos
- **Tests** - Add or improve test coverage
- **Performance** - Optimize queries, reduce bundle size, improve load times
- **Accessibility** - Improve keyboard navigation, screen reader support, ARIA labels

### Areas Where Help is Needed

- Docker deployment configuration
- Additional analytics visualizations
- Mobile responsive improvements
- Internationalization (i18n) support
- Additional privacy jurisdiction templates

## Code Style

### General Guidelines

- Use TypeScript for all new code
- Follow existing patterns and conventions in the codebase
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Frontend

- Use React functional components with hooks
- Use Shadcn UI components where possible
- Follow Tailwind CSS conventions
- Use TanStack React Query for data fetching
- Ensure dark/light theme compatibility

### Backend

- Use Express.js route handlers
- Validate inputs with Zod schemas
- Use the storage interface for database operations
- Handle errors gracefully with proper HTTP status codes

### Database

- Use Drizzle ORM for all database interactions
- Define schemas in `shared/schema.ts`
- Never write raw SQL unless absolutely necessary

## Pull Request Process

1. **Create a descriptive PR title** following the format: `[TYPE] Brief description`
   - Types: `FEATURE`, `FIX`, `DOCS`, `REFACTOR`, `PERF`, `TEST`

2. **Fill out the PR template** with:
   - Description of changes
   - Related issue numbers
   - Screenshots for UI changes
   - Testing steps

3. **Ensure your code:**
   - Builds without errors (`npm run build`)
   - Follows the existing code style
   - Includes appropriate error handling
   - Does not expose secrets or sensitive data
   - Respects GDPR/privacy requirements

4. **Wait for review** - Maintainers will review your PR and may request changes

## Reporting Bugs

Use the [Bug Report template](https://github.com/RakshakIT/myuserjourney/issues/new?template=bug_report.md) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behaviour
- Browser/OS information
- Screenshots if applicable
- Console errors if applicable

## Requesting Features

Use the [Feature Request template](https://github.com/RakshakIT/myuserjourney/issues/new?template=feature_request.md) and include:

- Clear description of the feature
- Use case and benefits
- Proposed implementation approach (optional)
- Mockups or wireframes (optional)

## Privacy and Compliance

When contributing, please ensure:

- No personal data is logged or exposed
- GDPR compliance is maintained
- Consent mechanisms are respected
- IP anonymization rules are followed
- No tracking without user consent

## Questions?

- Open a [Discussion](https://github.com/RakshakIT/myuserjourney/discussions) for general questions
- Check existing [Issues](https://github.com/RakshakIT/myuserjourney/issues) for known problems
- Review the [README](README.md) for setup instructions

Thank you for helping make MyUserJourney better!
