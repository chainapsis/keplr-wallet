import {
  Key,
  KeyRing,
  KeyRingStatus,
  MultiKeyStoreInfoWithSelected,
} from "./keyring";

import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
  makeADR36AminoSignDoc,
  verifyADR36AminoSignDoc,
} from "@keplr-wallet/cosmos";
import { BIP44HDPath, CommonCrypto, ExportKeyRingData } from "./types";

import { escapeHTML, KVStore } from "@keplr-wallet/common";

import { ChainsService } from "../chains";
import { LedgerService } from "../ledger";
import {
  BIP44,
  ChainInfo,
  EthSignType,
  KeplrSignOptions,
} from "@keplr-wallet/types";
import { APP_PORT, Env, KeplrError, WEBPAGE_PORT } from "@keplr-wallet/router";
import { InteractionService } from "../interaction";
import { PermissionService } from "../permission";

import {
  encodeSecp256k1Signature,
  serializeSignDoc,
  AminoSignResponse,
  StdSignDoc,
  StdSignature,
  encodeSecp256k1Pubkey,
} from "@cosmjs/launchpad";
import { DirectSignResponse, makeSignBytes } from "@cosmjs/proto-signing";

import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import Long from "long";
import { Buffer } from "buffer/";

export class KeyRingService {
  private keyRing!: KeyRing;

  protected interactionService!: InteractionService;
  public chainsService!: ChainsService;
  public permissionService!: PermissionService;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly embedChainInfos: ChainInfo[],
    protected readonly crypto: CommonCrypto
  ) {}

  init(
    interactionService: InteractionService,
    chainsService: ChainsService,
    permissionService: PermissionService,
    ledgerService: LedgerService
  ) {
    this.interactionService = interactionService;
    this.chainsService = chainsService;
    this.permissionService = permissionService;

    this.keyRing = new KeyRing(
      this.embedChainInfos,
      this.kvStore,
      ledgerService,
      this.crypto
    );

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected readonly onChainRemoved = (chainId: string) => {
    this.keyRing.removeAllKeyStoreCoinType(chainId);
  };

  async restore(): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    await this.keyRing.restore();
    return {
      status: this.keyRing.status,
      multiKeyStoreInfo: this.keyRing.getMultiKeyStoreInfo(),
    };
  }

  async enable(env: Env): Promise<KeyRingStatus> {
    if (this.keyRing.status === KeyRingStatus.EMPTY) {
      throw new KeplrError("keyring", 261, "key doesn't exist");
    }

    if (this.keyRing.status === KeyRingStatus.NOTLOADED) {
      await this.keyRing.restore();
    }

    if (this.keyRing.status === KeyRingStatus.LOCKED) {
      await this.interactionService.waitApprove(env, "/unlock", "unlock", {});
      return this.keyRing.status;
    }

    return this.keyRing.status;
  }

  get keyRingStatus(): KeyRingStatus {
    return this.keyRing.status;
  }

  async deleteKeyRing(
    index: number,
    password: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
    status: KeyRingStatus;
  }> {
    let keyStoreChanged = false;

    try {
      const result = await this.keyRing.deleteKeyRing(index, password);
      keyStoreChanged = result.keyStoreChanged;
      return {
        multiKeyStoreInfo: result.multiKeyStoreInfo,
        status: this.keyRing.status,
      };
    } finally {
      if (keyStoreChanged) {
        this.interactionService.dispatchEvent(
          WEBPAGE_PORT,
          "keystore-changed",
          {}
        );
      }
    }
  }

  async updateNameKeyRing(
    index: number,
    name: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    const multiKeyStoreInfo = await this.keyRing.updateNameKeyRing(index, name);
    return {
      multiKeyStoreInfo,
    };
  }

  async showKeyRing(index: number, password: string): Promise<string> {
    return await this.keyRing.showKeyRing(index, password);
  }

  async createMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // TODO: Check mnemonic checksum.
    return await this.keyRing.createMnemonicKey(
      kdf,
      mnemonic,
      password,
      meta,
      bip44HDPath
    );
  }

  async createPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return await this.keyRing.createPrivateKey(kdf, privateKey, password, meta);
  }

  async createLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return await this.keyRing.createLedgerKey(
      env,
      kdf,
      password,
      meta,
      bip44HDPath
    );
  }

  lock(): KeyRingStatus {
    this.keyRing.lock();
    return this.keyRing.status;
  }

  async unlock(password: string): Promise<KeyRingStatus> {
    await this.keyRing.unlock(password);

    return this.keyRing.status;
  }

  async getKey(chainId: string): Promise<Key> {
    return this.keyRing.getKey(
      chainId,
      await this.chainsService.getChainCoinType(chainId),
      (await this.chainsService.getChainEthereumKeyFeatures(chainId)).address
    );
  }

  getKeyStoreMeta(key: string): string {
    return this.keyRing.getKeyStoreMeta(key);
  }

  getKeyRingType(): string {
    return this.keyRing.type;
  }

  async requestSignAmino(
    env: Env,
    msgOrigin: string,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions & {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
      ethSignType?: EthSignType;
    }
  ): Promise<AminoSignResponse> {
    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };

    const coinType = await this.chainsService.getChainCoinType(chainId);
    const ethereumKeyFeatures = await this.chainsService.getChainEthereumKeyFeatures(
      chainId
    );

    const key = await this.keyRing.getKey(
      chainId,
      coinType,
      ethereumKeyFeatures.address
    );
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

    // Handle Ethereum signing
    if (signOptions.ethSignType) {
      if (newSignDoc.msgs.length !== 1) {
        // Validate number of messages
        throw new Error("Invalid number of messages for Ethereum sign request");
      }

      const signBytes = Buffer.from(newSignDoc.msgs[0].value.data, "base64");

      try {
        const signatureBytes = await this.keyRing.signEthereum(
          chainId,
          coinType,
          signBytes,
          signOptions.ethSignType
        );

        return {
          signed: newSignDoc, // Included to match return type
          signature: {
            pub_key: encodeSecp256k1Pubkey(key.pubKey), // Included to match return type
            signature: Buffer.from(signatureBytes).toString("base64"), // No byte limit
          },
        };
      } finally {
        this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
      }
    }

    try {
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        serializeSignDoc(newSignDoc),
        ethereumKeyFeatures.signing
      );

      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async requestSignDirect(
    env: Env,
    msgOrigin: string,
    chainId: string,
    signer: string,
    signDoc: SignDoc,
    signOptions: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    const coinType = await this.chainsService.getChainCoinType(chainId);
    const ethereumKeyFeatures = await this.chainsService.getChainEthereumKeyFeatures(
      chainId
    );

    const key = await this.keyRing.getKey(
      chainId,
      coinType,
      ethereumKeyFeatures.address
    );
    const bech32Address = new Bech32Address(key.address).toBech32(
      (await this.chainsService.getChainInfo(chainId)).bech32Config
        .bech32PrefixAccAddr
    );
    if (signer !== bech32Address) {
      throw new KeplrError("keyring", 231, "Signer mismatched");
    }

    const newSignDocBytes = (await this.interactionService.waitApprove(
      env,
      "/sign",
      "request-sign",
      {
        msgOrigin,
        chainId,
        mode: "direct",
        signDocBytes: SignDoc.encode(signDoc).finish(),
        signer,
        signOptions,
      }
    )) as Uint8Array;

    const newSignDoc = SignDoc.decode(newSignDocBytes);
    const {
      accountNumber: newSignDocAccountNumber,
      ...newSignDocRest
    } = newSignDoc;
    const cosmJSSignDoc = {
      ...newSignDocRest,
      accountNumber: Long.fromString(newSignDocAccountNumber),
    };

    try {
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        makeSignBytes(cosmJSSignDoc),
        ethereumKeyFeatures.signing
      );

      return {
        signed: cosmJSSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async verifyADR36AminoSignDoc(
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    const coinType = await this.chainsService.getChainCoinType(chainId);
    const ethereumKeyFeatures = await this.chainsService.getChainEthereumKeyFeatures(
      chainId
    );

    const key = await this.keyRing.getKey(
      chainId,
      coinType,
      ethereumKeyFeatures.address
    );
    const bech32Prefix = (await this.chainsService.getChainInfo(chainId))
      .bech32Config.bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new KeplrError("keyring", 231, "Signer mismatched");
    }
    if (signature.pub_key.type !== "tendermint/PubKeySecp256k1") {
      throw new KeplrError(
        "keyring",
        211,
        `Unsupported type of pub key: ${signature.pub_key.type}`
      );
    }
    if (
      Buffer.from(key.pubKey).toString("base64") !== signature.pub_key.value
    ) {
      throw new KeplrError("keyring", 210, "Pub key unmatched");
    }

    const signDoc = makeADR36AminoSignDoc(signer, data);

    return verifyADR36AminoSignDoc(
      bech32Prefix,
      signDoc,
      Buffer.from(signature.pub_key.value, "base64"),
      Buffer.from(signature.signature, "base64")
    );
  }

  async sign(
    env: Env,
    chainId: string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    return this.keyRing.sign(
      env,
      chainId,
      await this.chainsService.getChainCoinType(chainId),
      message,
      (await this.chainsService.getChainEthereumKeyFeatures(chainId)).signing
    );
  }

  async addMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addMnemonicKey(kdf, mnemonic, meta, bip44HDPath);
  }

  async addPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addPrivateKey(kdf, privateKey, meta);
  }

  async addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addLedgerKey(env, kdf, meta, bip44HDPath);
  }

  public async changeKeyStoreFromMultiKeyStore(
    index: number
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    try {
      return await this.keyRing.changeKeyStoreFromMultiKeyStore(index);
    } finally {
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }
  }

  public checkPassword(password: string): boolean {
    return this.keyRing.checkPassword(password);
  }

  getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    return this.keyRing.getMultiKeyStoreInfo();
  }

  isKeyStoreCoinTypeSet(chainId: string): boolean {
    return this.keyRing.isKeyStoreCoinTypeSet(chainId);
  }

  async setKeyStoreCoinType(chainId: string, coinType: number): Promise<void> {
    const prevCoinType = this.keyRing.computeKeyStoreCoinType(
      chainId,
      await this.chainsService.getChainCoinType(chainId)
    );

    await this.keyRing.setKeyStoreCoinType(chainId, coinType);

    if (prevCoinType !== coinType) {
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }
  }

  async getKeyStoreBIP44Selectables(
    chainId: string,
    paths: BIP44[]
  ): Promise<{ readonly path: BIP44; readonly bech32Address: string }[]> {
    if (this.isKeyStoreCoinTypeSet(chainId)) {
      return [];
    }

    const result = [];
    const chainInfo = await this.chainsService.getChainInfo(chainId);

    for (const path of paths) {
      const key = await this.keyRing.getKeyFromCoinType(
        path.coinType,
        (await this.chainsService.getChainEthereumKeyFeatures(chainId)).address
      );
      const bech32Address = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      );

      result.push({
        path,
        bech32Address,
      });
    }

    return result;
  }

  async exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    return await this.keyRing.exportKeyRingDatas(password);
  }
}
