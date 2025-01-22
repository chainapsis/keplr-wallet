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
    {
      type: "category",
      label: "Guide",
      collapsed: false,
      items: [
        "guide/enable-connection",
        "guide/get-key",
        "guide/sign-a-message",
        "guide/broadcast-tx",
        "guide/sign-arbitrary",
      ],
    },
    "cosmjs",
    "secretjs",
    "suggest-chain",
    "evm",
    "starknet",
  ],
};

export default sidebars;
