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
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon-svg.svg" }],
  ],
  themeConfig: {
    custom: true,
    editLinks: true,
    repo: "chainapsis/keplr-extension",
    docsRepo: "chainapsis/keplr-extension",
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
  plugins: [],
};
