---
description: Базовые правила монорепозитория — стек, архитектура страниц, стиль кода
alwaysApply: true
---

# Monorepo Guidelines

This document serves as a comprehensive development guidelines for working within the monorepo. It outlines architectural principles, technology stack, and best practices that ensure consistency, maintainability, and scalability across all projects.

## Technology Stack

- Framework — React 19 and TypeScript
- Styling — UI component library src/components and tailwind
- API Requests — @tanstack/react-query, entrypoint is src/trpc/react.tsx api
- Form Management — @tanstack/react-form
- Shared Utilities — Internal lib provides helper functions and utilities used throughout the codebase to promote code reuse and consistency.

## Core Development Guidelines

- Type Safety First — Use strict types, avoid assertions, and encode invariants in types
- Fail fast — Limit to three attempts per issue, then pause to reassess or seek clarification. Always keep all already existing code that did not work and clearly explain the problem you encountered.
- Prefer Proven Patterns — Follow established codebase patterns to stay consistent and leverage solutions that already work
- Ask for Clarification – If a user’s question or task is ambiguous or unclear, request clarification rather than making assumptions
- Write all comments in Russian — All code comments and TSDoc must be in Russian. Only comment on intent, constraints, trade-offs, or non-obvious decisions
- UI Construction — Prioritize src/components for base markup. We discourage custom CSS and allow it only if the components library cannot satisfy needs; always attempt to adjust the design to the library standard first. Write CSS only under user discretion.

### Page structure overview

Every page is built from segments and follows strict import discipline:

- layout.tsx - Layout that will be applied for all subpages
- page.tsx - Page itself
- \_lib folder - utils, hooks, components that page will need
  - components — UI presentation layer containing React components focused solely on rendering and user interface concerns. Can import from model, api and lib.
  - model — Business logic and state management including application state, form management, data transformations and any other product-specific logic. Can import from api, lib. Must not import components.
  - api — External data fetching and response transformation layer. Can import from lib. Must not import model or components.
  - lib — Helper functions and utilities operating on general, product-agnostic data. No imports from other segments allowed. (if functionality is general for all project, and should be reused in different parts of project - move to lib module in the top of the project), images and others
  - index.ts - optional only if functionality needs to be exported to different page
  - There is should NOT be other files or folders than that!

Every file should be named in camelCase (for modules) and in PascalCase (for components, according to component export title)
Except for base files like page.tsx layout.tsx
