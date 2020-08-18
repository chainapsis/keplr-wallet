import { Ledger } from "./ledger";

import PQueue from "p-queue";
import delay from "delay";

import { sendMessage } from "../../common/message/send";
import { POPUP_PORT } from "../../common/message/constant";
import { LedgerInitFailedMsg } from "./foreground";
import { AsyncWaitGroup } from "../../common/async-wait-group";
import { closeWindow, openWindow } from "../../common/window";
import { KVStore } from "../../common/kvstore";

const Buffer = require("buffer/").Buffer;

export class LedgerKeeper {
  private readonly pQueue: PQueue = new PQueue({
    concurrency: 1
  });

  private readonly initWG: AsyncWaitGroup = new AsyncWaitGroup();

  constructor(private readonly kvStore: KVStore) {}

  private async getCachedPublicKey(id: string): Promise<Uint8Array> {
    const cached = await this.kvStore.get<string>(`${id}-publicKeyHex`);
    if (cached) {
      return Buffer.from(cached, "hex");
    } else {
      return new Uint8Array(0);
    }
  }

  private async setCachedPublicKey(
    id: string,
    publicKey: Uint8Array
  ): Promise<void> {
    await this.kvStore.set(
      `${id}-publicKeyHex`,
      Buffer.from(publicKey).toString("hex")
    );
  }

  async getPublicKey(id: string): Promise<Uint8Array> {
    const cached = await this.getCachedPublicKey(id);
    if (cached.length > 0) {
      return cached;
    }

    return await this.pQueue.add(async () => {
      const ledger = await this.initLedger();

      const publicKey = await ledger.getPublicKey([44, 118, 0, 0, 0]);
      this.setCachedPublicKey(id, publicKey);

      return publicKey;
    });
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return await this.pQueue.add(async () => {
      const ledger = await this.initLedger();

      // TODO: Check public key is matched?

      return await ledger.sign([44, 118, 0, 0, 0], message);
    });
  }

  async initLedger(): Promise<Ledger> {
    while (true) {
      try {
        this.initWG.add();
        return await Ledger.init();
      } catch (e) {
        console.log(e);
        await this.notifyNeedInitializeLedger();

        await Promise.race([
          this.initWG.wait(),
          (async () => {
            // If ledger is not initied in 3 minutes, abort it.
            await delay(3 * 60 * 1000);
            throw new Error("Ledger init timeout");
          })(),
          this.testExtensionUIOpened()
        ]);
      } finally {
        if (this.initWG.isLocked) {
          this.initWG.done();
        }
      }
    }
  }

  async notifyNeedInitializeLedger() {
    await sendMessage(POPUP_PORT, new LedgerInitFailedMsg());
    await openWindow(
      browser.runtime.getURL("popup.html#/ledger-grant"),
      "ledger"
    );
  }

  resumeInitLedger() {
    closeWindow("ledger");

    if (this.initWG.isLocked) {
      this.initWG.done();
    }
  }

  // Test that the exntesion's ui layer is opened.
  async testExtensionUIOpened() {
    while (true) {
      const views = browser.extension.getViews();
      let find = false;
      for (const view of views) {
        if (
          view.location.href.includes(browser.runtime.getURL("/popup.html"))
        ) {
          find = true;
          break;
        }
      }

      if (!find) {
        throw new Error("Ledger init aborted");
      }

      await delay(1000);
    }
  }
}
