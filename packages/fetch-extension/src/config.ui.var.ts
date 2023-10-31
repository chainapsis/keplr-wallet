import { IntlMessages } from "./languages";
import { RegisterOption } from "@keplr-wallet/hooks";
import sendTokenIcon from "@assets/icon/send-token.png";
import claimTokenIcon from "@assets/icon/claim-token.png";
import autoCompoundIcon from "@assets/icon/auto-compound.png";
import closeIcon from "@assets/icon/close-grey.png";
import restartIcon from "@assets/icon/undo.png";

export const DEV_AUTH_CLIENT_ID = process.env["DEV_AUTH_CLIENT_ID"] || "";
export const PROD_AUTH_CLIENT_ID = process.env["PROD_AUTH_CLIENT_ID"] || "";
export const PROD_AMPLITUDE_API_KEY =
  process.env["PROD_AMPLITUDE_API_KEY"] || "";
export const DEV_AMPLITUDE_API_KEY = process.env["DEV_AMPLITUDE_API_KEY"] || "";
export const ETHEREUM_ENDPOINT =
  "https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341";

export const ADDITIONAL_SIGN_IN_PREPEND: RegisterOption[] | undefined =
  undefined;

export const ADDITIONAL_INTL_MESSAGES: IntlMessages = {};

// export const MESSAGING_SERVER = "http://localhost:4000/graphql";
// export const SUBSCRIPTION_SERVER = "ws://localhost:4000/subscription";
// export const AUTH_SERVER = "http://localhost:5500";

export const AUTH_SERVER = "https://auth-attila.sandbox-london-b.fetch-ai.com";

export const FNS_TEST_ADDRESS = "fetch1s84mudgmjfjmkef7ludqnwy0fchh3mf4p4rmll";

export const CHAIN_ID_DORADO = "dorado-1";
export const CHAIN_ID_FETCHHUB = "fetchhub-4";
export const GROUP_PAGE_COUNT = 30;
export const CHAT_PAGE_COUNT = 30;

let SUBSCRIPTION_SERVER, MESSAGING_SERVER;
export let NOTYPHI_BASE_URL: string;

if (process.env.NODE_ENV === "production") {
  SUBSCRIPTION_SERVER = "wss://messaging.fetch-ai.network/subscription";
  MESSAGING_SERVER = "https://messaging.fetch-ai.network/graphql";
  NOTYPHI_BASE_URL = "https://api.notyphi.com/v1";
} else {
  SUBSCRIPTION_SERVER =
    "wss://messaging-server.sandbox-london-b.fetch-ai.com/subscription";
  MESSAGING_SERVER =
    "https://messaging-server.sandbox-london-b.fetch-ai.com/graphql";
  NOTYPHI_BASE_URL = "https://api-staging.notyphi.com/v1";
}

const ACTIVITY_SERVER: { [key: string]: string } = {
  [CHAIN_ID_DORADO]: "https://subquery-dorado.fetch.ai/",
  [CHAIN_ID_FETCHHUB]: "https://subquery.fetch.ai/",
};

export const GRAPHQL_URL = {
  SUBSCRIPTION_SERVER,
  MESSAGING_SERVER,
  ACTIVITY_SERVER,
};

let FETCHHUB_AGENT, DORADO_AGENT;
let FETCHHUB_FEEDBACK, DORADO_FEEDBACK;

if (process.env.NODE_ENV === "production") {
  FETCHHUB_AGENT =
    "agent1qvmfez9k6fycllzqc6p7telhwyzzj709n32sc5x2q0ss62ehqc3e52qgna7";
  DORADO_AGENT =
    "agent1qdhydny2mmdntqn6dx3d3wpyukaq855j2yexl2f0z07d5esl76932mctpvf";
  FETCHHUB_FEEDBACK = "https://fetchbot.prod.fetch-ai.com/";
  DORADO_FEEDBACK = "https://fetchbot-dorado.prod.fetch-ai.com/";
} else {
  FETCHHUB_AGENT =
    "agent1qv5rmumv0xe0fqlmm3k4lxu4mhmz9aluy07tgp5lmzr2z0mccttcyjksf7r";
  DORADO_AGENT =
    "agent1qtvyuq8gkywtymym00n83llwcj6dscwfaz9dgdhm2dw0e9tqmkzq7tesse9";
  FETCHHUB_FEEDBACK =
    "https://fetchbot-uagent-staging-mainnet.sandbox-london-b.fetch-ai.com";
  DORADO_FEEDBACK =
    "https://fetchbot-uagent-staging.sandbox-london-b.fetch-ai.com";
}

export const AGENT_FEEDBACK_URL: { [key: string]: string } = {
  [CHAIN_ID_DORADO]: DORADO_FEEDBACK,
  [CHAIN_ID_FETCHHUB]: FETCHHUB_FEEDBACK,
};

export const AGENT_ADDRESS: { [key: string]: string } = {
  [CHAIN_ID_FETCHHUB]: FETCHHUB_AGENT,
  [CHAIN_ID_DORADO]: DORADO_AGENT,
};
// export const AGENT_ADDRESS =
//   "agent1qdh7x8k7se255j44dmt2yrpnxqdyn9qqt3dvcn4zy3dwq5qthl577v7njct";

export const AGENT_COMMANDS = [
  {
    command: "/transferFET",
    label: "transferFET (Transfer FET)",
    icon: sendTokenIcon,
    enabled: true,
  },
  {
    command: "/sendAsset",
    label: "sendAsset (Send a native or CW20 Asset)",
    icon: sendTokenIcon,
    enabled: true,
  },
  {
    command: "/ibcTransfer",
    label: "IBC Transfer (Transfer IBC assets cross chain)",
    icon: sendTokenIcon,
    enabled: true,
  },
  {
    command: "/autocompound",
    label: "autocompound (Auto-Compound Rewards)",
    icon: autoCompoundIcon,
    enabled: true,
  },
  {
    command: "/redeemFET",
    label: "redeemFET (Redeem Stake Rewards)",
    icon: claimTokenIcon,
    enabled: true,
  },
  {
    command: "/recurringPayments",
    label: "recurringPayments (schedule payments)",
    icon: restartIcon,
    enabled: true,
  },
  {
    command: "/recurringStakes",
    label: "recurringStakes (schedule stakes)",
    icon: restartIcon,
    enabled: true,
  },
  {
    command: "/tweet",
    label: "tweet (Share your tweet)",
    icon: require("@assets/icon/agent-tweet.svg"),
    enabled: false,
  },
  {
    command: "/cancelRecurringTransfer",
    label: "cancelRecurringTransfer (Cancel Automation)",
    icon: closeIcon,
    enabled: true,
  },
  {
    command: "/cancelRecurringStake",
    label: "cancelRecurringStake (Cancel Automation)",
    icon: closeIcon,
    enabled: true,
  },
  {
    command: "/cancelAutocompound",
    label: "cancelAutocompound (Cancel Automation)",
    icon: closeIcon,
    enabled: true,
  },
  {
    command: "/cancel",
    label: "cancel (Cancel Automation)",
    icon: closeIcon,
    enabled: true,
  },
];

export const FNS_CONFIG: {
  [key: string]: {
    network: "mainnet" | "testnet";
    rpc: string;
    contractAddress: string;
    isEditable: boolean;
  };
} = {
  [CHAIN_ID_DORADO]: {
    network: "testnet",
    rpc: "https://rpc-dorado.fetch.ai:443",
    contractAddress:
      "fetch15hq5u4susv7d064llmupeyevx6hmskkc3p8zvt8rwn0lj02yt72s88skrf",
    isEditable: true,
  },
  [CHAIN_ID_FETCHHUB]: {
    network: "mainnet",
    rpc: "https://rpc-fetchhub.fetch.ai:443",
    contractAddress:
      "fetch1cj7pfh3aqut6p2ursuqsgceadd2p09cqjklur485sce85tvw3zusy0fpy8",
    isEditable: true,
  },
};

export const TRANSACTION_APPROVED = "Transaction approved";
export const TRANSACTION_SENT = "Transaction sent";
export const TRANSACTION_SIGNED = "Transaction signed";
export const TRANSACTION_FAILED = "Transaction failed";
