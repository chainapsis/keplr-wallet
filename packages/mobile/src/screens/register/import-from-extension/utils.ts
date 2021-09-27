import { ExportKeyRingData } from "@keplr-wallet/background";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { Buffer } from "buffer/";

export async function registerExportedKeyRingDatas(
  registerConfig: RegisterConfig,
  exportKeyRingDatas: ExportKeyRingData[],
  password: string
) {
  for (const exportKeyRingData of exportKeyRingDatas) {
    const name = exportKeyRingData.meta["name"] || "Keplr Account";
    if (exportKeyRingData.type === "mnemonic") {
      await registerConfig.createMnemonic(
        name,
        exportKeyRingData.key,
        password,
        exportKeyRingData.bip44HDPath
      );

      /*
      Due to the current structure, it is slightly difficult to set the coin type for each account, so we omit it for now.
      This is not a big problem because users can choose their account from the coin types anyway.
      for (const chain of Object.keys(exportKeyRingData.coinTypeForChain)) {
        await keyRingStore.setKeyStoreCoinType(
          chain,
          exportKeyRingData.coinTypeForChain[chain]
        );
      }
       */
    }

    if (exportKeyRingData.type === "privateKey") {
      const email = exportKeyRingData.meta["email"];

      await registerConfig.createPrivateKey(
        name,
        Buffer.from(exportKeyRingData.key, "hex"),
        password,
        email
      );
    }
  }
}
