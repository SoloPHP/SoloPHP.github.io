import { defineConfig } from 'vitepress'

// The user site, served at the root of solophp.github.io. Each package publishes its own docs as a
// project site at /<Repository>/ beside it, so no page or folder here may take a repository's name.
const packageDocs = [
  { text: 'Application', link: 'https://solophp.github.io/Application/' },
  { text: 'Router', link: 'https://solophp.github.io/Router/' },
  { text: 'Container', link: 'https://solophp.github.io/Container/' },
  { text: 'Input', link: 'https://solophp.github.io/Input/' },
  { text: 'Validator', link: 'https://solophp.github.io/Validator/' },
  { text: 'Repository', link: 'https://solophp.github.io/Repository/' },
  { text: 'Inertia', link: 'https://solophp.github.io/Inertia/' }
]

export default defineConfig({
  title: 'SoloPHP',
  description: 'Small, independent PSR packages for PHP. Use one, or all of them together.',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#8b5cf6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'SoloPHP' }],
    ['meta', { property: 'og:description', content: 'Small, independent PSR packages for PHP. Use one, or all of them together.' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'Inertia Starter', link: '/guide/inertia' },
      { text: 'Packages', link: '/packages' },
      {
        text: 'Docs',
        items: packageDocs
      },
      {
        text: 'Links',
        items: [
          { text: 'GitHub', link: 'https://github.com/SoloPHP' },
          { text: 'Packagist', link: 'https://packagist.org/packages/solophp/' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Starters',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Inertia Starter', link: '/guide/inertia' }
        ]
      },
      {
        text: 'Packages',
        items: [
          { text: 'HTTP Kernel', link: '/packages#http-kernel' },
          { text: 'Input', link: '/packages#input' },
          { text: 'Data', link: '/packages#data' },
          { text: 'Infrastructure', link: '/packages#infrastructure' },
          { text: 'Frontend', link: '/packages#frontend' },
          { text: 'Legacy', link: '/packages#legacy' }
        ]
      },
      {
        text: 'Package Docs',
        collapsed: true,
        items: packageDocs
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SoloPHP' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 SoloPHP'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/SoloPHP/SoloPHP.github.io/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
