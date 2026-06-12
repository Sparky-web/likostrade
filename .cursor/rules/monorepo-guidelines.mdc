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

## Backend Guidelines

### Backend Technology Stack

- API Layer — tRPC v11 in src/server/api with superjson transformer. The frontend consumes it ONLY through src/trpc/react.tsx (client components) and src/trpc/server.ts (RSC)
- Validation — zod via zodRussian from the internal lib (zod with Russian validation messages). Every procedure input must be validated with it
- Database — Prisma. Schema in prisma/schema.prisma, client is generated into generated/prisma, singleton lives in src/server/db.ts and is exposed to procedures as ctx.db
- Auth — NextAuth v5 in src/server/auth; the session is injected into the tRPC context
- Configuration — @t3-oss/env-nextjs in src/env.js; environment variables are read only through ~/env

### Backend structure overview

The backend is a tRPC API organized by domain entities (categories, projects, videos, leads, files…) and follows strict layering:

- src/server/api/root.ts — appRouter composition: one key per entity, routers are registered manually
- src/server/api/routers/<entity>.ts — one router per domain entity, exported as <entity>Router
- src/server/api/lib — shared server helpers reused by several routers. They must be plain functions that receive PrismaClient/data as arguments, not import the db singleton directly
- src/server/api/trpc.ts — infrastructure: context, middlewares and procedure builders. Edit only to add context fields or new procedure tiers
- src/server/auth, src/server/db.ts — NextAuth and Prisma singletons; never instantiate PrismaClient or NextAuth elsewhere
- lib/server.ts — server-only barrel of the shared lib (integrations, e.g. sendTelegramMessage). Guarded by `import "server-only"`; put here generic server code that is reusable across entities and projects

Rules of thumb:

- No CRUD abstractions — every entity router writes its procedures explicitly with direct ctx.db calls (see projects.ts as the reference). The repetition of the simple get/getById/create/update/delete shape across entities is accepted and preferred over a generic table-router factory: each procedure stays readable, typed and independently changeable
- Validated inputs — every create/update input is a real zod schema of the entity's form fields (no z.unknown()/z.any() pass-through). Relation fields come in as arrays of ids and are mapped to Prisma connect (create) / set (update) explicitly inside the procedure
- Whitelisted filters — list procedures never accept raw Prisma where from the client. If the client needs filtering, expose an explicit schema of allowed fields and shapes (see getCategoriesInput in categories.ts)
- Access tiers — choose publicProcedure / protectedProcedure / adminProcedure per procedure, not per router. Reads may be public, write mutations default to protectedProcedure; relax to publicProcedure only deliberately (e.g. leads.create is a public form)
- No dead API surface — expose only procedures the frontend actually calls; remove endpoints that lose their last consumer (files has no create — uploads go through fileUploader.upload)
- Thin procedures — a procedure parses input, authorizes, calls db/helpers and shapes the response. Reusable business logic goes to src/server/api/lib; entity-agnostic server utilities go to lib/server; isomorphic utilities go to lib
- Errors — throw TRPCError with a proper code (NOT_FOUND, BAD_REQUEST, …). User-facing messages are written in Russian
- Side effects — notifications and other secondary effects (e.g. Telegram in leads.create) must not fail the main mutation: wrap them in try/catch and log the error
- Migrations — change prisma/schema.prisma and create a migration via `pnpm db:generate`; seeds and one-off maintenance live in scripts/
- Type flow — the frontend derives API types from RouterOutputs/RouterInputs (src/trpc/react.tsx) and never imports from src/server directly
- No raw process.env — new variables are added to the schema in src/env.js and read via ~/env
