import { init } from "@keplr-wallet/background";
import {
  RNEnv,
  RNMessageRequesterInternalToUI,
  RNRouterBackground,
} from "../router";
import { AsyncKVStore } from "../common";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { EmbedChainInfos } from "../config";
import {
  getLastUsedLedgerDeviceId,
  setLastUsedLedgerDeviceId,
} from "../utils/ledger";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {getRandomValues} from "react-native-crypto-polyfill";

const router = new RNRouterBackground(RNEnv.produceEnv);

init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  new RNMessageRequesterInternalToUI(),
  EmbedChainInfos,
  [
    "https://app.osmosis.zone",
    "https://www.stargaze.zone",
    "https://app.umee.cc",
    "https://junoswap.com",
    "https://frontier.osmosis.zone",
    "https://daodao.zone",
    "https://app.regen.network",
    "https://app.stride.zone",
  ],
  {
    rng: getRandomValues,
  },
  {
    create: (params: {
      iconRelativeUrl?: string;
      title: string;
      message: string;
    }) => {
      console.log(`Notification: ${params.title}, ${params.message}`);
    },
  },
  {
    defaultMode: "ble",
    transportIniters: {
      ble: async (deviceId?: string) => {
        const lastDeviceId = await getLastUsedLedgerDeviceId();

        if (!deviceId && !lastDeviceId) {
          throw new Error("Device id is empty");
        }

        if (!deviceId) {
          deviceId = lastDeviceId;
        }

        if (deviceId && deviceId !== lastDeviceId) {
          await setLastUsedLedgerDeviceId(deviceId);
        }

        return await TransportBLE.open(deviceId);
      },
    },
  },
  {
    suggestChain: {
      useMemoryKVStore: true,
    },
  }
);

router.listen(BACKGROUND_PORT);
