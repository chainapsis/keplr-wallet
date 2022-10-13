import {
  AminoSignResponse,
  encodeSecp256k1Signature,
  serializeSignDoc,
  StdSignature,
  StdSignDoc,
} from "@cosmjs/amino";
import { DirectSignResponse } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
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
import { escapeHTML } from "@keplr-wallet/common";
import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
} from "@keplr-wallet/cosmos";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import {
  APP_PORT,
  BACKGROUND_PORT,
  Env,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { BIP44, EthSignType, KeplrSignOptions } from "@keplr-wallet/types";
import {
  EmbedChainInfos,
  isSinglesigWallet,
  KVStore,
  MessageRequesterInternalToUi,
  PrivilegedOrigins,
  produceEnv,
  RootStore,
  RouterBackground,
} from "@obi-wallet/common";
import { Buffer } from "buffer";
import { Alert } from "react-native";
import scrypt from "scrypt-js";
import invariant from "tiny-invariant";

import { RequestObiSignAndBroadcastMsg } from "../app/injected-provider";

let rootStore: RootStore | null = null;

class KeyRingService extends AbstractKeyRingService {
  protected interactionService!: InteractionService;
  get rootStore(): RootStore {
    if (!rootStore) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      rootStore = require("./root-store").rootStore;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return rootStore!;
  }

  addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, addLedgerKey");
    // @ts-expect-error
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  addMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, addMnemonicKey");
    // @ts-expect-error
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  addPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, addPrivateKey");
    // @ts-expect-error
    return Promise.resolve({ multiKeyStoreInfo: undefined });
  }

  changeKeyStoreFromMultiKeyStore(
    index: number
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, changeKeyStoreFromMultiKeyStore");
    // @ts-expect-error
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
    // @ts-expect-error
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
    // @ts-expect-error
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
    // @ts-expect-error
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
    // @ts-expect-error
    return Promise.resolve({ multiKeyStoreInfo: undefined, status: undefined });
  }

  async enable(env: Env): Promise<KeyRingStatus> {
    // TODO: do something with create-multisig store?
    return KeyRingStatus.UNLOCKED;
  }

  exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    console.log("Not implemented, exportKeyRingDatas");
    return Promise.resolve([]);
  }

  async getKey(chainId: string): Promise<Key> {
    const { address, type } = this.rootStore.walletsStore;

    invariant(address, "Missing wallet address");
    invariant(type, "Missing wallet type");

    switch (type) {
      case "multisig":
        return {
          // TODO:
          algo: "multisig",
          // TODO:
          pubKey: new Uint8Array(),
          address: Bech32Address.fromBech32(address, "juno").address,
          isNanoLedger: true,
        };
      case "singlesig": {
        const wallet = this.rootStore.walletsStore.currentWallet;
        invariant(
          isSinglesigWallet(wallet),
          "Expected `wallet` to be singlesig wallet."
        );
        const publicKey = wallet.publicKey;
        invariant(publicKey, "Missing singlesig public key");

        return {
          algo: "secp256k1",
          pubKey: new Uint8Array(Buffer.from(publicKey.value, "base64")),
          address: Bech32Address.fromBech32(address, "juno").address,
          isNanoLedger: true,
        };
      }
      default:
        throw new Error("Unsupported wallet type");
    }
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
    // @ts-expect-error
    return undefined;
  }

  init(
    interactionService: InteractionService,
    chainsService: ChainsService,
    permissionService: PermissionService,
    ledgerService: LedgerService
  ): void {
    this.chainsService = chainsService;
    this.interactionService = interactionService;
    this.permissionService = permissionService;
    // this.kvStore = new KVStore("create-multisig-store");

    // TODO: permissionService
    // TODO: key ring
  }

  get keyRingStatus(): KeyRingStatus {
    console.log("Not implemented, keyRingStatus");
    // @ts-expect-error
    return undefined;
  }

  lock(): KeyRingStatus {
    console.log("Not implemented, lock");
    // @ts-expect-error
    return undefined;
  }

  async requestSignAmino(
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
    const { walletsStore } = this.rootStore;
    const wallet = walletsStore.currentWallet;

    if (!isSinglesigWallet(wallet)) {
      Alert.alert(
        "Unsupported wallet type",
        "Only singlesig wallets are supported"
      );
      throw new KeplrError("keyring", 101, "Unsupported wallet type");
    }

    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };
    const key = await this.getKey(chainId);

    const bech32Prefix = (await this.chainsService.getChainInfo(chainId))
      .bech32Config.bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new KeplrError("keyring", 231, "Signer mismatched");
    }

    const isADR36SignDoc = checkAndValidateADR36AminoSignDoc(
      signDoc,
      bech32Prefix
    );
    if (isADR36SignDoc) {
      if (signDoc.msgs[0].value.signer !== signer) {
        throw new KeplrError("keyring", 233, "Unmatched signer in sign doc");
      }
    }

    if (signOptions.isADR36WithString != null && !isADR36SignDoc) {
      throw new KeplrError(
        "keyring",
        236,
        'Sign doc is not for ADR-36. But, "isADR36WithString" option is defined'
      );
    }

    if (signOptions.ethSignType && !isADR36SignDoc) {
      throw new Error(
        "Eth sign type can be requested with only ADR-36 amino sign doc"
      );
    }

    let newSignDoc = (await this.interactionService.waitApprove(
      env,
      "/sign",
      "request-sign",
      {
        msgOrigin,
        chainId,
        mode: "amino",
        signDoc,
        signer,
        signOptions,
        isADR36SignDoc,
        isADR36WithString: signOptions.isADR36WithString,
        ethSignType: signOptions.ethSignType,
      }
    )) as StdSignDoc;

    newSignDoc = {
      ...newSignDoc,
      memo: escapeHTML(newSignDoc.memo),
    };

    if (isADR36SignDoc) {
      // Validate the new sign doc, if it was for ADR-36.
      if (checkAndValidateADR36AminoSignDoc(signDoc, bech32Prefix)) {
        if (signDoc.msgs[0].value.signer !== signer) {
          throw new KeplrError(
            "keyring",
            232,
            "Unmatched signer in new sign doc"
          );
        }
      } else {
        throw new KeplrError(
          "keyring",
          237,
          "Signing request was for ADR-36. But, accidentally, new sign doc is not for ADR-36"
        );
      }
    }

    try {
      invariant(wallet.address, "Expected `address` to be defined.");
      invariant(wallet.privateKey, "Expected `privateKey` to be set.");

      const privateKey = new PrivKeySecp256k1(wallet.privateKey);
      const signature = privateKey.sign(serializeSignDoc(newSignDoc));
      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
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
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  restore(): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    console.log("Not implemented, restore");
    // @ts-expect-error
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
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  unlock(password: string): Promise<KeyRingStatus> {
    console.log("Not implemented, unlock");
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  updateNameKeyRing(
    index: number,
    name: string
  ): Promise<{ multiKeyStoreInfo: MultiKeyStoreInfoWithSelected }> {
    console.log("Not implemented, updateNameKeyRing");
    // @ts-expect-error
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
  let keyRingService: KeyRingService;
  const router = new RouterBackground(produceEnv);

  const { interactionService } = init(
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
      keyRingService = new KeyRingService(store, embedChainInfos, commonCrypto);
      return keyRingService;
    }
  );

  router.registerMessage(RequestObiSignAndBroadcastMsg);
  router.addHandler("obi", async (env: Env, msg: Message<unknown>) => {
    const message = msg as RequestObiSignAndBroadcastMsg;

    const response = (await interactionService.waitApprove(
      env,
      "/sign",
      "request-sign-and-broadcast",
      {
        address: message.address,
        messages: message.messages,
      }
    )) as DeliverTxResponse;

    return response;
  });

  router.listen(BACKGROUND_PORT);
}
