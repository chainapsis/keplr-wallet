import { TransportIniter } from "./options";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CosmosApp: any = require("ledger-cosmos-js").default;
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { signatureImport, publicKeyConvert } from "secp256k1";
import { KeplrError } from "@keplr-wallet/router";
import Eth from "@ledgerhq/hw-app-eth";
import { EthSignType } from "@keplr-wallet/types";
import { BIP44HDPath } from "../keyring";
import { serialize } from "@ethersproject/transactions";

export enum LedgerInitErrorOn {
  Transport,
  App,
  Support,
  Unknown,
}

export const LedgerWebUSBIniter: TransportIniter = async () => {
  return await TransportWebUSB.create();
};

export const LedgerWebHIDIniter: TransportIniter = async () => {
  return await TransportWebHID.create();
};

// 118 - Cosmos App
// 60 - Ethereum App
export const SupportedCoinTypes = [60, 118];

export class LedgerInitError extends Error {
  constructor(public readonly errorOn: LedgerInitErrorOn, message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, LedgerInitError.prototype);
  }
}

export class Ledger {
  constructor(
    private readonly cosmosApp: any,
    private ethereumApp: Eth | undefined = undefined
  ) {}

  static async init(
    transportIniter: TransportIniter,
    initArgs: any[] = [],
    coinType: number = 118
  ): Promise<Ledger> {
    const transport = await transportIniter(...initArgs);
    try {
      if (!SupportedCoinTypes.includes(coinType)) {
        throw new LedgerInitError(
          LedgerInitErrorOn.Support,
          "This app or coinType is not supported."
        );
      }

      if (coinType === 60) {
        const ethereumApp = new Eth(transport);
        const ledger = new Ledger(null, ethereumApp);

        return ledger;
      }

      const cosmosApp = new CosmosApp(transport);

      const ledger = new Ledger(cosmosApp, undefined);
      const versionResponse = await ledger.getVersion();

      // In this case, device is on screen saver.
      // However, it is almost same as that the device is not unlocked to user-side.
      // So, handle this case as initializing failed in `Transport`.
      if (versionResponse.deviceLocked) {
        throw new KeplrError("ledger", 102, "Device is on screen saver");
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
      throw new KeplrError("ledger", 100, "Cosmos App not initialized");
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
    const coinType = path[1];
    if (!SupportedCoinTypes.includes(coinType)) {
      throw new KeplrError(
        "ledger",
        100,
        `Invalid coin type in path: expected 60 or 118 but got ${coinType}`
      );
    }

    if (coinType === 118) {
      if (!this.cosmosApp) {
        throw new KeplrError("ledger", 100, "Cosmos App not initialized");
      }

      const result = await this.cosmosApp.publicKey(path);
      if (result.error_message !== "No errors") {
        throw new Error(result.error_message);
      }

      return result.compressed_pk;
    } else {
      if (!this.ethereumApp) {
        throw new KeplrError("ledger", 100, "Ethereum App not initialized");
      }

      try {
        const result = await this.ethereumApp.getAddress(
          Ledger.pathToString(path)
        );

        const pubKey = Buffer.from(result.publicKey, "hex");
        // Compress the public key
        return publicKeyConvert(pubKey, true);
      } catch (e: any) {
        throw new Error(e);
      }
    }
  }

  async sign(path: number[], message: Uint8Array): Promise<Uint8Array> {
    if (!this.cosmosApp) {
      throw new KeplrError("ledger", 100, "Cosmos App not initialized");
    }

    const result = await this.cosmosApp.sign(path, message);
    if (result.error_message !== "No errors") {
      throw new Error(result.error_message);
    }

    // Parse a DER ECDSA signature
    return signatureImport(result.signature);
  }

  async signEthereum(
    path: number[],
    signType: EthSignType,
    message: Uint8Array
  ) {
    if (!this.ethereumApp) {
      throw new KeplrError("ledger", 100, "Ethereum App not initialized");
    }

    const formattedPath = Ledger.pathToString(path);

    let signature;

    switch (signType) {
      case EthSignType.MESSAGE:
        signature = await this.ethereumApp.signPersonalMessage(
          formattedPath,
          Buffer.from(message).toString("hex")
        );
        return Ledger.ethSignatureToBytes(signature);
      case EthSignType.TRANSACTION:
        const tx = JSON.parse(Buffer.from(message).toString());
        const rlpArray = serialize(tx).replace("0x", "");

        signature = await this.ethereumApp.signTransaction(
          formattedPath,
          rlpArray
        );

        const signedTx = serialize(tx, {
          r: `0x${signature.r}`,
          s: `0x${signature.s}`,
          v: parseInt(signature.v, 16),
        }).replace("0x", "");

        return Buffer.from(signedTx, "hex");
      default:
        throw new Error(
          "Invalid EthSignType provided to Ledger: expected message or transaction"
        );
    }
  }

  async close(): Promise<void> {
    if (this.cosmosApp) {
      this.cosmosApp.transport.close();
    }
    if (this.ethereumApp) {
      this.ethereumApp.transport.close();
    }
  }

  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }

  static createPath(coinType: number, fields: BIP44HDPath) {
    return [44, coinType, fields.account, fields.change, fields.addressIndex];
  }

  // Convert a path represented by number[] to the string format
  // expected by the Ethereum Ledger app.
  static pathToString(path: number[]): string {
    let res = "m";
    let c = 0;
    path.forEach((el) => {
      res = res.concat(`/${el}`);
      // Harden the first three values by default
      if (c < 3) {
        res = res.concat("'");
      }
      c++;
    });

    return res;
  }

  // Convert an Ethereum signature object to bytes to be returned.
  static ethSignatureToBytes(signature: {
    v: number;
    r: string;
    s: string;
  }): Uint8Array {
    // 32 bytes, or equivalently 64 hex characters
    if (signature.r.length !== 64 || signature.s.length !== 64) {
      throw new Error("Unable to process signature: malformed fields");
    }

    let v = signature.v.toString(16);
    // Expect v to be greater than 27, but include this check in case
    // it's subtracted or not included for any reason.
    if (v.length % 2 !== 0) {
      v = `0${v}`;
    }
    return Buffer.from(signature.r + signature.s + v, "hex");
  }
}
