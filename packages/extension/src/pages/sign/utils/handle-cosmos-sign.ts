import {
  connectAndSignEIP712WithLedger,
  connectAndSignWithLedger,
} from "./cosmos-ledger-sign";
import { SignInteractionStore } from "@keplr-wallet/stores";
import { SignDocWrapper, serializeSignDoc } from "@keplr-wallet/cosmos";
import KeystoneSDK, {
  KeystoneCosmosSDK,
  UR,
  utils,
} from "@keystonehq/keystone-sdk";
import { KeystoneKeys, KeystoneUR, getPathFromAddress } from "./keystone";
import { PlainObject } from "@keplr-wallet/background";

export interface LedgerOptions {
  useWebHID: boolean;
}

export interface KeystoneOptions {
  bech32Prefix: string;
  displayQRCode: (ur: { type: string; cbor: string }) => Promise<void>;
  scanQRCode: () => Promise<KeystoneUR>;
}

export type PreSignOptions = LedgerOptions | KeystoneOptions;

export const handleCosmosPreSign = async (
  interactionData: NonNullable<SignInteractionStore["waitingData"]>,
  signDocWrapper: SignDocWrapper,
  options?: PreSignOptions
): Promise<Uint8Array | undefined> => {
  switch (interactionData.data.keyType) {
    case "ledger": {
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

      const bip44Path = appData["bip44Path"] as {
        account: number;
        change: number;
        addressIndex: number;
      };

      if ("eip712" in interactionData.data && interactionData.data.eip712) {
        const publicKey = Buffer.from(
          (appData["Ethereum"] as any)["pubKey"],
          "hex"
        );
        if (publicKey.length === 0) {
          throw new Error("Invalid ledger app data");
        }

        return await connectAndSignEIP712WithLedger(
          (options as LedgerOptions).useWebHID,
          publicKey,
          bip44Path,
          signDocWrapper.aminoSignDoc,
          interactionData.data.eip712
        );
      }

      let ledgerApp = "Cosmos";
      let publicKey = new Uint8Array(0);

      if (appData["Terra"]) {
        ledgerApp = "Terra";
        publicKey = Buffer.from((appData["Terra"] as any)["pubKey"], "hex");
      } else if (appData["Secret"]) {
        ledgerApp = "Secret";
        publicKey = Buffer.from((appData["Secret"] as any)["pubKey"], "hex");
      } else {
        publicKey = Buffer.from((appData["Cosmos"] as any)["pubKey"], "hex");
      }

      if (publicKey.length === 0) {
        throw new Error("Invalid ledger app data");
      }

      if (!signDocWrapper) {
        throw new Error("Sign doc not found");
      }

      return await connectAndSignWithLedger(
        (options as LedgerOptions).useWebHID,
        ledgerApp,
        publicKey,
        bip44Path,
        signDocWrapper.aminoSignDoc
      );
    }
    case "keystone": {
      const keystoneOptions = options as KeystoneOptions;
      const keystoneSDK = new KeystoneSDK({
        origin: "Keplr Extension",
      });
      const interData = interactionData.data;
      const address = interData.signer;
      const path = getPathFromAddress(
        interData.keyInsensitive["keys"] as KeystoneKeys,
        address,
        keystoneOptions.bech32Prefix
      );
      if (path === null) {
        throw new Error("Invalid signer");
      }
      const requestId = utils.uuid.v4();
      const ur = keystoneSDK.cosmos.generateSignRequest({
        requestId,
        signData: Buffer.from(
          serializeSignDoc(signDocWrapper.aminoSignDoc)
        ).toString("hex"),
        dataType: KeystoneCosmosSDK.DataType.amino,
        accounts: [
          {
            path,
            xfp: interData.keyInsensitive["xfp"] as string,
            address,
          },
        ],
      });
      await keystoneOptions.displayQRCode({
        type: ur.type,
        cbor: ur.cbor.toString("hex"),
      });
      const scanResult = await keystoneOptions.scanQRCode();
      const signResult = keystoneSDK.cosmos.parseSignature(
        new UR(Buffer.from(scanResult.cbor, "hex"), scanResult.type)
      );
      if (signResult.requestId !== requestId) {
        throw new Error("Invalid request id");
      }
      if (
        signResult.publicKey !==
        (
          (interData.keyInsensitive["keys"] as PlainObject)[path] as PlainObject
        )["pubKey"]
      ) {
        throw new Error("Invalid public key");
      }
      return Buffer.from(signResult.signature, "hex");
    }
    default:
      return;
  }
};
