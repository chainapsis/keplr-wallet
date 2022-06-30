module.exports = {
  theme: "cosmos",
  title: "Keplr wallet",
  locales: {
    "/": {
      lang: "en-US",
    },
  },
  base: process.env.VUEPRESS_BASE || "/",
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/favicon-256.png" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:url", content: "https://docs.keplr.app" }],
    ["meta", { property: "og:title", content: "Documentation | Keplr Wallet" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Keplr is a non-custodial blockchain wallets for webpages that allow users to interact with blockchain applications.",
      },
    ],
    [
      "meta",
      { property: "og:image", content: "https://docs.keplr.app/og-image.png" },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],
  themeConfig: {
    custom: true,
    editLinks: false,
    repo: "chainapsis/keplr-wallet",
    docsRepo: "chainapsis/keplr-wallet",
    docsDir: "docs",
    logo: {
      src: "/Keplr_Black.png",
    },
    topbar: {
      banner: false,
    },
    sidebar: {
      auto: false,
      nav: [
        {
          title: "API",
          children: [
            {
              title: "Keplr API",
              directory: true,
              path: "/api",
            },
          ],
        },
      ],
    },
  },
  plugins: [
    [
      "sitemap",
      {
        hostname: "https://docs.keplr.app",
      },
    ],
  ],
  markdown: {
    extendMarkdown: (md) => {
      md.use(require("markdown-it-container"), "suggest-chain-example-table");
    },
  },
};
