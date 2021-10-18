import { TransportIniter } from "./options";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CosmosApp: any = require("ledger-cosmos-js").default;
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { signatureImport } from "secp256k1";

export enum LedgerInitErrorOn {
  Transport,
  App,
  Unknown,
}

export const LedgerWebUSBIniter: TransportIniter = async () => {
  return await TransportWebUSB.create();
};

export const LedgerWebHIDIniter: TransportIniter = async () => {
  return await TransportWebHID.create();
};

export class LedgerInitError extends Error {
  constructor(public readonly errorOn: LedgerInitErrorOn, message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, LedgerInitError.prototype);
  }
}

export class Ledger {
  constructor(private readonly cosmosApp: any) {}

  static async init(
    transportIniter: TransportIniter,
    initArgs: any[] = []
  ): Promise<Ledger> {
    const transport = await transportIniter(...initArgs);
    try {
      const cosmosApp = new CosmosApp(transport);
      const ledger = new Ledger(cosmosApp);
      const versionResponse = await ledger.getVersion();

      // In this case, device is on screen saver.
      // However, it is almost same as that the device is not unlocked to user-side.
      // So, handle this case as initializing failed in `Transport`.
      if (versionResponse.deviceLocked) {
        throw new Error("Device is on screen saver");
      }

      return ledger;
    } catch (e) {
      if (transport) {
        await transport.close();
      }
      if (e.message === "Device is on screen saver") {
        throw new LedgerInitError(LedgerInitErrorOn.Transport, e.message);
      }

      throw new LedgerInitError(LedgerInitErrorOn.App, e.message);
    }
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
      testMode: result.test_mode,
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

  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}
