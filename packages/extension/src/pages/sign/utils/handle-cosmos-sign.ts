import { Buffer } from "buffer/";
import { connectAndSignWithLedger } from "./cosmos-ledger-sign";
import { SignInteractionStore } from "@keplr-wallet/stores";
import { SignDocWrapper } from "@keplr-wallet/cosmos";

export const handleCosmosPreSign = async (
  interactionData: NonNullable<SignInteractionStore["waitingData"]>,
  signDocWrapper: SignDocWrapper
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

      let ledgerApp = "Cosmos";
      let publicKey = new Uint8Array(0);

      if (appData["Terra"]) {
        ledgerApp = "Terra";
        publicKey = Buffer.from((appData["Terra"] as any)["pubKey"], "hex");
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
        ledgerApp,
        publicKey,
        bip44Path,
        signDocWrapper.aminoSignDoc
      );
    }
    default:
      return;
  }
};
