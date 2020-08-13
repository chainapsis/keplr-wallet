const CosmosApp: any = require("ledger-cosmos-js").default;
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

import { signatureImport } from "secp256k1";

export class Ledger {
  constructor(private readonly cosmosApp: any) {}

  static async init(): Promise<Ledger> {
    const cosmosApp = new CosmosApp(await TransportWebUSB.create());
    const ledger = new Ledger(cosmosApp);
    await ledger.getVersion();
    return ledger;
  }

  async getVersion(): Promise<{
    deviceLocked: boolean;
    major: number;
    minor: number;
    patch: number;
    targetId: string;
    testMode: boolean;
  }> {
    if (!this.cosmosApp) {
      throw new Error("Comsos App not initialized");
    }

    const result = await this.cosmosApp.getVersion();
    if (result.error_message !== "No errors") {
      throw new Error(result.error_message);
    }

    return {
      deviceLocked: result.device_locked,
      major: result.major,
      minor: result.minor,
      patch: result.patch,
      targetId: result.target_id,
      testMode: result.test_mode
    };
  }

  async getPublicKey(path: number[]): Promise<Uint8Array> {
    if (!this.cosmosApp) {
      throw new Error("Comsos App not initialized");
    }

    const result = await this.cosmosApp.publicKey(path);
    if (result.error_message !== "No errors") {
      throw new Error(result.error_message);
    }

    return result.compressed_pk;
  }

  async sign(path: number[], message: Uint8Array): Promise<Uint8Array> {
    if (!this.cosmosApp) {
      throw new Error("Comsos App not initialized");
    }

    const result = await this.cosmosApp.sign(path, message);
    if (result.error_message !== "No errors") {
      throw new Error(result.error_message);
    }

    // Parse a DER ECDSA signature
    return signatureImport(result.signature);
  }

  async close(): Promise<void> {
    return await this.cosmosApp.transport.close();
  }

  async closeAfter<T>(fn: () => Promise<T>): Promise<T> {
    const result = await fn();
    await this.close();
    return result;
  }
}
