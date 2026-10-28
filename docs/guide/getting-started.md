# Getting Started

This tutorial starts a project from `solophp/skeleton`, the JSON API starter, and adds a module of its own: notes, with a table, three endpoints and their tests. It takes about fifteen minutes, and every step follows the `Task` module that comes with the skeleton, so you can compare as you go.

## Requirements

- PHP 8.4 or later, with `pdo_sqlite`
- [Composer](https://getcomposer.org)

## Create the Project

```bash
composer create-project solophp/skeleton my-app
cd my-app
composer serve
```

`create-project` installs the packages, copies `.env.example` to `.env` and runs the migrations, which create a SQLite database in `storage/database/app.sqlite`. `composer serve` starts PHP's built-in server at `http://127.0.0.1:8000`. In a second terminal:

```bash
curl http://127.0.0.1:8000/
# {"data":{"name":"Solo Skeleton","status":"ok"}}

curl -X POST http://127.0.0.1:8000/tasks -H 'Content-Type: application/json' -d '{"title": "Try Solo"}'
curl http://127.0.0.1:8000/tasks
```

## Look Around

| Path | What it holds |
|---|---|
| `bootstrap/app.php` | Builds the application: loads `.env`, reads the providers, middleware and routes, and caches the routes in production. The web, `bin/migrate` and the tests all start here. |
| `config/providers.php` | Service providers, in order. They register what the container cannot build by itself, such as the database connection, the logger and the validator. |
| `config/middleware.php` | Global middleware, outermost first: errors, JSON bodies, routing. |
| `config/routes.php` | Every route, one line per module. |
| `src/Task/` | The module to copy: model, repository, inputs, controller, resource and routes. |
| `database/migrations/` | Forward-only migrations, applied in file name order. |
| `tests/Feature/` | Tests that send requests through the whole application. |

Everything else is built by the container from its constructor. A controller asks for a repository, the repository asks for the DBAL `Connection`, and the container passes each one in.

## Add a Module

The notes module has a title and a text, and three endpoints: `GET /notes`, `POST /notes` and `GET /notes/{id}`.

### 1. The Table

Migrations run once each, in file name order, so start the name with a date later than the existing ones. Create `database/migrations/2026_11_02_000001_create_notes_table.php`:

```php
<?php

declare(strict_types=1);

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Schema\Column;
use Doctrine\DBAL\Schema\PrimaryKeyConstraint;
use Doctrine\DBAL\Schema\Table;
use Doctrine\DBAL\Types\Types;

return static function (Connection $connection): void {
    $connection->createSchemaManager()->createTable(
        Table::editor()
            ->setUnquotedName('notes')
            ->setColumns(
                Column::editor()
                    ->setUnquotedName('id')
                    ->setTypeName(Types::INTEGER)
                    ->setAutoincrement(true)
                    ->create(),
                Column::editor()
                    ->setUnquotedName('title')
                    ->setTypeName(Types::STRING)
                    ->setLength(255)
                    ->create(),
                Column::editor()
                    ->setUnquotedName('body')
                    ->setTypeName(Types::TEXT)
                    ->create(),
                Column::editor()
                    ->setUnquotedName('created_at')
                    ->setTypeName(Types::DATETIME_IMMUTABLE)
                    ->create(),
            )
            ->setPrimaryKeyConstraint(PrimaryKeyConstraint::editor()->setUnquotedColumnNames('id')->create())
            ->create(),
    );
};
```

The DBAL schema API, rather than SQL, keeps the migration the same on SQLite, MySQL and PostgreSQL. Apply it:

```bash
composer migrate
# Migrated:
#   2026_11_02_000001_create_notes_table
```

### 2. The Model and the Repository

A note is a readonly class, one row of the table. Create `src/Note/Note.php`:

```php
<?php

declare(strict_types=1);

namespace App\Note;

use DateTimeImmutable;

final readonly class Note
{
    public function __construct(
        public int $id,
        public string $title,
        public string $body,
        public DateTimeImmutable $createdAt,
    ) {
    }
}
```

The repository extends `Solo\Repository\Repository`. Its `Mapping` names the table, the type of each column and how a row becomes a `Note`; in return, `read()` gives `find()`, `findBy()` and `count()`, and `insertGetId()`, `update()` and `delete()` write. `create()` adds the timestamp, as `TaskRepository` does. Create `src/Note/NoteRepository.php`:

```php
<?php

declare(strict_types=1);

namespace App\Note;

use DateTimeImmutable;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Types\Types;
use LogicException;
use Solo\Repository\Mapping;
use Solo\Repository\Repository;

/** @extends Repository<Note> */
final readonly class NoteRepository extends Repository
{
    public function __construct(Connection $connection)
    {
        parent::__construct($connection, new Mapping(
            table: 'notes',
            columns: [
                'id' => Types::INTEGER,
                'title' => Types::STRING,
                'body' => Types::TEXT,
                'created_at' => Types::DATETIME_IMMUTABLE,
            ],
            hydrate: self::hydrate(...),
        ));
    }

    /** @param array<string, mixed> $row */
    private static function hydrate(array $row): Note
    {
        /** @var array{id: int, title: string, body: string, created_at: DateTimeImmutable} $row */
        return new Note($row['id'], $row['title'], $row['body'], $row['created_at']);
    }

    /** @param array<string, mixed> $fields */
    public function create(array $fields): Note
    {
        $id = $this->insertGetId($fields + ['created_at' => new DateTimeImmutable()]);

        return $this->read()->find($id) ?? throw new LogicException("Note $id is missing right after its insert");
    }
}
```

No provider is needed: the constructor asks for the `Connection` that `DatabaseServiceProvider` registers, so the container builds the repository by itself.

### 3. The Input

An input class describes what a request may send. A field without a default is required, and one with a default may be left out; the rules in `#[Validate]` come from [solophp/validator](https://solophp.github.io/Validator/). Create `src/Note/Inputs/NoteStoreInput.php`:

```php
<?php

declare(strict_types=1);

namespace App\Note\Inputs;

use Solo\Input\Attributes\Input;
use Solo\Input\Attributes\Validate;

#[Input]
final readonly class NoteStoreInput
{
    public function __construct(
        #[Validate('required|string|max:255')]
        public string $title,
        #[Validate('string|max:10000')]
        public string $body = '',
    ) {
    }
}
```

When the body breaks a rule, building the input throws a `ValidationException`, and `ErrorMiddleware` answers with a 422 that lists the failed rules per field. The controller never sees invalid data.

### 4. The Controller and the Resource

A resource decides how a note looks in a response, so the JSON keeps its shape when the table changes. Create `src/Note/NoteResource.php`:

```php
<?php

declare(strict_types=1);

namespace App\Note;

use DateTimeInterface;

final class NoteResource
{
    /** @return array{id: int, title: string, body: string, created_at: string} */
    public static function make(Note $note): array
    {
        return [
            'id' => $note->id,
            'title' => $note->title,
            'body' => $note->body,
            'created_at' => $note->createdAt->format(DateTimeInterface::ATOM),
        ];
    }

    /**
     * @param list<Note> $notes
     * @return list<array{id: int, title: string, body: string, created_at: string}>
     */
    public static function collection(array $notes): array
    {
        return array_map(self::make(...), $notes);
    }
}
```

The controller stays thin: it turns the request into an input, hands it to the repository and writes the result with `JsonResponse`. A missing note is thrown as `NotFoundException`, and `ErrorMiddleware` answers with a 404. Create `src/Note/NoteController.php`:

```php
<?php

declare(strict_types=1);

namespace App\Note;

use App\Http\Exceptions\NotFoundException;
use App\Http\JsonResponse;
use App\Note\Inputs\NoteStoreInput;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Solo\Input\InputFactory;
use Solo\Input\Inputs;
use Solo\Router\UrlGenerator;

final readonly class NoteController
{
    public function __construct(
        private InputFactory $inputs,
        private NoteRepository $notes,
        private UrlGenerator $urls,
    ) {
    }

    public function index(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $notes = $this->notes->read()->findBy([], ['id' => 'DESC'], limit: 50);

        return JsonResponse::data($response, NoteResource::collection($notes));
    }

    /** @param array{id: string} $params */
    public function show(
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $params,
    ): ResponseInterface {
        $note = $this->notes->read()->find((int) $params['id']) ?? throw new NotFoundException();

        return JsonResponse::data($response, NoteResource::make($note));
    }

    public function store(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $input = $this->inputs->fromBody(NoteStoreInput::class, $request);
        $note = $this->notes->create(Inputs::toArray($input));

        return JsonResponse::data($response, NoteResource::make($note), 201)
            ->withHeader('Location', $this->urls->generate('notes.show', ['id' => $note->id]));
    }
}
```

`UrlGenerator` builds the `Location` header from the route's name, so it follows the route if its path changes.

### 5. The Routes

A module keeps its routes in its own class. Create `src/Note/NoteRoutes.php`:

```php
<?php

declare(strict_types=1);

namespace App\Note;

use Solo\Router\RouteCollector;

final class NoteRoutes
{
    public function register(RouteCollector $r): void
    {
        $r->group('/notes', function (RouteCollector $r): void {
            $r->get('', [NoteController::class, 'index'])->name('notes.index');
            $r->post('', [NoteController::class, 'store'])->name('notes.store');
            $r->get('/{id:\d+}', [NoteController::class, 'show'])->name('notes.show');
        });
    }
}
```

Then add one line to `config/routes.php`:

```php
use App\Home\HomeController;
use App\Note\NoteRoutes; // [!code ++]
use App\Task\TaskRoutes;
use Solo\Router\RouteCollector;

return function (RouteCollector $r): void {
    $r->get('/', HomeController::class)->name('home');

    (new TaskRoutes())->register($r);
    (new NoteRoutes())->register($r); // [!code ++]
};
```

`{id:\d+}` matches digits only, so `/notes/abc` is a 404 from the router before any controller runs.

### 6. Try It

With `composer serve` running:

```bash
curl -i -X POST http://127.0.0.1:8000/notes -H 'Content-Type: application/json' \
  -d '{"title": "Hello, Solo", "body": "My first module"}'
```

```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /notes/1

{"data":{"id":1,"title":"Hello, Solo","body":"My first module","created_at":"2026-11-02T10:00:00+00:00"}}
```

```bash
curl http://127.0.0.1:8000/notes
# {"data":[{"id":1,"title":"Hello, Solo","body":"My first module","created_at":"2026-11-02T10:00:00+00:00"}]}

curl -X POST http://127.0.0.1:8000/notes -H 'Content-Type: application/json' -d '{"body": "No title"}'
# {"error":"VALIDATION_FAILED","fields":{"title":[{"rule":"required"}]}}

curl http://127.0.0.1:8000/notes/99
# {"error":"NOT_FOUND"}
```

## Test It

Feature tests send requests through the whole application, middleware and routing included, without a server. `tests/TestCase.php` boots a new application for every test on a fresh in-memory SQLite database and runs the migrations, and gives three helpers: `request()` sends a request, with an array body as JSON; `json()` decodes a response; `data()` returns its `data`. Create `tests/Feature/NoteTest.php`:

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class NoteTest extends TestCase
{
    public function testCreateAndShow(): void
    {
        $response = $this->request('POST', '/notes', ['title' => 'Solo', 'body' => 'Small PSR packages']);

        self::assertSame(201, $response->getStatusCode());
        $id = $this->data($response)['id'] ?? null;
        self::assertIsInt($id);
        self::assertSame("/notes/$id", $response->getHeaderLine('Location'));

        $note = $this->data($this->request('GET', "/notes/$id"));
        self::assertSame('Small PSR packages', $note['body'] ?? null);
    }

    public function testTitleIsRequired(): void
    {
        $response = $this->request('POST', '/notes', ['body' => 'No title']);

        self::assertSame(422, $response->getStatusCode());
        self::assertSame([
            'error' => 'VALIDATION_FAILED',
            'fields' => ['title' => [['rule' => 'required']]],
        ], $this->json($response));
    }

    public function testIndexListsTheNewestFirst(): void
    {
        $this->request('POST', '/notes', ['title' => 'First']);
        $this->request('POST', '/notes', ['title' => 'Second']);

        $titles = array_column($this->data($this->request('GET', '/notes')), 'title');

        self::assertSame(['Second', 'First'], $titles);
    }
}
```

Run every check the skeleton has:

```bash
composer check   # PSR-12 with PHP_CodeSniffer, PHPStan at level max, then PHPUnit
```

The new module passes all three, PHPStan included: the types in the docblocks above are what keep it quiet at level max. `composer test`, `composer stan` and `composer cs` run them one at a time.

## Add Another Package

Each Solo package joins the application the same way: `composer require`, a provider, and a line in `config/providers.php`. Here, [solophp/event-dispatcher](https://github.com/SoloPHP/Event-Dispatcher#readme) logs every new note:

```bash
composer require solophp/event-dispatcher
```

An event is a plain object. Create `src/Note/NoteCreated.php`:

```php
<?php

declare(strict_types=1);

namespace App\Note;

final readonly class NoteCreated
{
    public function __construct(public Note $note)
    {
    }
}
```

The provider registers the PSR-14 dispatcher and its listeners. Create `src/Providers/EventServiceProvider.php`:

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use App\Note\NoteCreated;
use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\Log\LoggerInterface;
use Solo\Contracts\Container\WritableContainerInterface;
use Solo\EventDispatcher\EventDispatcher;
use Solo\EventDispatcher\ListenerProvider;

final class EventServiceProvider
{
    public function register(WritableContainerInterface $container): void
    {
        $container->set(EventDispatcherInterface::class, function (WritableContainerInterface $c) {
            $listeners = new ListenerProvider();

            $listeners->addListener(NoteCreated::class, function (NoteCreated $event) use ($c): void {
                $c->get(LoggerInterface::class)->info('Note {id} created', ['id' => $event->note->id]);
            });

            return new EventDispatcher($listeners);
        });
    }
}
```

Add it to `config/providers.php`:

```php
return [
    HttpServiceProvider::class,
    LoggingServiceProvider::class,
    DatabaseServiceProvider::class,
    InputServiceProvider::class,
    EventServiceProvider::class, // [!code ++]
];
```

`NoteController` now asks for the dispatcher by its PSR interface, and dispatches the event after the insert:

```php
use Psr\EventDispatcher\EventDispatcherInterface; // [!code ++]

final readonly class NoteController
{
    public function __construct(
        private InputFactory $inputs,
        private NoteRepository $notes,
        private UrlGenerator $urls,
        private EventDispatcherInterface $events, // [!code ++]
    ) {
    }

    public function store(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $input = $this->inputs->fromBody(NoteStoreInput::class, $request);
        $note = $this->notes->create(Inputs::toArray($input));
        $this->events->dispatch(new NoteCreated($note)); // [!code ++]

        // ...
    }
}
```

A new note now writes `Note 1 created` to `storage/logs/app.log`. The controller depends on `Psr\EventDispatcher\EventDispatcherInterface` only, so another PSR-14 dispatcher could take this one's place with a change to the provider alone.

## Deploy

- Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`. Production caches the routes in `storage/cache/routes.php`.
- Install without the development tools: `composer install --no-dev`.
- Point the web server's document root to `public/` and send every request to `public/index.php`.
- Run `composer migrate`, and delete `storage/cache/routes.php`, on each deploy. The next request builds the cache again.
- Make `storage/` writable by PHP.

The skeleton runs on MySQL and PostgreSQL too: set `DB_DRIVER` and the `DB_*` variables in `.env`, as `.env.example` shows.

## Next Steps

- `TaskIndexInput` and `TaskController::index()` in the skeleton show filters, search, sorting and pagination.
- [Input](https://solophp.github.io/Input/): casters, processors, nested inputs and partial updates.
- [Repository](https://solophp.github.io/Repository/): criteria, relations, translations and transactions.
- [Router](https://solophp.github.io/Router/) and [Application](https://solophp.github.io/Application/): route groups and middleware, the request lifecycle and the route cache.
- [Container](https://solophp.github.io/Container/): interface binding, lazy services and injection by id.
- [Packages](/packages): everything else Solo has, from caching to a job queue.
- [Inertia Starter](/guide/inertia): the same packages behind a Svelte front end.
