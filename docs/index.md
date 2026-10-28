---
layout: home

hero:
  name: SoloPHP
  text: Small PSR packages for PHP
  tagline: A router, a container, request DTOs, repositories and more, each one independent and replaceable. Use one, or all of them together.
  image:
    src: /logo.svg
    alt: SoloPHP
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Browse Packages
      link: /packages
    - theme: alt
      text: View on GitHub
      link: https://github.com/SoloPHP

features:
  - icon: 🧭
    title: HTTP kernel
    details: 'Application, Router, Container, HTTP-Emitter and Contracts: a PSR-15 pipeline, compiled routes and a PSR-11 container with autowiring.'
    link: /packages#http-kernel
    linkText: Kernel packages
  - icon: 📥
    title: Input
    details: 'Input and Validator: a request becomes a typed, immutable DTO, and invalid input one structured error per field.'
    link: /packages#input
    linkText: Input packages
  - icon: 🗄️
    title: Data
    details: 'Repository and Cache: typed repositories over Doctrine DBAL with batch-loaded relations, and a PSR-16 cache.'
    link: /packages#data
    linkText: Data packages
  - icon: 🧰
    title: Infrastructure
    details: 'Logger, Dotenv, Event-Dispatcher, Job-Queue, HTTP-Client and Session, on PSR-3, PSR-14 and PSR-18 where there is a standard.'
    link: /packages#infrastructure
    linkText: Infrastructure packages
  - icon: ⚡
    title: Frontend
    details: 'Inertia: Inertia.js 3 for any PSR-7 and PSR-15 application, with partial reloads, deferred props, SSR and Precognition.'
    link: /packages#frontend
    linkText: Inertia adapter
  - icon: 🚀
    title: Starters
    details: 'A JSON API and an Inertia + Svelte application that wire the packages together and pass PHPUnit, PHPStan at level max and PSR-12.'
    link: /guide/getting-started
    linkText: Start a project
---

<style>
/* On .VPHome, not :root: the build puts the theme's own :root defaults after this rule */
.VPHome {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #f59e0b 0%, #ec4899 35%, #8b5cf6 70%, #06b6d4 100%);
  --vp-home-hero-image-background-image: linear-gradient(135deg, #f59e0b30 0%, #ec489930 35%, #8b5cf630 70%, #06b6d430 100%);
  --vp-home-hero-image-filter: blur(44px);
}

.VPHero .VPImage {
  max-width: 200px;
  max-height: 200px;
}
</style>

## Quick Start

Start from one of the two starters. Each is a working application with a module to copy, tests and static analysis.

::: code-group

```bash [JSON API]
composer create-project solophp/skeleton my-app
cd my-app
composer serve    # http://127.0.0.1:8000
```

```bash [Inertia + Svelte]
composer create-project solophp/inertia-svelte-skeleton my-app
cd my-app
npm install
composer serve    # http://127.0.0.1:8000
npm run dev       # in a second terminal: Vite with hot reload
```

:::

Both need PHP 8.4 and Composer, and the Inertia starter also needs Node.js. [Getting Started](/guide/getting-started) walks through the JSON API starter, from the install to a module of your own with its tests; [Inertia Starter](/guide/inertia) covers the other one.

Or take a single package into any project:

```bash
composer require solophp/router
```

## The Idea

**Not a framework.** There is no core that every package depends on. Each package does one job and installs on its own. The starters are ordinary applications that put the packages together, and their code is yours to change.

**PSR at the seams.** The packages meet at PSR interfaces: PSR-7 and PSR-17 for HTTP messages, PSR-11 for the container, PSR-15 for middleware, PSR-3 for logging, PSR-14 for events, PSR-16 for caching and PSR-18 for HTTP clients. Where PSR has no interface, [solophp/contracts](https://github.com/SoloPHP/Contracts) adds one, such as a writable container or a validator. Any package can be replaced by another implementation of the same interface, and any PSR library works beside them.

**Explicit code.** Providers, middleware and routes are plain PHP files you read from top to bottom. A request becomes a typed, immutable DTO, a repository returns your own readonly models, and the starters pass PHPStan at level max.

## How the Packages Fit

One request through the JSON API starter:

```
public/index.php
└─ Application              PSR-15 kernel; service providers fill the Container
   ├─ ErrorMiddleware       your code: every exception below becomes a JSON error
   ├─ JsonBodyMiddleware    your code: a JSON body becomes getParsedBody()
   └─ RoutingMiddleware     Router matches the route, or throws a 404 / 405
      └─ TaskController     built by the Container, dependencies injected by type
         ├─ InputFactory    Input + Validator: the request becomes a TaskStoreInput, or throws a 422
         └─ TaskRepository  Repository on Doctrine DBAL: rows become Task models
→ the PSR-7 response, sent by HTTP-Emitter
```

Every name in that tree is a class you can open: the middleware and the controller live in the application, the rest in the packages.

## Requirements

- PHP 8.3 or later for the packages; [Container](https://solophp.github.io/Container/) and the starters need PHP 8.4.
- [Composer](https://getcomposer.org), and Node.js for the Inertia starter.
- Every package is released under the MIT License.
