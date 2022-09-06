import { AminoSignResponse, StdSignature, StdSignDoc } from "@cosmjs/amino";
import { DirectSignResponse } from "@cosmjs/proto-signing";
import {
  AbstractKeyRingService,
  BIP44HDPath,
  ChainsService,
  ExportKeyRingData,
  init,
  InteractionService,
  Key,
  KeyRingStatus,
  LedgerService,
  MultiKeyStoreInfoWithSelected,
  PermissionService,
  ScryptParams,
} from "@keplr-wallet/background";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { BACKGROUND_PORT, Env } from "@keplr-wallet/router";
import { BIP44, EthSignType, KeplrSignOptions } from "@keplr-wallet/types";
import {
  EmbedChainInfos,
  KVStore,
  MessageRequesterInternalToUi,
  migrateSerializedProxyAddress,
  PrivilegedOrigins,
  produceEnv,
  RouterBackground,
  SerializedData,
} from "@obi-wallet/common";
import { Buffer } from "buffer";
import scrypt from "scrypt-js";

class KeyRingService extends AbstractKeyRingService {
  protected kvStore: KVStore;

  addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, addLedgerKey");
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  addMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, addMnemonicKey");
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  addPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, addPrivateKey");
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  changeKeyStoreFromMultiKeyStore(
    index: number
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, changeKeyStoreFromMultiKeyStore");
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  checkPassword(password: string): boolean {
    console.log("Not implemented, checkPassword");
    return false;
  }

  createLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    console.log("Not implemented, createLedgerKey");
    return Promise.resolve({ multiKeyStoreInfo: undefined, status: undefined });
  }

  createMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    console.log("Not implemented, createMnemonicKey");
    return Promise.resolve({ multiKeyStoreInfo: undefined, status: undefined });
  }

  createPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    console.log("Not implemented, createPrivateKey");
    return Promise.resolve({ multiKeyStoreInfo: undefined, status: undefined });
  }

  deleteKeyRing(
    index: number,
    password: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
    status: KeyRingStatus;
  }> {
    console.log("Not implemented, deleteKeyRing");
    return Promise.resolve({ multiKeyStoreInfo: undefined, status: undefined });
  }

  async enable(env: Env): Promise<KeyRingStatus> {
    // TODO: do something with multisig store?
    return KeyRingStatus.UNLOCKED;
  }

  exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    console.log("Not implemented, exportKeyRingDatas");
    return Promise.resolve([]);
  }

  async getKey(chainId: string): Promise<Key> {
    const data = await this.kvStore.get<unknown | undefined>("multisig");

    if (!SerializedData.is(data)) {
      throw new Error("Invalid data");
    }

    const proxyAddress = migrateSerializedProxyAddress(data.proxyAddress);

    return {
      // TODO:
      algo: "multisig",
      // TODO:
      pubKey: new Uint8Array(),
      address: Bech32Address.fromBech32(proxyAddress.address, "juno").address,
      isNanoLedger: false,
    };
  }

  getKeyRingType(): string {
    console.log("Not implemented, getKeyRingType");
    return "";
  }

  getKeyStoreBIP44Selectables(
    chainId: string,
    paths: BIP44[]
  ): Promise<{ readonly path: BIP44; readonly bech32Address: string }[]> {
    console.log("Not implemented, getKeyStoreBIP44Selectables");
    return Promise.resolve([]);
  }

  getKeyStoreMeta(key: string): string {
    console.log("Not implemented, getKeyStoreMeta");
    return "";
  }

  getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    console.log("Not implemented, getMultiKeyStoreInfo");
    return undefined;
  }

  init(
    interactionService: InteractionService,
    chainsService: ChainsService,
    permissionService: PermissionService,
    ledgerService: LedgerService
  ): void {
    this.chainsService = chainsService;
    this.permissionService = permissionService;
    this.kvStore = new KVStore("multisig-store");

    // TODO: permissionService
    // TODO: key ring
  }

  get keyRingStatus(): KeyRingStatus {
    console.log("Not implemented, keyRingStatus");
    return undefined;
  }

  lock(): KeyRingStatus {
    console.log("Not implemented, lock");
    return undefined;
  }

  requestSignAmino(
    env: Env,
    msgOrigin: string,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions & {
      isADR36WithString?: boolean;
      ethSignType?: EthSignType;
    }
  ): Promise<AminoSignResponse> {
    console.log("Not implemented, requestSignAmino");
    return Promise.resolve(undefined);
  }

  requestSignDirect(
    env: Env,
    msgOrigin: string,
    chainId: string,
    signer: string,
    signDoc: SignDoc,
    signOptions: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    console.log("Not implemented, requestSignDirect");
    return Promise.resolve(undefined);
  }

  restore(): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    console.log("Not implemented, restore");
    return Promise.resolve({ multiKeyStoreInfo: undefined, status: undefined });
  }

  setKeyStoreCoinType(chainId: string, coinType: number): Promise<void> {
    console.log("Not implemented, setKeyStoreCoinType");
    return Promise.resolve(undefined);
  }

  showKeyRing(index: number, password: string): Promise<string> {
    console.log("Not implemented, showKeyRing");
    return Promise.resolve("");
  }

  sign(env: Env, chainId: string, message: Uint8Array): Promise<Uint8Array> {
    console.log("Not implemented, sign");
    return Promise.resolve(undefined);
  }

  unlock(password: string): Promise<KeyRingStatus> {
    console.log("Not implemented, unlock");
    return Promise.resolve(undefined);
  }

  updateNameKeyRing(
    index: number,
    name: string
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, updateNameKeyRing");
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  verifyADR36AminoSignDoc(
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    console.log("Not implemented, verifyADR36AminoSignDoc");
    return Promise.resolve(false);
  }
}

export function initBackground() {
  const router = new RouterBackground(produceEnv);

  init(
    router,
    (prefix: string) => new KVStore(prefix),
    new MessageRequesterInternalToUi(),
    EmbedChainInfos,
    PrivilegedOrigins,
    {
      rng: (array) => {
        return Promise.resolve(crypto.getRandomValues(array));
      },
      scrypt: async (text: string, params: ScryptParams) => {
        return await scrypt.scrypt(
          Buffer.from(text),
          Buffer.from(params.salt, "hex"),
          params.n,
          params.r,
          params.p,
          params.dklen
        );
      },
    },
    {
      create: (params: {
        iconRelativeUrl?: string;
        title: string;
        message: string;
      }) => {
        console.log(`Notification: ${params.title}, ${params.message}`);
        // browser.notifications.create({
        //   type: "basic",
        //   iconUrl: params.iconRelativeUrl
        //     ? browser.runtime.getURL(params.iconRelativeUrl)
        //     : undefined,
        //   title: params.title,
        //   message: params.message,
        // });
      },
    },
    // TODO: ledgerOptions?
    {},
    // TODO: experimentalOptions?,
    {},
    (store, embedChainInfos, commonCrypto) => {
      return new KeyRingService(store, embedChainInfos, commonCrypto);
    }
  );

  router.listen(BACKGROUND_PORT);
}
