import {
  connectAndSignEIP712WithLedger,
  connectAndSignWithLedger,
} from "./cosmos-ledger-sign";
import { SignInteractionStore } from "@keplr-wallet/stores-core";
import {
  EthermintChainIdHelper,
  SignDocWrapper,
  serializeSignDoc,
  Bech32Address,
} from "@keplr-wallet/cosmos";
import KeystoneSDK, {
  KeystoneCosmosSDK,
  KeystoneEvmSDK,
  UR,
  utils,
  UREncoder,
} from "@keystonehq/keystone-sdk";
import {
  ErrInvalidPublicKey,
  ErrInvalidRequestId,
  ErrInvalidSignature,
  ErrInvalidSigner,
  ErrModuleKeystoneSign,
  ErrKeystoneUSBCommunication,
  KeystoneKeys,
  KeystoneUR,
  getPathFromPubKey,
} from "./keystone";
import {
  createKeystoneTransport,
  handleKeystoneUSBError,
} from "../../../utils/keystone";
import Base from "@keystonehq/hw-app-base";
import { PlainObject } from "@keplr-wallet/background";
import { KeplrError } from "@keplr-wallet/router";
import { LedgerOptions } from "./ledger-types";

export interface KeystoneOptions {
  isEthSigning: boolean;
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
      const address = interactionData.data.signer;
      const path = getPathFromPubKey(
        interactionData.data.keyInsensitive["keys"] as KeystoneKeys,
        Buffer.from(interactionData.data.pubKey).toString("hex")
      );
      if (path === null) {
        throw new KeplrError(
          ErrModuleKeystoneSign,
          ErrInvalidSigner,
          "Invalid signer"
        );
      }
      const random = Buffer.alloc(16);
      Buffer.from(interactionData.id, "hex").copy(random);
      const requestId = utils.uuid.v4({
        random,
      });
      const isEthSigning = (options as KeystoneOptions).isEthSigning;
      let ur;
      const signData = Buffer.from(
        signDocWrapper.mode === "direct"
          ? signDocWrapper.protoSignDoc.toBytes()
          : serializeSignDoc(signDocWrapper.aminoSignDoc)
      ).toString("hex");
      const xfp = interactionData.data.keyInsensitive["xfp"] as string;
      const isUSB =
        interactionData.data.keyInsensitive["connectionType"] === "USB";
      if (isEthSigning) {
        ur = keystoneSDK.evm.generateSignRequest({
          requestId,
          signData,
          dataType: {
            amino: KeystoneEvmSDK.DataType.cosmosAmino,
            direct: KeystoneEvmSDK.DataType.cosmosDirect,
          }[signDocWrapper.mode],
          customChainIdentifier: EthermintChainIdHelper.parse(
            interactionData.data.chainId
          ).ethChainId,
          account: {
            path,
            xfp,
            address: (() => {
              if (isEthSigning) {
                return Bech32Address.fromBech32(
                  interactionData.data.signer
                ).toHex(true);
              }
            })(),
          },
        });
      } else {
        ur = keystoneSDK.cosmos.generateSignRequest({
          requestId,
          signData,
          dataType: {
            amino: KeystoneCosmosSDK.DataType.amino,
            direct: KeystoneCosmosSDK.DataType.direct,
          }[signDocWrapper.mode],
          accounts: [
            {
              path,
              xfp,
              address,
            },
          ],
        });
      }

      // Keystone usb signing
      let urResult: KeystoneUR;
      if (isUSB) {
        try {
          const transport = await createKeystoneTransport();
          const URString = new UREncoder(ur, Infinity).nextPart().toUpperCase();
          const baseApp = new Base(transport as any);
          const response = await baseApp.sendURRequest(URString);
          urResult = {
            type: response.type,
            cbor: response.cbor.toString("hex"),
          } as KeystoneUR;
        } catch (e) {
          throw new KeplrError(
            ErrModuleKeystoneSign,
            ErrKeystoneUSBCommunication,
            handleKeystoneUSBError(e)
          );
        }
      } else {
        await keystoneOptions.displayQRCode({
          type: ur.type,
          cbor: ur.cbor.toString("hex"),
        });
        urResult = await keystoneOptions.scanQRCode();
      }

      let signResult;
      try {
        signResult = keystoneSDK[
          isEthSigning ? "evm" : "cosmos"
        ].parseSignature(
          new UR(Buffer.from(urResult.cbor, "hex"), urResult.type)
        );
      } catch (e) {
        throw new KeplrError(
          ErrModuleKeystoneSign,
          ErrInvalidSignature,
          e.message || "Invalid signature"
        );
      }
      if (signResult.requestId !== requestId) {
        throw new KeplrError(
          ErrModuleKeystoneSign,
          ErrInvalidRequestId,
          "Invalid request id"
        );
      }
      if (
        "publicKey" in signResult &&
        signResult.publicKey !==
          (
            (interactionData.data.keyInsensitive["keys"] as PlainObject)[
              path
            ] as PlainObject
          )["pubKey"]
      ) {
        throw new KeplrError(
          ErrModuleKeystoneSign,
          ErrInvalidPublicKey,
          "Invalid public key"
        );
      }
      return Buffer.from(signResult.signature, "hex");
    }
    default:
      return;
  }
};
