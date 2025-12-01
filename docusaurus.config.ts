import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const prod_docs = [
  { label: 'OceanBase Documents', href: 'https://en.oceanbase.com/docs' },
  {
    label: 'OBDeployer',
    href: 'https://en.oceanbase.com/docs/community-obd-en-10000000001181553',
  },
  { label: 'ob-operator', href: 'https://oceanbase.github.io/ob-operator/' },
];

const user_manual = [
  {
    label: 'Quick Starts (in English)',
    to: '/docs/user_manual/quick_starts/en-US/chapter_01_overview_of_the_oceanbase_database/overview',
  },
  {
    label: 'Quick Starts (in Chinese)',
    href: 'https://www.oceanbase.com/docs/community-tutorials-cn-1000000001390093',
  },
  {
    label: 'Operation And Maintenance Manual (in Chinese)',
    to: '/docs/user_manual/operation_and_maintenance/zh-CN/about_this_manual/overview',
  },
  {
    label: 'Operation And Maintenance Manual (in English)',
    to: '/docs/user_manual/operation_and_maintenance/en-US/about_this_manual/overview',
  },
];

const dev_manual = [
  {
    label: 'OceanBase Developer Guide',
    href: 'https://oceanbase.github.io/oceanbase/',
  },
  {
    label: 'MiniOB Developer Guide',
    href: 'https://oceanbase.github.io/miniob',
  },
];

const docs = [
  {
    label: 'Product Docs',
    href: 'https://en.oceanbase.com/docs',
    dropdownItems: prod_docs,
  },
  {
    label: 'User Manual',
    href: 'https://oceanbase.github.io',
    dropdownItems: user_manual,
  },
  {
    label: 'Developer Manual',
    href: 'https://oceanbase.github.io/oceanbase/',
    dropdownItems: dev_manual,
  },
];

const sigs = [
  { label: 'AI', to: '/docs/sig/AI/sig_intro' },
  { label: 'cloud-native', to: '/docs/sig/cloud-native/sig_intro' },
  { label: 'compilation', to: '/docs/sig/compilation/sig_intro' },
  { label: 'develop-tools', to: '/docs/sig/develop-tools/sig_intro' },
  { label: 'MiniOB', to: '/docs/sig/miniob/sig_intro' },
  { label: 'obdiag', to: '/docs/sig/obdiag/sig_intro' },
  { label: 'operation', to: '/docs/sig/operation/sig_intro' },
];

const community = [
  {
    label: 'Special Interest Group(SIG)',
    href: '/docs/sig/overview/list',
  },
  {
    label: 'Community Honors',
    href: '/docs/honor/overview',
  },
  {
    label: 'GitHub Discussion',
    href: 'http://github.com/oceanbase/oceanbase/discussions',
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/74cF8vbNEs',
  },
  {
    label: 'Forum (in Chinese)',
    href: 'https://ask.oceanbase.com/',
  },
  {
    label: 'Stack Overflow',
    href: 'https://stackoverflow.com/questions/tagged/oceanbase',
  },
];

const config: Config = {
  title: 'OceanBase',
  tagline:
    'OceanBase is an enterprise distributed relational database management system developed by Ant Group.',
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

  // Even if you don't use internationalization, you can use this field to
  // set useful metadata like html lang. For example, if your site is
  // Chinese, you may want to replace "en" with "zh-Hans".
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
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-H4XM2M50RX',
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
        {
          position: 'left',
          label: 'Blogs',
          to: 'docs/blogs/arch/all-in-one',
        },
        {
          type: 'dropdown',
          label: 'Docs',
          position: 'left',
          items: docs,
        },
        {
          type: 'dropdown',
          label: 'Community',
          position: 'left',
          items: community,
          // to: "/docs/sig/obdiag/intro"
        },
        {
          label: 'Data + AI',
          type: 'dropdown',
          position: 'left',
          items: [
            {
              label: 'AI Workshops',
              href: 'https://oceanbase-devhub.github.io',
            },
            {
              label: 'RAG Bot',
              href: 'https://oceanbase-devhub.github.io/ai-workshop-2024',
            },
            {
              label: 'Dify (MySQL Compatible)',
              href: 'https://oceanbase-devhub.github.io/dify/dify@oceanbase-workshop',
            },
            {
              label: 'DB-GPT',
              href: 'https://oceanbase-devhub.github.io/DB-GPT/docker/compose_examples/ob_dbgpt_tutorial',
            },
          ],
        },
        {
          label: 'Downloads',
          position: 'left',
          href: 'https://en.oceanbase.com/softwarecenter',
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
          title: 'SIG',
          items: sigs,
        },
        {
          title: 'More',
          items: [
            {
              label: 'About OceanBase',
              href: 'https://en.oceanbase.com/about',
            },
            {
              label: 'Blogs',
              to: 'docs/blogs/arch/all-in-one',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/oceanbase/oceanbase',
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
};

export default config;
