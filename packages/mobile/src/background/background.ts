import { init, ScryptParams } from "@keplr-wallet/background";
import { RNEnv, RNRouter } from "../router";
import { AsyncKVStore } from "../common";
import scrypt from "react-native-scrypt";
import { Buffer } from "buffer/";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { getRandomBytesAsync } from "../common";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { EmbedChainInfos } from "../config";
import { BleManager } from "react-native-ble-plx";
import {
  getLastUsedLedgerDeviceId,
  setLastUsedLedgerDeviceId,
} from "../utils/ledger";

const router = new RNRouter(RNEnv.produceEnv);

// TODO: Implement the KVStore for the react-native async storage.
init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  {
    // TODO: The message requester in the background services is used to emit the event like "keystore_changed" to the webpage.
    // But, it is not needed yet in the mobile environment.
    // So, just let it return undefined always and do nothing.
    // The message requester to the webpage should be implemented in future.
    sendMessage: async (_port: string, _msg: any): Promise<any> => {
      return undefined;
    },
  },
  EmbedChainInfos,
  [],
  getRandomBytesAsync,
  {
    scrypt: async (text: string, params: ScryptParams) => {
      return Buffer.from(
        await scrypt(
          Buffer.from(text).toString("hex"),
          // Salt is expected to be encoded as Hex
          params.salt,
          params.n,
          params.r,
          params.p,
          params.dklen,
          "hex"
        ),
        "hex"
      );
    },
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
  }
);

router.listen(BACKGROUND_PORT);
