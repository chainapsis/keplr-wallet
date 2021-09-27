import { ExportKeyRingData } from "@keplr-wallet/background";
import {
  AddressBookConfigMap,
  AddressBookData,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import { Buffer } from "buffer/";
import { KeyRingStore } from "@keplr-wallet/stores";
import { Hash } from "@keplr-wallet/crypto";

function sortedObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortedObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  sortedKeys.forEach((key) => {
    result[key] = sortedObject(obj[key]);
  });
  return result;
}

function sortedJsonStringify(obj: any): string {
  return JSON.stringify(sortedObject(obj));
}

export async function registerExportedAddressBooks(
  addressBookConfigMap: AddressBookConfigMap,
  addressBooks: {
    [chainId: string]: AddressBookData[] | undefined;
  }
) {
  for (const chainId of Object.keys(addressBooks)) {
    const addressBook = addressBooks[chainId]!;

    const addressBookConfig = addressBookConfigMap.getAddressBookConfig(
      chainId
    );

    await addressBookConfig.waitLoaded();

    // Prevent importing if the data is already imported.
    const duplicationCheck = new Map<string, boolean>();

    for (const addressBookData of addressBookConfig.addressBookDatas) {
      duplicationCheck.set(sortedJsonStringify(addressBookData), true);
    }

    for (const addressBookData of addressBook) {
      if (!duplicationCheck.get(sortedJsonStringify(addressBookData))) {
        await addressBookConfig.addAddressBook(addressBookData);
      }
    }
  }
}

export async function registerExportedKeyRingDatas(
  keyRingStore: KeyRingStore,
  registerConfig: RegisterConfig,
  exportKeyRingDatas: ExportKeyRingData[],
  password: string
) {
  // Prevent importing if the data is already imported.
  const duplicationCheck = new Map<string, boolean>();

  // KeyRing Store would be restored when init.
  // So, there is no need to wait.
  // In fact, at this point, restore is complete.
  for (const keyStore of keyRingStore.multiKeyStoreInfo) {
    if (keyStore.meta && keyStore.meta.exportKeyRingDataDuplicationCheckKey) {
      duplicationCheck.set(
        keyStore.meta.exportKeyRingDataDuplicationCheckKey,
        true
      );
    }
  }

  for (const exportKeyRingData of exportKeyRingDatas) {
    // Below date will be added to the key store's meta.
    // This data is used to distinguish that the key store is imported from the extension and it is not duplicated.
    const exportKeyRingDataDuplicationCheckKey = Buffer.from(
      Hash.sha256(Buffer.from(sortedJsonStringify(exportKeyRingData)))
    ).toString("hex");

    if (duplicationCheck.get(exportKeyRingDataDuplicationCheckKey)) {
      continue;
    }

    const name = exportKeyRingData.meta["name"] || "Keplr Account";
    if (exportKeyRingData.type === "mnemonic") {
      await registerConfig.createMnemonic(
        name,
        exportKeyRingData.key,
        password,
        exportKeyRingData.bip44HDPath,
        {
          exportKeyRingDataDuplicationCheckKey,
        }
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
        email,
        {
          exportKeyRingDataDuplicationCheckKey,
        }
      );
    }
  }
}
