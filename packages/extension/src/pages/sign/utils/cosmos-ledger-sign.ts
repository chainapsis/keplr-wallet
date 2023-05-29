import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Transport from "@ledgerhq/hw-transport";
import { CosmosApp } from "@keplr-wallet/ledger-cosmos";
import { KeplrError } from "@keplr-wallet/router";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { Buffer } from "buffer/";
import { StdSignDoc } from "@keplr-wallet/types";
import { serializeSignDoc } from "@keplr-wallet/cosmos";
import { signatureImport } from "secp256k1";
import { LedgerUtils } from "../../../utils";
import Eth from "@ledgerhq/hw-app-eth";
import { EIP712MessageValidator } from "@keplr-wallet/background";
import { domainHash, messageHash } from "@keplr-wallet/background";

export const ErrModule = "ledger-sign";
export const ErrFailedInit = 1;
export const ErrCodeUnsupportedApp = 2;
export const ErrCodeDeviceLocked = 3;
export const ErrFailedGetPublicKey = 4;
export const ErrPublicKeyUnmatched = 5;
export const ErrFailedSign = 6;
export const ErrSignRejected = 7;

export const connectAndSignEIP712WithLedger = async (
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  signDoc: StdSignDoc,
  eip712: {
    types: Record<string, { name: string; type: string }[] | undefined>;
    domain: Record<string, any>;
    primaryType: string;
  }
): Promise<Uint8Array> => {
  let transport: Transport;
  try {
    transport = await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(ErrModule, ErrFailedInit, "Failed to init transport");
  }

  let ethApp = new Eth(transport);

  // Ensure that the keplr can connect to ethereum app on ledger.
  // getAppConfiguration() works even if the ledger is on screen saver mode.
  // To detect the screen saver mode, we should request the address before using.
  try {
    await ethApp.getAddress(`m/44'/60'/'0/0/0`);
  } catch (e) {
    // Device is locked
    if (e?.message.includes("(0x6b0c)")) {
      throw new KeplrError(ErrModule, ErrCodeDeviceLocked, "Device is locked");
    } else if (
      // User is in home sceen or other app.
      e?.message.includes("(0x6511)") ||
      e?.message.includes("(0x6e00)")
    ) {
      // Do nothing
    } else {
      await transport.close();

      throw e;
    }
  }

  transport = await LedgerUtils.tryAppOpen(transport, "Ethereum");
  ethApp = new Eth(transport);

  try {
    let pubKey: PubKeySecp256k1;
    try {
      const res = await ethApp.getAddress(
        `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
      );

      pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, "hex"));
    } catch (e) {
      throw new KeplrError(
        ErrModule,
        ErrFailedGetPublicKey,
        e.message || e.toString()
      );
    }

    if (
      Buffer.from(new PubKeySecp256k1(expectedPubKey).toBytes()).toString(
        "hex"
      ) !== Buffer.from(pubKey.toBytes()).toString("hex")
    ) {
      throw new KeplrError(
        ErrModule,
        ErrPublicKeyUnmatched,
        "Public key unmatched"
      );
    }

    let data: any;

    try {
      const message = Buffer.from(
        JSON.stringify({
          types: eip712.types,
          domain: eip712.domain,
          primaryType: eip712.primaryType,
          message: signDoc,
        })
      );

      data = await EIP712MessageValidator.validateAsync(
        JSON.parse(Buffer.from(message).toString())
      );
    } catch (e) {
      console.log(e);

      throw new KeplrError(ErrModule, ErrFailedSign, e.message || e.toString());
    }

    try {
      // Unfortunately, signEIP712Message not works on ledger yet.
      return ethSignatureToBytes(
        await ethApp.signEIP712HashedMessage(
          `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
          domainHash(data),
          messageHash(data)
        )
      );
    } catch (e) {
      if (e?.message.includes("(0x6985)")) {
        throw new KeplrError(
          ErrModule,
          ErrSignRejected,
          "User rejected signing"
        );
      }

      throw new KeplrError(ErrModule, ErrFailedSign, e.message || e.toString());
    }
  } finally {
    await transport.close();
  }
};

export const connectAndSignWithLedger = async (
  propApp: string,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  signDoc: StdSignDoc
): Promise<Uint8Array> => {
  if (propApp !== "Cosmos" && propApp !== "Terra") {
    throw new KeplrError(
      ErrModule,
      ErrCodeUnsupportedApp,
      `Unsupported app: ${propApp}`
    );
  }

  let transport: Transport;
  try {
    transport = await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(ErrModule, ErrFailedInit, "Failed to init transport");
  }
  let app = new CosmosApp(propApp, transport);

  try {
    const version = await app.getVersion();
    if (version.device_locked) {
      throw new KeplrError(ErrModule, ErrCodeDeviceLocked, "Device is locked");
    }
  } catch (e) {
    await transport.close();

    throw e;
  }

  transport = await LedgerUtils.tryAppOpen(transport, propApp);
  app = new CosmosApp(propApp, transport);

  try {
    const res = await app.getPublicKey(
      bip44Path.account,
      bip44Path.change,
      bip44Path.addressIndex
    );
    if (res.error_message === "No errors") {
      const pubKey = new PubKeySecp256k1(res.compressed_pk);
      const expected = new PubKeySecp256k1(expectedPubKey);
      if (
        Buffer.from(pubKey.toBytes()).toString() !==
        Buffer.from(expected.toBytes()).toString()
      ) {
        throw new KeplrError(
          ErrModule,
          ErrPublicKeyUnmatched,
          "Public key unmatched"
        );
      }

      const signResponse = await app.sign(
        bip44Path.account,
        bip44Path.change,
        bip44Path.addressIndex,
        serializeSignDoc(signDoc)
      );
      if (signResponse.error_message === "No errors") {
        return signatureImport(signResponse.signature);
      } else {
        if (signResponse.error_message === "Transaction rejected") {
          throw new KeplrError(
            ErrModule,
            ErrSignRejected,
            signResponse.error_message
          );
        }

        throw new KeplrError(
          ErrModule,
          ErrFailedSign,
          signResponse.error_message
        );
      }
    } else {
      throw new KeplrError(ErrModule, ErrFailedGetPublicKey, res.error_message);
    }
  } finally {
    await transport.close();
  }
};

function ethSignatureToBytes(signature: {
  v: number;
  r: string;
  s: string;
}): Uint8Array {
  // Validate signature.r is hex encoded
  const r = Buffer.from(signature.r, "hex");
  // Validate signature.s is hex encoded
  const s = Buffer.from(signature.s, "hex");

  // Must be 32 bytes
  if (r.length !== 32 || s.length !== 32) {
    throw new Error("Unable to process signature: malformed fields");
  }

  if (!Number.isInteger(signature.v)) {
    throw new Error("Unable to process signature: malformed fields");
  }

  return Buffer.concat([r, s, Buffer.from([signature.v])]);
}
