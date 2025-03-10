import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "intro/index",
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "getting-started/connect-to-keplr",
        "getting-started/typescript-support",
      ],
    },
    "use-with/cosmjs",
    "use-with/secretjs",
    {
      type: "category",
      label: "Guide",
      collapsed: false,
      items: [
        "guide/enable-connection",
        "guide/get-key",
        "guide/sign-a-message",
        "guide/broadcast-tx",
        "guide/suggest-chain",
        "guide/sign-arbitrary",
        "guide/custom-event",
      ],
    },
    {
      type: "category",
      label: "Multi-Ecosystem Support",
      collapsed: false,
      items: [
        "multi-ecosystem-support/evm",
        "multi-ecosystem-support/starknet",
      ],
    },
    {
      type: "category",
      label: "Keplr Mobile",
      collapsed: false,
      items: ["mobile/deeplink"],
    },
  ],
};

export default sidebars;
