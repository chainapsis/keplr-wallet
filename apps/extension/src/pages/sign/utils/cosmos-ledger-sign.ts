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
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import {
  ErrModuleLedgerSign,
  ErrFailedInit,
  ErrCodeUnsupportedApp,
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrPublicKeyUnmatched,
  ErrFailedSign,
  ErrSignRejected,
} from "./ledger-types";
import { sortObjectByKey } from "@keplr-wallet/common";

export const connectAndSignEIP712WithLedger = async (
  useWebHID: boolean,
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
  },
  signPlainJSON: boolean
): Promise<Uint8Array> => {
  let transport: Transport;
  try {
    transport = useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
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
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
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
        ErrModuleLedgerSign,
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
        ErrModuleLedgerSign,
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

      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedSign,
        e.message || e.toString()
      );
    }

    try {
      if (!signPlainJSON) {
        // Unfortunately, signEIP712Message not works on ledger yet.
        return ethSignatureToBytes(
          await ethApp.signEIP712HashedMessage(
            `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
            domainHash(data),
            messageHash(data)
          )
        );
      } else {
        return ethSignatureToBytes(
          await ethApp.signPersonalMessage(
            `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
            Buffer.from(JSON.stringify(sortObjectByKey(signDoc))).toString(
              "hex"
            )
          )
        );
      }
    } catch (e) {
      if (e?.message.includes("(0x6985)")) {
        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrSignRejected,
          "User rejected signing"
        );
      }

      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedSign,
        e.message || e.toString()
      );
    }
  } finally {
    await transport.close();
  }
};

export const connectAndSignWithLedger = async (
  useWebHID: boolean,
  propApp: string,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  signDoc: StdSignDoc
): Promise<Uint8Array> => {
  if (propApp !== "Cosmos" && propApp !== "Terra" && propApp !== "Secret") {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrCodeUnsupportedApp,
      `Unsupported app: ${propApp}`
    );
  }

  let transport: Transport;
  try {
    transport = useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }
  let app = new CosmosApp(propApp, transport);

  try {
    const version = await app.getVersion();
    if (version.device_locked) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrCodeDeviceLocked,
        "Device is locked"
      );
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
          ErrModuleLedgerSign,
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
            ErrModuleLedgerSign,
            ErrSignRejected,
            signResponse.error_message
          );
        }

        throw new KeplrError(
          ErrModuleLedgerSign,
          ErrFailedSign,
          signResponse.error_message
        );
      }
    } else {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrFailedGetPublicKey,
        res.error_message
      );
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
