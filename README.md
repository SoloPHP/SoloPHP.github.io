# solophp.github.io

The source of [solophp.github.io](https://solophp.github.io/), the home page of [SoloPHP](https://github.com/SoloPHP): what Solo is, the package catalog, and the guides to the two starters.

The site is built with [VitePress](https://vitepress.dev) from `docs/`, and `.github/workflows/docs.yml` deploys it to GitHub Pages on every push to `main` that changes `docs/`.

## Run It Locally

```bash
cd docs
npm install
npm run dev       # http://localhost:5173
npm run build     # into docs/.vitepress/dist
```

## Where the Package Docs Live

Each package publishes its own documentation from its own repository, as a project site under this domain: [Application](https://solophp.github.io/Application/), [Router](https://solophp.github.io/Router/), [Container](https://solophp.github.io/Container/), [Input](https://solophp.github.io/Input/), [Validator](https://solophp.github.io/Validator/), [Repository](https://solophp.github.io/Repository/), [Inertia](https://solophp.github.io/Inertia/).

A project site is served at `/<Repository>/` beside this site, so no page or folder here may take the name of a repository. This site links to the package docs by their full URLs.
