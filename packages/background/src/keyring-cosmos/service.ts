import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring-v2";
import {
  AminoSignResponse,
  ChainInfo,
  DirectSignResponse,
  KeplrSignOptions,
  Key,
  StdSignature,
  StdSignDoc,
} from "@keplr-wallet/types";
import { APP_PORT, Env, KeplrError } from "@keplr-wallet/router";
import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
  encodeSecp256k1Pubkey,
  encodeSecp256k1Signature,
  makeADR36AminoSignDoc,
  serializeSignDoc,
  verifyADR36AminoSignDoc,
} from "@keplr-wallet/cosmos";
import { escapeHTML, sortObjectByKey } from "@keplr-wallet/common";
import { trimAminoSignDoc } from "../keyring/amino-sign-doc";
import { InteractionService } from "../interaction";
import { Buffer } from "buffer/";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import Long from "long";

export class KeyRingCosmosService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService
  ) {}

  async init() {
    // TODO: ?
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return await this.getKey(this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const pubKey = await this.keyRingService.getPubKey(chainId, vaultId);

    const isEthermintLike = this.isEthermintLike(chainInfo);

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const address = (() => {
      if (isEthermintLike) {
        return pubKey.getEthAddress();
      }

      return pubKey.getCosmosAddress();
    })();

    const bech32Address = new Bech32Address(address);

    return {
      name: this.keyRingService.getKeyRingName(vaultId),
      algo: isEthermintLike ? "ethsecp256k1" : "secp256k1",
      pubKey: pubKey.toBytes(),
      address,
      bech32Address: bech32Address.toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      ),
      isNanoLedger: keyInfo.type === "ledger",
      // TODO
      isKeystone: false,
    };
  }

  async computeNotFinalizedMnemonicKeyAddresses(
    vaultId: string,
    chainId: string
  ): Promise<
    {
      coinType: number;
      bech32Address: string;
    }[]
  > {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const coinTypes = [chainInfo.bip44.coinType];

    if (chainInfo.alternativeBIP44s) {
      coinTypes.push(...chainInfo.alternativeBIP44s.map((alt) => alt.coinType));
    }

    const isEthermintLike = this.isEthermintLike(chainInfo);

    const res: {
      coinType: number;
      bech32Address: string;
    }[] = [];

    for (const coinType of coinTypes) {
      const pubKey =
        await this.keyRingService.getPubKeyWithNotFinalizedCoinType(
          chainId,
          vaultId,
          coinType
        );

      const address = (() => {
        if (isEthermintLike) {
          return pubKey.getEthAddress();
        }

        return pubKey.getCosmosAddress();
      })();

      const bech32Address = new Bech32Address(address);

      res.push({
        coinType,
        bech32Address: bech32Address.toBech32(
          chainInfo.bech32Config.bech32PrefixAccAddr
        ),
      });
    }

    return res;
  }

  async signAminoSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    return await this.signAmino(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      signDoc,
      signOptions
    );
  }

  async signAmino(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const isEthermintLike = this.isEthermintLike(chainInfo);

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };

    signDoc = trimAminoSignDoc(signDoc);
    signDoc = sortObjectByKey(signDoc);

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const isADR36SignDoc = checkAndValidateADR36AminoSignDoc(
      signDoc,
      bech32Prefix
    );
    if (isADR36SignDoc) {
      if (signDoc.msgs[0].value.signer !== signer) {
        throw new Error("Unmatched signer in sign doc");
      }
      return await this.signAminoADR36(
        env,
        origin,
        vaultId,
        chainId,
        signer,
        Buffer.from(signDoc.msgs[0].value.data, "base64"),
        {
          isADR36WithString: false,
        }
      );
    }

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-cosmos",
      "request-sign-cosmos",
      {
        origin,
        chainId,
        mode: "amino",
        signDoc,
        signer,
        signOptions,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { newSignDoc: StdSignDoc; signature?: Uint8Array }) => {
        let newSignDoc = res.newSignDoc;

        newSignDoc = {
          ...newSignDoc,
          memo: escapeHTML(newSignDoc.memo),
        };

        let signature: Uint8Array;

        if (keyInfo.type === "ledger") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature if ledger");
          }
          signature = res.signature;
        } else {
          signature = await this.keyRingService.sign(
            chainId,
            vaultId,
            serializeSignDoc(newSignDoc),
            isEthermintLike ? "keccak256" : "sha256"
          );
        }

        return {
          signed: newSignDoc,
          signature: encodeSecp256k1Signature(key.pubKey, signature),
        };
      }
    );
  }

  async privilegeSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ) {
    // TODO: 이 기능은 ledger에서는 사용할 수 없고 어케 이 문제를 해결할지도 아직 명확하지 않음.

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const vaultId = this.keyRingService.selectedVaultId;

    const isEthermintLike = this.isEthermintLike(chainInfo);

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };

    signDoc = trimAminoSignDoc(signDoc);
    signDoc = sortObjectByKey(signDoc);

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const isADR36SignDoc = checkAndValidateADR36AminoSignDoc(
      signDoc,
      bech32Prefix
    );
    if (isADR36SignDoc) {
      throw new Error("Can't use ADR-36 sign doc");
    }

    if (!signDoc.msgs || signDoc.msgs.length === 0) {
      throw new Error("No msgs");
    }

    for (const msg of signDoc.msgs) {
      // Some chains modify types for obscure reasons. For now, treat it like this:
      const i = msg.type.indexOf("/");
      if (i < 0) {
        throw new Error("Invalid msg type");
      }
      const action = msg.type.slice(i + 1);
      if (action !== "MsgWithdrawDelegationReward") {
        throw new Error("Invalid msg type");
      }
    }

    try {
      const signature = await this.keyRingService.sign(
        chainId,
        vaultId,
        serializeSignDoc(signDoc),
        isEthermintLike ? "keccak256" : "sha256"
      );

      return {
        signed: signDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async signAminoADR36Selected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    data: Uint8Array,
    signOptions: {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
    }
  ): Promise<AminoSignResponse> {
    return await this.signAminoADR36(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      data,
      signOptions
    );
  }

  async signAminoADR36(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    data: Uint8Array,
    signOptions: {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
    }
  ): Promise<AminoSignResponse> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const isEthermintLike = this.isEthermintLike(chainInfo);

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const signDoc = makeADR36AminoSignDoc(signer, data);
    return await this.interactionService.waitApproveV2(
      env,
      "/sign-cosmos-adr36",
      "request-sign-cosmos",
      {
        origin,
        chainId,
        mode: "amino",
        signDoc,
        signer,
        signOptions,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { newSignDoc: StdSignDoc; signature?: Uint8Array }) => {
        const newSignDoc = res.newSignDoc;

        if (!checkAndValidateADR36AminoSignDoc(newSignDoc)) {
          throw new Error("Invalid ADR36 sign doc delivered from view");
        }

        let signature: Uint8Array;

        if (keyInfo.type === "ledger") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature if ledger");
          }
          signature = res.signature;
        } else {
          signature = await this.keyRingService.sign(
            chainId,
            vaultId,
            serializeSignDoc(newSignDoc),
            isEthermintLike ? "keccak256" : "sha256"
          );
        }

        return {
          signed: newSignDoc,
          signature: encodeSecp256k1Signature(key.pubKey, signature),
        };
      }
    );
  }

  async signDirect(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    signDoc: SignDoc,
    signOptions: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const isEthermintLike = this.isEthermintLike(chainInfo);

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-cosmos",
      "request-sign-cosmos",
      {
        origin,
        chainId,
        mode: "direct",
        signDocBytes: SignDoc.encode(signDoc).finish(),
        signer,
        signOptions,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { newSignDocBytes: Uint8Array; signature?: Uint8Array }) => {
        const newSignDocBytes = res.newSignDocBytes;
        const newSignDoc = SignDoc.decode(newSignDocBytes);

        let signature: Uint8Array;

        // XXX: 참고로 어차피 현재 ledger app이 direct signing을 지원하지 않는다. 그냥 일단 처리해놓은 것.
        if (keyInfo.type === "ledger") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature if ledger");
          }
          signature = res.signature;
        } else {
          signature = await this.keyRingService.sign(
            chainId,
            vaultId,
            newSignDocBytes,
            isEthermintLike ? "keccak256" : "sha256"
          );
        }

        return {
          signed: {
            ...newSignDoc,
            accountNumber: Long.fromString(newSignDoc.accountNumber),
          },
          signature: encodeSecp256k1Signature(key.pubKey, signature),
        };
      }
    );
  }

  async signDirectSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    signDoc: SignDoc,
    signOptions: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    return await this.signDirect(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      signDoc,
      signOptions
    );
  }

  async verifyAminoADR36Selected(
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    return await this.verifyAminoADR36(
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      data,
      signature
    );
  }

  async verifyAminoADR36(
    vaultId: string,
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }
    if (signature.pub_key.type !== "tendermint/PubKeySecp256k1") {
      throw new Error(`Unsupported type of pub key: ${signature.pub_key.type}`);
    }
    if (
      Buffer.from(key.pubKey).toString("base64") !== signature.pub_key.value
    ) {
      throw new Error("Pub key unmatched");
    }

    const signDoc = makeADR36AminoSignDoc(signer, data);

    return verifyADR36AminoSignDoc(
      bech32Prefix,
      signDoc,
      Buffer.from(signature.pub_key.value, "base64"),
      Buffer.from(signature.signature, "base64")
    );
  }

  async requestSignEIP712CosmosTx_v0_selected(
    env: Env,
    origin: string,
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
    return this.requestSignEIP712CosmosTx_v0(
      env,
      this.keyRingService.selectedVaultId,
      origin,
      chainId,
      signer,
      eip712,
      signDoc,
      signOptions
    );
  }

  async requestSignEIP712CosmosTx_v0(
    env: Env,
    vaultId: string,
    origin: string,
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
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const isEthermintLike = this.isEthermintLike(chainInfo);

    if (!isEthermintLike) {
      throw new Error("This feature is only usable on cosmos-sdk evm chain");
    }

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (keyInfo.type !== "ledger") {
      throw new Error("This feature is only usable on ledger ethereum app");
    }

    if (isEthermintLike && keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };

    signDoc = trimAminoSignDoc(signDoc);
    signDoc = sortObjectByKey(signDoc);

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-cosmos",
      "request-sign-cosmos",
      {
        origin,
        chainId,
        mode: "amino",
        signDoc,
        signer,
        signOptions,
        eip712,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { newSignDoc: StdSignDoc; signature?: Uint8Array }) => {
        let newSignDoc = res.newSignDoc;

        newSignDoc = {
          ...newSignDoc,
          memo: escapeHTML(newSignDoc.memo),
        };

        if (!res.signature || res.signature.length === 0) {
          throw new Error("Frontend should provide signature if ledger");
        }

        return {
          signed: newSignDoc,
          signature: {
            pub_key: encodeSecp256k1Pubkey(key.pubKey),
            // Return eth signature (r | s | v) 65 bytes.
            signature: Buffer.from(res.signature).toString("base64"),
          },
        };
      }
    );
  }

  // secret wasm에서만 사용됨
  async legacySignArbitraryInternal(
    chainId: string,
    memo: string
  ): Promise<Uint8Array> {
    return await this.keyRingService.sign(
      chainId,
      this.keyRingService.selectedVaultId,
      Buffer.from(
        JSON.stringify({
          account_number: 0,
          chain_id: chainId,
          fee: [],
          memo: memo,
          msgs: [],
          sequence: 0,
        })
      ),
      "sha256"
    );
  }

  protected isEthermintLike(chainInfo: ChainInfo): boolean {
    return (
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign")
    );
  }

  // XXX: There are other way to handle tx with ethermint on ledger.
  //      However, some chains have probably competitive spirit with evmos.
  //      They make unnecessary and silly minor changes to ethermint spec.
  //      Thus, there is a probability that it will potentially not work on other chains and they blame us.
  //      So, block them explicitly for now.
  public static throwErrorIfEthermintWithLedgerButNotSupported(
    chainId: string
  ) {
    if (!chainId.startsWith("evmos_") && !chainId.startsWith("injective")) {
      throw new KeplrError(
        "keyring",
        152,
        "Ledger is unsupported for this chain"
      );
    }
  }
}
