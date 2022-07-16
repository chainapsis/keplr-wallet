import {
  EmbedChainInfos,
  KVStore,
  MessageRequesterInternalToUi,
  PrivilegedOrigins,
  produceEnv,
  RouterBackground,
} from "@obi-wallet/common";
import { init, ScryptParams } from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { Buffer } from "buffer";
import scrypt from "scrypt-js";

export function initBackground() {
  const router = new RouterBackground(produceEnv);

  init(
    router,
    (prefix: string) => new KVStore(prefix),
    new MessageRequesterInternalToUi(),
    EmbedChainInfos,
    PrivilegedOrigins,
    {
      rng: (array) => {
        return Promise.resolve(crypto.getRandomValues(array));
      },
      scrypt: async (text: string, params: ScryptParams) => {
        return await scrypt.scrypt(
          Buffer.from(text),
          Buffer.from(params.salt, "hex"),
          params.n,
          params.r,
          params.p,
          params.dklen
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
        // browser.notifications.create({
        //   type: "basic",
        //   iconUrl: params.iconRelativeUrl
        //     ? browser.runtime.getURL(params.iconRelativeUrl)
        //     : undefined,
        //   title: params.title,
        //   message: params.message,
        // });
      },
    }
    // TODO: ledgerOptions?
    // TODO: experimentalOptions?
  );

  router.listen(BACKGROUND_PORT);
}
