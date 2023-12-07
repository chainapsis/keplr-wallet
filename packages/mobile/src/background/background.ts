import { init } from "@keplr-wallet/background";
import {
  RNEnv,
  RNMessageRequesterInternalToUI,
  RNRouterBackground,
} from "../router";
import { AsyncKVStore } from "../common";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { getRandomBytesAsync } from "../common";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { CommunityChainInfoRepo, EmbedChainInfos } from "../config";
import {
  getLastUsedLedgerDeviceId,
  setLastUsedLedgerDeviceId,
} from "../utils/ledger";

const router = new RNRouterBackground(RNEnv.produceEnv);

init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  new RNMessageRequesterInternalToUI(),
  EmbedChainInfos,
  ["https://wallet.keplr.app"],
  ["https://wallet.keplr.app"],
  CommunityChainInfoRepo,
  {
    rng: getRandomBytesAsync,
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
