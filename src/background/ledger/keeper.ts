import { Ledger } from "./ledger";

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
  private previousInitAborter: ((e: Error) => void) | undefined;

  private readonly initWG: AsyncWaitGroup = new AsyncWaitGroup();

  async getPublicKey(): Promise<Uint8Array> {
    return await this.useLedger(async ledger => {
      return await ledger.getPublicKey([44, 118, 0, 0, 0]);
    });
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
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
    if (this.previousInitAborter) {
      this.previousInitAborter(
        new Error(
          "New ledger request occurred before the ledger was initialized"
        )
      );
    }

    // Wait until the promise rejected or 3 minutes.
    // This ensures that the ledger connection is not executed concurrently.
    // Without this, the prior signing request can be delivered to the ledger and possibly make a user take a mistake.
    const aborter = (() => {
      let _reject: (reason?: any) => void | undefined;

      return {
        wait: () => {
          return new Promise((_, reject) => {
            _reject = reject;
            // 3.5 min.
            setTimeout(() => {
              reject("Timeout");
            }, 3.5 * 60 * 1000);
          });
        },
        abort: (e: Error) => {
          if (_reject) {
            _reject(e);
          }
        }
      };
    })();

    this.previousInitAborter = aborter.abort;

    while (true) {
      try {
        this.initWG.add();
        const ledger = await Ledger.init();
        this.previousInitAborter = undefined;
        return ledger;
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
          aborter.wait(),
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
