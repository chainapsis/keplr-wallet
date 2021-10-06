import {
  AddressBookData,
  AddressBookConfigMap,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import WalletConnect from "@walletconnect/client";
import AES, { Counter } from "aes-js";
import { Buffer } from "buffer/";
import { ExportKeyRingData } from "@keplr-wallet/background";
import { KeyRingStore } from "@keplr-wallet/stores";
import { Hash } from "@keplr-wallet/crypto";

export interface QRCodeSharedData {
  // The uri for the wallet connect
  wcURI: string;
  // The temporary password for encrypt/descrypt the key datas.
  // This must not be shared the other than the extension and mobile.
  sharedPassword: string;
}

export interface WCExportKeyRingDatasResponse {
  encrypted: {
    // ExportKeyRingData[]
    // Json format and hex encoded
    ciphertext: string;
    // Hex encoded
    iv: string;
  };
  addressBooks: { [chainId: string]: AddressBookData[] | undefined };
}

export function parseQRCodeDataForImportFromMobile(
  data: string
): QRCodeSharedData {
  const sharedData = JSON.parse(data) as QRCodeSharedData;
  if (!sharedData.wcURI || !sharedData.sharedPassword) {
    throw new Error("Invalid qr code");
  }
  return sharedData;
}

export async function importFromMobile(
  sharedData: QRCodeSharedData,
  chainIdsForAddressBook: string[]
): Promise<{
  KeyRingDatas: ExportKeyRingData[];
  addressBooks: { [chainId: string]: AddressBookData[] | undefined };
}> {
  const connector = new WalletConnect({
    uri: sharedData.wcURI,
  });

  if (connector.connected) {
    await connector.killSession();
  }

  await new Promise<void>((resolve, reject) => {
    connector.on("session_request", (error) => {
      if (error) {
        reject(error);
      } else {
        connector.approveSession({ accounts: [], chainId: 77777 });

        resolve();
      }
    });
  });

  const result = (
    await connector.sendCustomRequest({
      id: Math.floor(Math.random() * 100000),
      method: "keplr_request_export_keyring_datas_wallet_connect_v1",
      params: [
        {
          addressBookChainIds: chainIdsForAddressBook,
        },
      ],
    })
  )[0] as WCExportKeyRingDatasResponse;

  const counter = new Counter(0);
  counter.setBytes(Buffer.from(result.encrypted.iv, "hex"));
  const aesCtr = new AES.ModeOfOperation.ctr(
    Buffer.from(sharedData.sharedPassword, "hex"),
    counter
  );

  const decrypted = aesCtr.decrypt(
    Buffer.from(result.encrypted.ciphertext, "hex")
  );

  const exportedKeyRingDatas = JSON.parse(
    Buffer.from(decrypted).toString()
  ) as ExportKeyRingData[];

  return {
    KeyRingDatas: exportedKeyRingDatas,
    addressBooks: result.addressBooks,
  };
}

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
      Hash.sha256(Buffer.from(sortedJsonStringify(exportKeyRingData))).slice(
        0,
        8
      )
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
      await registerConfig.createPrivateKey(
        name,
        Buffer.from(exportKeyRingData.key, "hex"),
        password,
        {
          ...exportKeyRingData.meta,
          exportKeyRingDataDuplicationCheckKey,
        }
      );
    }
  }
}
