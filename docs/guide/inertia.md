# Inertia Starter

`solophp/inertia-svelte-skeleton` builds a single-page application the way you would build a server-rendered one. Routing, controllers, validation and the database stay on the server; the pages are [Svelte 5](https://svelte.dev) components, and [Inertia.js 3](https://inertiajs.com) moves between them without full page loads. There is no API to design: a controller renders a page with its props, or redirects.

It is built on the same packages as the [JSON API starter](/guide/getting-started), with [solophp/inertia](https://solophp.github.io/Inertia/) as the server side of Inertia.

## Requirements

- PHP 8.4 or later, with `pdo_sqlite` for the default database, or `pdo_mysql` / `pdo_pgsql`
- [Composer](https://getcomposer.org)
- Node.js 20.19+, 22.12+ or 24+, for Vite

## Create the Project

```bash
composer create-project solophp/inertia-svelte-skeleton my-app
cd my-app
npm install
```

`create-project` copies `.env.example` to `.env`, fills in `APP_KEY` and runs the migrations. Then start PHP and Vite, each in its own terminal:

```bash
composer serve   # http://127.0.0.1:8000
```

```bash
npm run dev      # the Vite dev server, with hot module replacement
```

Open `http://127.0.0.1:8000`. While `npm run dev` runs, the pages load their scripts from Vite; without it, from the last `npm run build`.

## What You Get

One module, a task list, shows the parts of Inertia working together:

- **Forms that check as you type.** A field is validated by the server's own rules while the user types (Precognition), and a form that fails on submit gets its errors back after the redirect.
- **Redirects with messages.** A saved form redirects, and the layout shows the message from the next page's flash data.
- **Partial reloads.** The search and the filter reload only the list, not the whole page.
- **Deferred and once props.** The statistics load right after the page, in a request of their own, and the navigation is sent once and kept by the client.
- **Security without a session.** Forms are checked for an `XSRF-TOKEN`, and errors and messages cross the redirect in a cookie signed with `APP_KEY`.

| Package | Role here |
|---|---|
| [solophp/inertia](https://solophp.github.io/Inertia/) | Pages, redirects with errors and messages, deferred and once props, Precognition, the Inertia protocol |
| [@inertiajs/svelte](https://inertiajs.com), [Svelte 5](https://svelte.dev), [Vite](https://vite.dev) | The client: pages, links, forms and partial reloads; the dev server and the build |
| [solophp/application](https://solophp.github.io/Application/), [solophp/router](https://solophp.github.io/Router/), [solophp/container](https://solophp.github.io/Container/) | The PSR-15 kernel, routes and the URLs made from their names, the container |
| [solophp/input](https://solophp.github.io/Input/), [solophp/validator](https://solophp.github.io/Validator/) | Typed form inputs and the rules behind `#[Validate]` |
| [solophp/repository](https://solophp.github.io/Repository/) | The `tasks` table |
| [solophp/logger](https://github.com/SoloPHP/Logger#readme), [solophp/dotenv](https://github.com/SoloPHP/Dotenv#readme), [solophp/http-emitter](https://github.com/SoloPHP/HTTP-Emitter#readme) | Logging, `.env`, sending the response |

Next to the layout of the JSON API starter, the project has `resources/` for the front end: `views/app.php` is the HTML document of a first visit, `js/app.js` the client's entry point, `js/Layouts/AppLayout.svelte` the layout of every page, and `js/Pages/` one Svelte component per page.

## How a Page Is Served

1. The first visit is a plain browser request. The controller renders a page, such as `Tasks/Index` with its props, and the answer is `resources/views/app.php` with the page object in a script element.
2. The client mounts `resources/js/Pages/Tasks/Index.svelte` with those props. From then on, a link or a form is an XHR with an `X-Inertia: true` header, and the answer is the next page object as JSON.
3. A form posts JSON. The controller reads it into an input class: invalid input throws, and `ErrorMiddleware` redirects back to the form with the messages in its `errors` prop. Valid input is saved, and the controller redirects with a message.
4. `InertiaMiddleware` keeps the protocol for every response: a client built from older assets gets a `409` and reloads the page, and a redirect after a `PATCH` or `DELETE` becomes a `303`, so the browser follows it with a GET.

## Add a Page

An About page takes a route, a controller, a Svelte component and a test.

Add the route to `config/routes.php`:

```php
use App\About\AboutController; // [!code ++]
use App\Home\HomeController;
use App\Task\TaskRoutes;
use Solo\Router\RouteCollector;

return function (RouteCollector $r): void {
    $r->get('/', HomeController::class)->name('home');
    $r->get('/about', AboutController::class)->name('about'); // [!code ++]

    (new TaskRoutes())->register($r);
};
```

The controller renders the `About` component with its props. A page gets every URL it needs as a prop, made from a route name. Create `src/About/AboutController.php`:

```php
<?php

declare(strict_types=1);

namespace App\About;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Solo\Inertia\Inertia;
use Solo\Router\UrlGenerator;

final readonly class AboutController
{
    public function __construct(
        private Inertia $inertia,
        private UrlGenerator $urls,
    ) {
    }

    public function __invoke(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        return $this->inertia->render($request, $response, 'About', [
            'php' => PHP_VERSION,
            'tasksUrl' => $this->urls->generate('tasks.index'),
        ]);
    }
}
```

The component takes the props with `$props()`. Create `resources/js/Pages/About.svelte`:

```svelte
<script>
    import { Link } from '@inertiajs/svelte'

    let { php, tasksUrl } = $props()
</script>

<svelte:head>
    <title>About</title>
</svelte:head>

<h1>About</h1>
<p>This page is a Svelte component, rendered by AboutController on PHP {php}.</p>
<Link href={tasksUrl}>Back to the tasks</Link>
```

The tests send requests as the browser and the client do. `inertia()` makes an Inertia visit, `page()` reads the page object from the answer, and `props()` its props. Create `tests/Feature/AboutTest.php`:

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class AboutTest extends TestCase
{
    public function testAboutPage(): void
    {
        $page = $this->page($this->inertia('GET', '/about'));

        self::assertSame('About', $page['component']);
        self::assertSame('/tasks', self::props($page)['tasksUrl']);
    }
}
```

Open `http://127.0.0.1:8000/about`, or run the checks below. To show the page in the navigation, add a link to `nav` in `src/Http/Middleware/SharedPropsMiddleware.php`, and to the links that `HomeTest` expects.

## Forms

A form needs an input class with `#[Validate]` rules and a handler that redirects; when the input is invalid, the errors find their way back to the form by themselves. The task form's input is `src/Task/Inputs/TaskStoreInput.php`:

```php
#[Input]
final readonly class TaskStoreInput
{
    public function __construct(
        #[Validate('required|string|min:3|max:255')]
        public string $title,
        #[Validate('boolean')]
        public bool $done = false,
    ) {
    }
}
```

To validate a field while the user types, the route names its input class and runs under `PrecognitionMiddleware`, as in `src/Task/TaskRoutes.php`. The middleware answers a precognitive request with a `204` or a `422` for the fields it asks about, and never runs the handler:

```php
$r->group('/tasks', function (RouteCollector $r): void {
    $r->post('', [TaskController::class, 'store'])
        ->name('tasks.store')
        ->attribute('input', TaskStoreInput::class);
    // ...
}, middlewares: [PrecognitionMiddleware::class]);
```

On the client, a form made with a method and a URL is precognitive, as in `resources/js/Pages/Tasks/Index.svelte`:

```svelte
<script>
    import { useForm } from '@inertiajs/svelte'

    let { urls } = $props()

    const form = useForm('post', () => urls.store, { title: '' }).setValidationTimeout(400)
</script>

<input bind:value={form.title} oninput={() => form.validate('title')}>
{#if form.errors.title}
    <p class="field-error">{form.errors.title}</p>
{/if}
```

## Tests and Build

```bash
composer check   # PSR-12, PHPStan at level max, then PHPUnit
npm run build    # the production build, into public/build
```

The tests do not need a build: they use a manifest of their own in `tests/Fixtures`.

## Deploy

- Run `npm run build` and deploy `public/build` with the code.
- Set `APP_ENV=production`, `APP_DEBUG=false` and an `APP_KEY` of your own; `composer key` makes one.
- Point the web server's document root to `public/` and send every request for a file that does not exist to `public/index.php`.
- Delete `storage/cache/routes.php` on each deploy. The next request builds it again.
- Make `storage/` writable by PHP.

## Inertia Without the Starter

`solophp/inertia` works in any PSR-7 and PSR-15 application; the starter is one way to wire it. Its [documentation](https://solophp.github.io/Inertia/) covers the installation, every kind of prop, flash data, history encryption, server-side rendering and Precognition, and an upgrade guide from 1.x.
