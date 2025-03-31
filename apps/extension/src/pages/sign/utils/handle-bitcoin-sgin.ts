import { SignBitcoinMessageInteractionStore } from "@keplr-wallet/stores-core";
import {
  ErrFailedInit,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  LedgerOptions,
} from "./ledger-types";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Btc from "@ledgerhq/hw-app-btc";
import { PubKeyBitcoinCompatible } from "@keplr-wallet/crypto";
import { KeplrError } from "@keplr-wallet/router";
import { encodeLegacySignature } from "@keplr-wallet/background";
import { ModularChainInfo } from "@keplr-wallet/types";

export const connectAndSignMessageWithLedger = async (
  interactionData: NonNullable<
    SignBitcoinMessageInteractionStore["waitingData"]
  >,
  modularChainInfo: ModularChainInfo,
  options: LedgerOptions
): Promise<string> => {
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("Bitcoin not found");
  }

  const appData = interactionData.data.keyInsensitive;
  if (!appData) {
    throw new Error("Invalid ledger app data");
  }

  if (typeof appData !== "object") {
    throw new Error("Invalid ledger app data");
  }
  if (!appData["bip44Path"] || typeof appData["bip44Path"] !== "object") {
    throw new Error("Invalid ledger app data");
  }

  const { purpose, coinType } = modularChainInfo.bitcoin.bip44;

  if (!purpose) {
    throw new Error("BIP44 purpose is not set");
  }

  const { account, change, addressIndex } = appData["bip44Path"] as {
    account: number;
    change: number;
    addressIndex: number;
  };

  const isTestnet = coinType === 1;

  await checkBitcoinPubKey(
    interactionData.data.pubKey,
    {
      purpose,
      coinType,
      account,
      change,
      addressIndex,
    },
    options
  );

  let transport: Transport;
  try {
    transport = options?.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  const hdPath = `${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`;

  try {
    const message = interactionData.data.message;
    const signType = interactionData.data.signType;

    if (signType === "bip322-simple") {
      // TODO: implement bip322-simple
      throw new KeplrError(
        ErrModuleLedgerSign,
        9999,
        "BIP322-simple is not supported yet"
      );
    }

    const btcApp = new Btc({ transport });

    // ecdsa
    const { v, r, s } = await btcApp.signMessage(
      hdPath,
      Buffer.from(message).toString("hex")
    );

    return encodeLegacySignature(
      Buffer.from(r, "hex"),
      Buffer.from(s, "hex"),
      v
    );
  } catch (e) {
    console.log("error", e);
    throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
  } finally {
    await transport.close();
  }
};

async function checkBitcoinPubKey(
  expectedPubKey: Uint8Array,
  bip44Path: {
    purpose: number;
    coinType: number;
    account: number;
    change: number;
    addressIndex: number;
  },
  options: LedgerOptions
): Promise<string> {
  let transport: Transport;

  const { purpose, coinType, account, change, addressIndex } = bip44Path;

  const hdPath = `${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`;

  try {
    transport = options?.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  try {
    const btcApp = new Btc({
      transport,
      currency: coinType === 1 ? "bitcoin_testnet" : "bitcoin",
    });

    const { publicKey } = await btcApp.getWalletPublicKey(hdPath, {
      format: purpose === 86 ? "bech32m" : purpose === 84 ? "bech32" : "legacy",
    });

    if (
      Buffer.from(
        new PubKeyBitcoinCompatible(Buffer.from(expectedPubKey)).toBytes()
      ).toString("hex") !==
      Buffer.from(
        new PubKeyBitcoinCompatible(Buffer.from(publicKey, "hex")).toBytes()
      ).toString("hex")
    ) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrPublicKeyUnmatched,
        "Public key unmatched"
      );
    } else {
      return publicKey;
    }
  } catch (e) {
    throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
  } finally {
    await transport.close();
  }
}
