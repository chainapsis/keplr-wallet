import { IntlMessages } from "./languages";
import { RegisterOption } from "@keplr-wallet/hooks";

export const AMPLITUDE_API_KEY = "";
export const ETHEREUM_ENDPOINT =
  "https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341";

export const ADDITIONAL_SIGN_IN_PREPEND:
  | RegisterOption[]
  | undefined = undefined;

export const ADDITIONAL_INTL_MESSAGES: IntlMessages = {};

// export const MESSAGING_SERVER = "http://localhost:4000/graphql";
// export const SUBSCRIPTION_SERVER = "ws://localhost:4000/subscription";
// export const AUTH_SERVER = "http://localhost:5500";

export const AUTH_SERVER = "https://auth-attila.sandbox-london-b.fetch-ai.com";

export const CHAIN_ID_DORADO = "dorado-1";
export const CHAIN_ID_FETCHHUB = "fetchhub-4";

export const GROUP_PAGE_COUNT = 30;
export const CHAT_PAGE_COUNT = 30;

let SUBSCRIPTION_SERVER, MESSAGING_SERVER;
if (process.env.NODE_ENV === "production") {
  SUBSCRIPTION_SERVER = "wss://messaging.fetch-ai.network/subscription";
  MESSAGING_SERVER = "https://messaging.fetch-ai.network/graphql";
} else {
  SUBSCRIPTION_SERVER =
    "wss://messaging-server.sandbox-london-b.fetch-ai.com/subscription";
  MESSAGING_SERVER =
    "https://messaging-server.sandbox-london-b.fetch-ai.com/graphql";
}

export const GRAPHQL_URL = { SUBSCRIPTION_SERVER, MESSAGING_SERVER };
