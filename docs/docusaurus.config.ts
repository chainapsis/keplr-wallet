import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Keplr Docs",
  tagline: "Integrate Keplr into your dApp",
  favicon: "img/keplr-logo-256.png",

  url: "https://docs.keplr.app",
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  staticDirectories: ["public", "static"],

  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: "/api",
            to: "/api/intro",
          },
        ],
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/api",
          sidebarPath: "./sidebars.ts",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: "og:type",
        content: "website",
      },
      {
        name: "og:image",
        content: "https://docs.keplr.app/og-image.png",
      },
    ],
    navbar: {
      title: "Keplr",
      logo: {
        alt: "Keplr Logo",
        src: "img/keplr-logo-256.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/chainapsis/keplr-wallet",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Keplr",
          items: [
            {
              label: "Keplr",
              href: "https://www.keplr.app",
            },
            {
              label: "Keplr Dashboard",
              href: "https://wallet.keplr.app",
            },
          ],
        },
        {
          title: "Need Help?",
          items: [
            {
              label: "Keplr Helpdesk",
              href: "https://help.keplr.app/",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Keplr, Chainapsis`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
