# Packages

Every package installs on its own with `composer require` and runs on PHP 8.3 or later, except Container, which needs PHP 8.4. A name links to the package's documentation: its own site, or its README on GitHub for a package without one. The version comes from Packagist and links there.

## Starters

Applications to start from, with `composer create-project`. Each one wires the packages together, has a module to copy and passes PHPUnit, PHPStan at level max and PSR-12.

| Starter | What it is | Version |
|---|---|---|
| [Skeleton](/guide/getting-started)<br>`solophp/skeleton` | A JSON API: CRUD modules under `src/Modules/`, input validation with a generated schema endpoint, SQLite, error handling, logging and feature tests | [![solophp/skeleton](https://img.shields.io/packagist/v/solophp/skeleton?label=)](https://packagist.org/packages/solophp/skeleton) |
| [Inertia Svelte Skeleton](/guide/inertia)<br>`solophp/inertia-svelte-skeleton` | Server-side routing and controllers with a single-page front end in Inertia.js 3, Svelte 5 and Vite | [![solophp/inertia-svelte-skeleton](https://img.shields.io/packagist/v/solophp/inertia-svelte-skeleton?label=)](https://packagist.org/packages/solophp/inertia-svelte-skeleton) |

## HTTP Kernel

From the incoming request to the emitted response.

| Package | What it does | Version |
|---|---|---|
| [Application](https://solophp.github.io/Application/)<br>`solophp/application` | PSR-15 kernel. Service providers fill the container, global middleware run outermost first, `RoutingMiddleware` matches the route, and the built router is cached in a PHP file. | [![solophp/application](https://img.shields.io/packagist/v/solophp/application?label=)](https://packagist.org/packages/solophp/application) |
| [Router](https://solophp.github.io/Router/)<br>`solophp/router` | Routes, groups, middleware and patterns such as `{id:\d+}`, compiled for matching into an immutable runtime. `UrlGenerator` builds a URL from a route's name. | [![solophp/router](https://img.shields.io/packagist/v/solophp/router?label=)](https://packagist.org/packages/solophp/router) |
| [Container](https://solophp.github.io/Container/)<br>`solophp/container` | PSR-11 container with autowiring, interface binding and lazy services on PHP 8.4 lazy objects. To PHPStan, `get(Foo::class)` is a `Foo`. | [![solophp/container](https://img.shields.io/packagist/v/solophp/container?label=)](https://packagist.org/packages/solophp/container) |
| [HTTP-Emitter](https://github.com/SoloPHP/HTTP-Emitter#readme)<br>`solophp/http-emitter` | Sends a PSR-7 response to the client: status line, headers, and the body in chunks. | [![solophp/http-emitter](https://img.shields.io/packagist/v/solophp/http-emitter?label=)](https://packagist.org/packages/solophp/http-emitter) |
| [Contracts](https://github.com/SoloPHP/Contracts#readme)<br>`solophp/contracts` | The interfaces the packages share where PSR has none: a writable container, a validator, an emitter, a job queue. | [![solophp/contracts](https://img.shields.io/packagist/v/solophp/contracts?label=)](https://packagist.org/packages/solophp/contracts) |

## Input

What the client sent, as typed values you can trust.

| Package | What it does | Version |
|---|---|---|
| [Input](https://solophp.github.io/Input/)<br>`solophp/input` | Typed, immutable request DTOs, built through their constructor from the query string, the body or an array. Attributes validate, cast and process each field. | [![solophp/input](https://img.shields.io/packagist/v/solophp/input?label=)](https://packagist.org/packages/solophp/input) |
| [Validator](https://solophp.github.io/Validator/)<br>`solophp/validator` | Rule strings such as `required\|string\|max:255`, compiled once. Strict about configuration, with one structured error per field. | [![solophp/validator](https://img.shields.io/packagist/v/solophp/validator?label=)](https://packagist.org/packages/solophp/validator) |

## Data

Reading and writing what the application keeps.

| Package | What it does | Version |
|---|---|---|
| [Repository](https://solophp.github.io/Repository/)<br>`solophp/repository` | Typed repositories over Doctrine DBAL: criteria arrays, your own readonly models, translations with a fallback, batch-loaded relations, stable pages with their total and transaction boundaries. | [![solophp/repository](https://img.shields.io/packagist/v/solophp/repository?label=)](https://packagist.org/packages/solophp/repository) |
| [Cache](https://solophp.github.io/Cache/)<br>`solophp/cache` | PSR-16 cache with file and Redis adapters. File writes publish atomically, a cached `false` or `null` is a hit, and an error mode decides whether a failing backend throws or falls back to a miss. | [![solophp/cache](https://img.shields.io/packagist/v/solophp/cache?label=)](https://packagist.org/packages/solophp/cache) |

## Infrastructure

The services around the request: configuration, logs, events, background jobs and calls to other APIs.

| Package | What it does | Version |
|---|---|---|
| [Logger](https://solophp.github.io/Logger/)<br>`solophp/logger` | PSR-3 logger for files shared by many processes, rotated by size, interval or calendar, and for standard error. Each record is one bounded line, plain, JSON or logfmt, with redacted keys and decorators for several destinations. | [![solophp/logger](https://img.shields.io/packagist/v/solophp/logger?label=)](https://packagist.org/packages/solophp/logger) |
| [Dotenv](https://solophp.github.io/Dotenv/)<br>`solophp/dotenv` | Zero-dependency `.env` loader: later files override earlier ones, variables the server already provides keep precedence, and typed accessors read the values. A malformed line fails at startup with its file and line, before any value is applied. | [![solophp/dotenv](https://img.shields.io/packagist/v/solophp/dotenv?label=)](https://packagist.org/packages/solophp/dotenv) |
| [Event-Dispatcher](https://solophp.github.io/Event-Dispatcher/)<br>`solophp/event-dispatcher` | PSR-14 event dispatcher with listener priorities, subscribers and stoppable events. A listener for a class or an interface receives its subtypes, and a listener failure reaches the caller unchanged, with an optional PSR-3 record of the listener that failed. | [![solophp/event-dispatcher](https://img.shields.io/packagist/v/solophp/event-dispatcher?label=)](https://packagist.org/packages/solophp/event-dispatcher) |
| [Job-Queue](https://solophp.github.io/Job-Queue/)<br>`solophp/job-queue` | Database-backed job queue on Doctrine DBAL for MySQL, MariaDB, PostgreSQL and SQLite: claims with ownership tokens and expiring leases, a retry policy and deadline stored with each job, and a long-running worker. | [![solophp/job-queue](https://img.shields.io/packagist/v/solophp/job-queue?label=)](https://packagist.org/packages/solophp/job-queue) |
| [Rate-Limiter](https://github.com/SoloPHP/Rate-Limiter#readme)<br>`solophp/rate-limiter` | Atomic per-key rate limits: fixed or renewable windows in Redis, where one Lua script checks and counts each hit, and an in-memory twin with the same contract for tests. | [![solophp/rate-limiter](https://img.shields.io/packagist/v/solophp/rate-limiter?label=)](https://packagist.org/packages/solophp/rate-limiter) |
| [HTTP-Client](https://solophp.github.io/HTTP-Client/)<br>`solophp/http-client` | Immutable PSR-18 client on Guzzle with a fluent API. Retries are opt-in and never repeat a POST the server may have processed, credentials go only to the origin of the base URI, files are attached only explicitly, and secrets are masked in logs and exceptions. | [![solophp/http-client](https://img.shields.io/packagist/v/solophp/http-client?label=)](https://packagist.org/packages/solophp/http-client) |
| [Session](https://github.com/SoloPHP/Session#readme)<br>`solophp/session` | Session handling with secure defaults: an idle timeout, fixation protection, and IP and User-Agent checks. | [![solophp/session](https://img.shields.io/packagist/v/solophp/session?label=)](https://packagist.org/packages/solophp/session) |

## Frontend

| Package | What it does | Version |
|---|---|---|
| [Inertia](https://solophp.github.io/Inertia/)<br>`solophp/inertia` | Inertia.js 3 server adapter for PSR-7 and PSR-15: pages, partial reloads, deferred, merge and once props, flash data, history encryption, server-side rendering and Precognition. | [![solophp/inertia](https://img.shields.io/packagist/v/solophp/inertia?label=)](https://packagist.org/packages/solophp/inertia) |

## Legacy

These packages are no longer developed. They stay on Packagist, so projects that use them keep installing them, but they get no fixes. New code should take the package in the last column.

| Package | Use instead |
|---|---|
| `solophp/framework` | [solophp/skeleton](/guide/getting-started) |
| `solophp/request-handler` | [solophp/input](https://solophp.github.io/Input/) |
| `solophp/base-repository` | [solophp/repository](https://solophp.github.io/Repository/) |
| `solophp/task-queue` | [solophp/job-queue](https://solophp.github.io/Job-Queue/) |
| `solophp/database`, `solophp/query-builder` | [Doctrine DBAL](https://www.doctrine-project.org/projects/dbal.html), with [solophp/repository](https://solophp.github.io/Repository/) |
| `solophp/configs`, `solophp/settings`, `solophp/storage`, `solophp/paginator`, `solophp/translate`, `solophp/formatter`, `solophp/flash-messages`, `solophp/image-uploader`, `solophp/utilities` | No successor |
