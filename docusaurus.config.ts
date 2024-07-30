import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const docs = [
  {
    label: 'obd',
    href: "https://en.oceanbase.com/docs/community-obd-en-10000000001181553"
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
  {
    label: "User Best Practices",
    to: '/docs/about_oceanbase/overview',
  },
  {
    label: "MiniOB ",
    href: "https://oceanbase.github.io/miniob",
  },
]

const config: Config = {
  title: 'OceanBase',
  tagline: 'OceanBase is an enterprise distributed relational database management system developed by Ant Group.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://oceanbase.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'oceanbase', // Usually your GitHub org/user name.
  projectName: 'oceanbase.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
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
            'https://github.com/oceanbase/oceanbase.github.io/tree/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/oceanbase/oceanbase.github.io/tree/main/blog',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All posts',
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
      appId: '6JQM9QDU5V',
      apiKey: '75f5591a502e47777a08a02b96bc09a1',
      indexName: 'oceanbaseio',
      contextualSearch: false,
      searchPagePath: false,
    },
    // Replace with your project's social card
    navbar: {
      title: 'OceanBase',
      logo: {
        alt: 'OceanBase Logo',
        src: 'img/logo.png',
      },
      items: [
        // {
        //   position: 'left',
        //   label: 'Quick Start',
        //   to: '/docs/tutorial/intro',
        // },
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
          href: "https://en.oceanbase.com/softwarecenter"
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
              href: 'https://en.oceanbase.com/docs/community-obd-en-10000000001181553',
            },
            {
              label: 'ob-operator',
              href: 'https://oceanbase.github.io/ob-operator/',
            },
            {
              label: 'Developer',
              href: 'https://oceanbase.github.io/oceanbase/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussion',
              href: 'http://github.com/oceanbase/oceanbase/discussions',
            },
            {
              label: 'Slack',
              href: 'https://join.slack.com/t/oceanbase/shared_invite/zt-1e25oz3ol-lJ6YNqPHaKwY_mhhioyEuw',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/oceanbase',
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
