import { Ledger } from "./ledger";

import PQueue from "p-queue";
import delay from "delay";

import { sendMessage } from "../../common/message/send";
import { POPUP_PORT } from "../../common/message/constant";
import {
  LedgerInitFailedMsg,
  LedgerInitResumedMsg,
  LedgerSignCompletedMsg
} from "./foreground";
import { AsyncWaitGroup } from "../../common/async-wait-group";
import { openWindow } from "../../common/window";

export class LedgerKeeper {
  private readonly pQueue: PQueue = new PQueue({
    concurrency: 1
  });

  private readonly initWG: AsyncWaitGroup = new AsyncWaitGroup();

  async getPublicKey(): Promise<Uint8Array> {
    return await this.pQueue.add(async () => {
      return await this.useLedger(async ledger => {
        return await ledger.getPublicKey([44, 118, 0, 0, 0]);
      });
    });
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return await this.pQueue.add(async () => {
      return await this.useLedger(async ledger => {
        // TODO: Check public key is matched?

        try {
          const signature = await ledger.sign([44, 118, 0, 0, 0], message);
          sendMessage(POPUP_PORT, new LedgerSignCompletedMsg(false));
          return signature;
        } catch (e) {
          sendMessage(POPUP_PORT, new LedgerSignCompletedMsg(true));
          throw e;
        }
      });
    });
  }

  async useLedger<T>(fn: (ledger: Ledger) => Promise<T>): Promise<T> {
    const ledger = await this.initLedger();
    try {
      return await fn(ledger);
    } finally {
      await ledger.close();
    }
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
          this.testLedgerGrantUIOpened()
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

  async resumeInitLedger() {
    await sendMessage(POPUP_PORT, new LedgerInitResumedMsg());

    if (this.initWG.isLocked) {
      this.initWG.done();
    }
  }

  // Test that the exntesion's granting ledger page is opened.
  async testLedgerGrantUIOpened() {
    await delay(1000);

    while (true) {
      const views = browser.extension.getViews();
      let find = false;
      for (const view of views) {
        if (
          view.location.href.includes(
            browser.runtime.getURL("popup.html#/ledger-grant")
          )
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
