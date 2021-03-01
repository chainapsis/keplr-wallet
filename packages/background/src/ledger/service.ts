import { delay as diDelay, inject, singleton } from "tsyringe";
import { TYPES } from "../types";

import { Ledger } from "./ledger";

import delay from "delay";

import { APP_PORT, Env } from "@keplr-wallet/router";
import { BIP44HDPath } from "../keyring";
import { KVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";

import { Buffer } from "buffer/";

@singleton()
export class LedgerService {
  private previousInitAborter: ((e: Error) => void) | undefined;

  constructor(
    @inject(TYPES.LedgerStore)
    protected readonly kvStore: KVStore,
    @inject(diDelay(() => InteractionService))
    protected readonly interactionService: InteractionService
  ) {}

  async getPublicKey(env: Env, bip44HDPath: BIP44HDPath): Promise<Uint8Array> {
    return await this.useLedger(env, async (ledger, retryCount) => {
      try {
        // Cosmos App on Ledger doesn't support the coin type other than 118.
        return await ledger.getPublicKey([
          44,
          118,
          bip44HDPath.account,
          bip44HDPath.change,
          bip44HDPath.addressIndex,
        ]);
      } finally {
        // Notify UI Ledger pubkey derivation succeeded only when Ledger initialization is tried again.
        if (retryCount > 0) {
          await this.interactionService.dispatchEvent(APP_PORT, "ledger-init", {
            event: "get-pubkey",
            success: true,
          });
        }
      }
    });
  }

  async sign(
    env: Env,
    bip44HDPath: BIP44HDPath,
    expectedPubKey: Uint8Array,
    message: Uint8Array
  ): Promise<Uint8Array> {
    return await this.useLedger(env, async (ledger, retryCount: number) => {
      try {
        const pubKey = await ledger.getPublicKey([
          44,
          118,
          bip44HDPath.account,
          bip44HDPath.change,
          bip44HDPath.addressIndex,
        ]);
        if (
          Buffer.from(expectedPubKey).toString("hex") !==
          Buffer.from(pubKey).toString("hex")
        ) {
          throw new Error("Unmatched public key");
        }
        // Cosmos App on Ledger doesn't support the coin type other than 118.
        const signature = await ledger.sign(
          [
            44,
            118,
            bip44HDPath.account,
            bip44HDPath.change,
            bip44HDPath.addressIndex,
          ],
          message
        );
        // Notify UI Ledger signing succeeded only when Ledger initialization is tried again.
        if (retryCount > 0) {
          await this.interactionService.dispatchEvent(APP_PORT, "ledger-init", {
            event: "sign",
            success: true,
          });
        }
        return signature;
      } catch (e) {
        // Notify UI Ledger signing failed only when Ledger initialization is tried again.
        if (retryCount > 0) {
          await this.interactionService.dispatchEvent(APP_PORT, "ledger-init", {
            event: "sign",
            success: false,
          });
        }
        throw e;
      }
    });
  }

  async useLedger<T>(
    env: Env,
    fn: (ledger: Ledger, retryCount: number) => Promise<T>
  ): Promise<T> {
    let ledger: { ledger: Ledger; retryCount: number } | undefined;
    try {
      ledger = await this.initLedger(env);
      return await fn(ledger.ledger, ledger.retryCount);
    } finally {
      if (ledger) {
        await ledger.ledger.close();
      }
    }
  }

  async initLedger(env: Env): Promise<{ ledger: Ledger; retryCount: number }> {
    if (this.previousInitAborter) {
      this.previousInitAborter(
        new Error(
          "New ledger request occurred before the ledger was initialized"
        )
      );
    }

    const aborter = (() => {
      let _reject: (reason?: any) => void | undefined;

      return {
        wait: () => {
          return new Promise((_, reject) => {
            _reject = reject;
          });
        },
        abort: (e: Error) => {
          if (_reject) {
            _reject(e);
          }
        },
      };
    })();

    // This ensures that the ledger connection is not executed concurrently.
    // Without this, the prior signing request can be delivered to the ledger and possibly make a user take a mistake.
    this.previousInitAborter = aborter.abort;

    let retryCount = 0;
    while (true) {
      try {
        const ledger = await Ledger.init(await this.getWebHIDFlag());
        this.previousInitAborter = undefined;
        return {
          ledger,
          retryCount,
        };
      } catch (e) {
        console.log(e);

        await Promise.race([
          this.interactionService.waitApprove(
            env,
            "/ledger-grant",
            "ledger-init",
            {
              event: "init-failed",
            },
            {
              forceOpenWindow: true,
              channel: "ledger",
            }
          ),
          (async () => {
            // If ledger is not inited in 5 minutes, abort it.
            await delay(5 * 60 * 1000);
            await this.interactionService.dispatchEvent(
              APP_PORT,
              "ledger-init",
              {
                event: "init-aborted",
              }
            );
            throw new Error("Ledger init timeout");
          })(),
          aborter.wait(),
          this.testLedgerGrantUIOpened(),
        ]);
      }

      retryCount++;
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

  async getWebHIDFlag(): Promise<boolean> {
    const webHIDFlag = await this.kvStore.get<boolean>("webhid");
    return !!webHIDFlag;
  }

  async setWebHIDFlag(flag: boolean): Promise<void> {
    await this.kvStore.set<boolean>("webhid", flag);
  }
}
