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
  encodeSecp256k1Pubkey,
  encodeSecp256k1Signature,
  serializeSignDoc,
} from "@keplr-wallet/cosmos";
import {
  BIP44HDPath,
  CommonCrypto,
  ExportKeyRingData,
  SignMode,
} from "./types";

import { escapeHTML, KVStore, sortObjectByKey } from "@keplr-wallet/common";

import { ChainsService } from "../chains";
import { LedgerApp, LedgerService } from "../ledger";
import {
  BIP44,
  ChainInfo,
  EthSignType,
  KeplrSignOptions,
  AminoSignResponse,
  StdSignature,
  StdSignDoc,
  DirectSignResponse,
} from "@keplr-wallet/types";
import { APP_PORT, Env, KeplrError, WEBPAGE_PORT } from "@keplr-wallet/router";
import { InteractionService } from "../interaction";
import { PermissionService } from "../permission";

import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import Long from "long";
import { Buffer } from "buffer/";
import { trimAminoSignDoc } from "./amino-sign-doc";
import { KeystoneService } from "../keystone";
import { RequestICNSAdr36SignaturesMsg } from "./messages";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { closePopupWindow } from "@keplr-wallet/popup";

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
    ledgerService: LedgerService,
    keystoneService: KeystoneService
  ) {
    this.interactionService = interactionService;
    this.chainsService = chainsService;
    this.permissionService = permissionService;

    this.keyRing = new KeyRing(
      this.embedChainInfos,
      this.kvStore,
      ledgerService,
      keystoneService,
      this.crypto
    );

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    this.keyRing.removeAllKeyStoreCoinType(chainInfo.chainId);
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

  async createKeystoneKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return await this.keyRing.createKeystoneKey(
      env,
      kdf,
      password,
      meta,
      bip44HDPath
    );
  }

  async createLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    cosmosLikeApp?: string
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return await this.keyRing.createLedgerKey(
      env,
      kdf,
      password,
      meta,
      bip44HDPath,
      cosmosLikeApp
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
    const ethereumKeyFeatures = this.getChainEthereumKeyFeatures(chainId);

    if (ethereumKeyFeatures.address || ethereumKeyFeatures.signing) {
      // Check the comment on the method itself.
      this.keyRing.throwErrorIfEthermintWithLedgerButNotSupported(chainId);
    }

    return this.keyRing.getKey(
      chainId,
      this.getChainCoinType(chainId),
      ethereumKeyFeatures.address
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

    signDoc = trimAminoSignDoc(signDoc);
    signDoc = sortObjectByKey(signDoc);

    const coinType = this.getChainCoinType(chainId);
    const ethereumKeyFeatures = this.getChainEthereumKeyFeatures(chainId);

    if (ethereumKeyFeatures.address || ethereumKeyFeatures.signing) {
      // Check the comment on the method itself.
      this.keyRing.throwErrorIfEthermintWithLedgerButNotSupported(chainId);
    }

    const key = await this.keyRing.getKey(
      chainId,
      coinType,
      ethereumKeyFeatures.address
    );
    const bech32Prefix = this.chainsService.getChainInfoOrThrow(chainId)
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
          env,
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
        ethereumKeyFeatures.signing,
        SignMode.Amino
      );

      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async requestSignEIP712CosmosTx_v0(
    env: Env,
    msgOrigin: string,
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };

    signDoc = trimAminoSignDoc(signDoc);
    signDoc = sortObjectByKey(signDoc);

    const coinType = this.getChainCoinType(chainId);
    const ethereumKeyFeatures = this.getChainEthereumKeyFeatures(chainId);

    if (ethereumKeyFeatures.address || ethereumKeyFeatures.signing) {
      // Check the comment on the method itself.
      this.keyRing.throwErrorIfEthermintWithLedgerButNotSupported(chainId);
    }

    const key = await this.keyRing.getKey(
      chainId,
      coinType,
      ethereumKeyFeatures.address
    );
    const bech32Prefix = this.chainsService.getChainInfoOrThrow(chainId)
      .bech32Config.bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new KeplrError("keyring", 231, "Signer mismatched");
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
        isADR36SignDoc: false,
        ethSignType: EthSignType.EIP712,
      }
    )) as StdSignDoc;

    newSignDoc = {
      ...newSignDoc,
      memo: escapeHTML(newSignDoc.memo),
    };

    try {
      const signature = await this.keyRing.signEthereum(
        env,
        chainId,
        coinType,
        Buffer.from(
          JSON.stringify({
            types: eip712.types,
            domain: eip712.domain,
            primaryType: eip712.primaryType,
            message: newSignDoc,
          })
        ),
        EthSignType.EIP712
      );

      return {
        signed: newSignDoc,
        signature: {
          pub_key: encodeSecp256k1Pubkey(key.pubKey),
          // Return eth signature (r | s | v) 65 bytes.
          signature: Buffer.from(signature).toString("base64"),
        },
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
    const coinType = this.getChainCoinType(chainId);
    const ethereumKeyFeatures = this.getChainEthereumKeyFeatures(chainId);

    if (ethereumKeyFeatures.address || ethereumKeyFeatures.signing) {
      // Check the comment on the method itself.
      this.keyRing.throwErrorIfEthermintWithLedgerButNotSupported(chainId);
    }

    const key = await this.keyRing.getKey(
      chainId,
      coinType,
      ethereumKeyFeatures.address
    );
    const bech32Address = new Bech32Address(key.address).toBech32(
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
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

    try {
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        newSignDocBytes,
        ethereumKeyFeatures.signing,
        SignMode.Direct
      );

      return {
        signed: {
          ...newSignDoc,
          accountNumber: Long.fromString(newSignDoc.accountNumber),
        },
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async requestICNSAdr36Signatures(
    env: Env,
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<
    {
      chainId: string;
      bech32Prefix: string;
      bech32Address: string;
      addressHash: "cosmos" | "ethereum";
      pubKey: Uint8Array;
      signatureSalt: number;
      signature: Uint8Array;
    }[]
  > {
    const r: {
      chainId: string;
      bech32Prefix: string;
      bech32Address: string;
      addressHash: "cosmos" | "ethereum";
      pubKey: Uint8Array;
      signatureSalt: number;
      signature: Uint8Array;
    }[] = [];

    const interactionInfo = {
      chainId,
      owner,
      username,
      accountInfos: [] as {
        chainId: string;
        bech32Prefix: string;
        bech32Address: string;
        pubKey: Uint8Array;
      }[],
    };

    {
      // Do this on other code block to avoid variable conflict.
      const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

      Bech32Address.validate(
        contractAddress,
        chainInfo.bech32Config.bech32PrefixAccAddr
      );

      const key = await this.getKey(chainId);
      const bech32Address = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      );

      if (bech32Address !== owner) {
        throw new Error(
          `Unmatched owner: (expected: ${bech32Address}, actual: ${owner})`
        );
      }
    }
    const salt = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

    for (const chainId of addressChainIds) {
      const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

      const key = await this.getKey(chainId);

      const bech32Address = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      );

      interactionInfo.accountInfos.push({
        chainId: chainInfo.chainId,
        bech32Prefix: chainInfo.bech32Config.bech32PrefixAccAddr,
        bech32Address: bech32Address,
        pubKey: key.pubKey,
      });
    }

    await this.interactionService.waitApprove(
      env,
      "/icns/adr36-signatures",
      RequestICNSAdr36SignaturesMsg.type(),
      interactionInfo
    );

    const ownerBech32 = Bech32Address.fromBech32(owner);
    for (const accountInfo of interactionInfo.accountInfos) {
      if (
        ownerBech32.toHex(false) !==
        Bech32Address.fromBech32(accountInfo.bech32Address).toHex(false)
      ) {
        // When only the address is different with owner, the signature is necessary.
        const data = `The following is the information for ICNS registration for ${username}.${accountInfo.bech32Prefix}.

Chain id: ${chainId}
Contract Address: ${contractAddress}
Owner: ${owner}
Salt: ${salt}`;

        const signDoc = makeADR36AminoSignDoc(accountInfo.bech32Address, data);

        const coinType = this.getChainCoinType(accountInfo.chainId);
        const ethereumKeyFeatures = this.getChainEthereumKeyFeatures(
          accountInfo.chainId
        );

        const signature = await this.keyRing
          .sign(
            env,
            accountInfo.chainId,
            coinType,
            serializeSignDoc(signDoc),
            ethereumKeyFeatures.signing,
            SignMode.Message
          )
          .finally(() => {
            if (this.keyRing.type === "keystone") {
              closePopupWindow("default");
            }
          });

        r.push({
          chainId: accountInfo.chainId,
          bech32Prefix: accountInfo.bech32Prefix,
          bech32Address: accountInfo.bech32Address,
          addressHash: ethereumKeyFeatures.signing ? "ethereum" : "cosmos",
          pubKey: new PubKeySecp256k1(accountInfo.pubKey).toBytes(
            // Should return uncompressed format if ethereum.
            // Else return as compressed format.
            ethereumKeyFeatures.signing
          ),
          signatureSalt: salt,
          signature,
        });
      } else {
        // If address is same with owner, there is no need to sign.
        const ethereumKeyFeatures = this.getChainEthereumKeyFeatures(
          accountInfo.chainId
        );

        r.push({
          chainId: accountInfo.chainId,
          bech32Prefix: accountInfo.bech32Prefix,
          bech32Address: accountInfo.bech32Address,
          addressHash: ethereumKeyFeatures.signing ? "ethereum" : "cosmos",
          pubKey: new PubKeySecp256k1(accountInfo.pubKey).toBytes(
            // Should return uncompressed format if ethereum.
            // Else return as compressed format.
            ethereumKeyFeatures.signing
          ),
          signatureSalt: 0,
          signature: new Uint8Array(0),
        });
      }
    }

    return r;
  }

  async verifyADR36AminoSignDoc(
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    const coinType = this.getChainCoinType(chainId);
    const ethereumKeyFeatures = this.getChainEthereumKeyFeatures(chainId);

    const key = await this.keyRing.getKey(
      chainId,
      coinType,
      ethereumKeyFeatures.address
    );
    const bech32Prefix = this.chainsService.getChainInfoOrThrow(chainId)
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
      this.getChainCoinType(chainId),
      message,
      this.getChainEthereumKeyFeatures(chainId).signing
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

  async addKeystoneKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addKeystoneKey(env, kdf, meta, bip44HDPath);
  }

  async addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    cosmosLikeApp?: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    return this.keyRing.addLedgerKey(
      env,
      kdf,
      meta,
      bip44HDPath,
      cosmosLikeApp
    );
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
      this.getChainCoinType(chainId)
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
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    for (const path of paths) {
      const key = await this.keyRing.getKeyFromCoinType(
        path.coinType,
        this.getChainEthereumKeyFeatures(chainId).address
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

  async initializeNonDefaultLedgerApp(env: Env, ledgerApp: LedgerApp) {
    return await this.keyRing.initializeNonDefaultLedgerApp(env, ledgerApp);
  }

  async changeKeyRingName(
    env: Env,
    index: number,
    { defaultName, editable }: { defaultName: string; editable: boolean }
  ): Promise<string> {
    const newName = (await this.interactionService.waitApprove(
      env,
      `/setting/keyring/change/name/${index}`,
      "change-keyring-name",
      { defaultName, editable }
    )) as string;

    await this.updateNameKeyRing(index, newName);

    return newName;
  }

  protected getChainEthereumKeyFeatures(
    chainId: string
  ): { address: boolean; signing: boolean } {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    return {
      address: chainInfo.features?.includes("eth-address-gen") ?? false,
      signing: chainInfo.features?.includes("eth-key-sign") ?? false,
    };
  }

  protected getChainCoinType(chainId: string): number {
    return this.chainsService.getChainInfoOrThrow(chainId).bip44.coinType;
  }
}
