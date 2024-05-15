import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const docs = [
  {
    label: 'obd',
    href: "https://github.com/oceanbase/obd"
  },
  {
    label: 'ob-operator',
    href: "https://oceanbase.github.io/ob-operator/"
  },
  {
    label: "Developer",
    href: "https://oceanbase.github.io/oceanbase/"
  },
  {
    label: "API Reference",
    href: "https://en.oceanbase.com/docs/common-oceanbase-database-10000000001228248",
  },
]

const config: Config = {
  title: 'OceanBase',
  tagline: 'OceanBase is an enterprise distributed relational database management system developed by Ant Group.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://powerfooi.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs-playground',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'powerfooi', // Usually your GitHub org/user name.
  projectName: 'docs-playground', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  trailingSlash: false,
  themeConfig: {
    algolia: {
      appId: 'QK0JZ42KY7',
      apiKey: '36bae2ea61a954b3c70a3ae5ef68dea7',
      indexName: 'powerfooiio',
      contextualSearch: true,
    },
    // Replace with your project's social card
    navbar: {
      title: 'OceanBase',
      logo: {
        alt: 'OceanBase Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          position: 'left',
          label: 'Quick Start',
          to: '/docs/tutorial/intro',
        },
        {
          position: "left",
          label: "Blogs",
          to: "/blog"
        },
        {
          type: 'dropdown',
          label: 'Documentations',
          position: 'left',
          items: docs,
        },
        {
          label: 'Downloads',
          position: 'left',
          href: "https://open.oceanbase.com/developer"
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/oceanbase',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'obd',
              to: 'docs/obd/what-is-obd',
            },
            {
              label: 'ob-operator',
              to: 'docs/ob-operator/what-is-ob-operator',
            },
            {
              label: 'Tutorial',
              to: 'docs/tutorial/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/oceanbase',
            },
            {
              label: 'Slack',
              href: 'https://oceanbase.slack.com/',
            },
            {
              label: 'Forum (in Chinese)',
              href: 'https://ask.oceanbase.com/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/oceanbase',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OceanBase, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
