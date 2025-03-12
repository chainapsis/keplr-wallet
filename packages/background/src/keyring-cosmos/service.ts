import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import {
  AminoSignResponse,
  ChainInfo,
  DirectAuxSignResponse,
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
  TendermintTxTracer,
  verifyADR36AminoSignDoc,
} from "@keplr-wallet/cosmos";
import { escapeHTML, sortObjectByKey } from "@keplr-wallet/common";
import { trimAminoSignDoc } from "./amino-sign-doc";
import { InteractionService } from "../interaction";
import { Buffer } from "buffer/";
import {
  AuthInfo,
  SignDoc,
  SignDocDirectAux,
  TxBody,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import Long from "long";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { AnalyticsService } from "../analytics";
import { ChainsUIService } from "../chains-ui";

export class KeyRingCosmosService {
  constructor(
    protected readonly chainsService: ChainsService,
    public readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly msgPrivilegedOrigins: string[]
  ) {}

  async init() {
    // TODO: ?

    this.chainsService.addChainSuggestedHandler(
      this.onChainSuggested.bind(this)
    );
  }

  async onChainSuggested(chainInfo: ChainInfo): Promise<void> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    try {
      const selectedVaultId = this.keyRingService.selectedVaultId;
      if (selectedVaultId) {
        // In general, since getKey is called on the webpage immediately after the suggest chain,
        // if we can select the coin type at this point, select it.
        // (In fact, the only thing this function is useful for now is keystone.
        //  If a suggested chain has a coin type which is not supported on keystone and requires a coin type other than 118, it is immediately set to 118)
        if (
          this.keyRingService.needKeyCoinTypeFinalize(
            selectedVaultId,
            chainInfo.chainId
          )
        ) {
          const candidates = await this.computeNotFinalizedKeyAddresses(
            selectedVaultId,
            chainInfo.chainId
          );
          if (candidates.length === 1) {
            this.keyRingService.finalizeKeyCoinType(
              selectedVaultId,
              chainInfo.chainId,
              candidates[0].coinType
            );
          }
        }
      }
    } catch (e) {
      console.log(e);
      // Ignore error
    }
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return await this.getKey(this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const pubKey = await this.keyRingService.getPubKey(chainId, vaultId);

    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const evmInfo = ChainsService.getEVMInfo(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const address = (() => {
      if (isEthermintLike || evmInfo !== undefined) {
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
        chainInfo.bech32Config?.bech32PrefixAccAddr ?? ""
      ),
      ethereumHexAddress: bech32Address.toHex(true),
      isNanoLedger: keyInfo.type === "ledger",
      isKeystone: keyInfo.type === "keystone",
    };
  }

  async computeNotFinalizedKeyAddresses(
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

    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);

    const res: {
      coinType: number;
      bech32Address: string;
    }[] = [];

    for (const coinType of coinTypes) {
      let pubKey: PubKeySecp256k1;
      try {
        pubKey = await this.keyRingService.getPubKeyWithNotFinalizedCoinType(
          chainId,
          vaultId,
          coinType
        );
      } catch (e) {
        console.log(e);
        continue;
      }

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
          chainInfo.bech32Config?.bech32PrefixAccAddr ?? ""
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
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
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
        ?.bech32PrefixAccAddr ?? "";
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
        pubKey: key.pubKey,
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

        if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature");
          }
          signature = res.signature;
        } else {
          const _sig = await this.keyRingService.sign(
            chainId,
            vaultId,
            serializeSignDoc(newSignDoc),
            isEthermintLike ? "keccak256" : "sha256"
          );
          signature = new Uint8Array([..._sig.r, ..._sig.s]);
        }

        const msgTypes = newSignDoc.msgs
          .filter((msg) => msg.type)
          .map((msg) => msg.type);

        this.analyticsService.logEventIgnoreError("tx_signed", {
          chainId,
          isInternal: env.isInternalMsg,
          origin,
          signMode: "amino",
          msgTypes,
          isADR36SignDoc: false,
        });

        try {
          this.trackError(chainInfo, signer, newSignDoc.sequence, {
            isInternal: env.isInternalMsg,
            origin,
            signMode: "amino",
            msgTypes,
          });
        } catch (e) {
          console.log(e);
        }

        return {
          signed: newSignDoc,
          signature: encodeSecp256k1Signature(key.pubKey, signature),
        };
      }
    );
  }

  async privilegeSignAminoWithdrawRewards(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ) {
    // TODO: 이 기능은 ledger에서는 사용할 수 없고 어케 이 문제를 해결할지도 아직 명확하지 않음.

    if (!env.isInternalMsg && !this.msgPrivilegedOrigins.includes(origin)) {
      throw new Error("Permission Rejected");
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }

    const vaultId = this.keyRingService.selectedVaultId;

    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
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
        ?.bech32PrefixAccAddr ?? "";
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
      if (action !== "MsgWithdrawDelegationReward" && action !== "ClaimYield") {
        throw new Error("Invalid msg type");
      }
    }

    try {
      const _sig = await this.keyRingService.sign(
        chainId,
        vaultId,
        serializeSignDoc(signDoc),
        isEthermintLike ? "keccak256" : "sha256"
      );
      const signature = new Uint8Array([..._sig.r, ..._sig.s]);

      this.analyticsService.logEventIgnoreError("tx_signed", {
        chainId,
        isInternal: env.isInternalMsg,
        origin,
        signMode: "amino",
        privileged: "withdrawRewards",
      });

      return {
        signed: signDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async privilegeSignAminoDelegate(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ) {
    // TODO: 이 기능은 ledger에서는 사용할 수 없고 어케 이 문제를 해결할지도 아직 명확하지 않음.

    if (!env.isInternalMsg && !this.msgPrivilegedOrigins.includes(origin)) {
      throw new Error("Permission Rejected");
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }

    const vaultId = this.keyRingService.selectedVaultId;

    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
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
        ?.bech32PrefixAccAddr ?? "";
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
      if (action !== "MsgDelegate") {
        throw new Error("Invalid msg type");
      }
    }

    try {
      const _sig = await this.keyRingService.sign(
        chainId,
        vaultId,
        serializeSignDoc(signDoc),
        isEthermintLike ? "keccak256" : "sha256"
      );
      const signature = new Uint8Array([..._sig.r, ..._sig.s]);

      this.analyticsService.logEventIgnoreError("tx_signed", {
        chainId,
        isInternal: env.isInternalMsg,
        origin,
        signMode: "amino",
        privileged: "delegate",
      });

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
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        ?.bech32PrefixAccAddr ?? "";
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
        pubKey: key.pubKey,
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

        if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature");
          }
          signature = res.signature;
        } else {
          const _sig = await this.keyRingService.sign(
            chainId,
            vaultId,
            serializeSignDoc(newSignDoc),
            isEthermintLike ? "keccak256" : "sha256"
          );
          signature = new Uint8Array([..._sig.r, ..._sig.s]);
        }

        const msgTypes = newSignDoc.msgs
          .filter((msg) => msg.type)
          .map((msg) => msg.type);

        this.analyticsService.logEventIgnoreError("tx_signed", {
          chainId,
          isInternal: env.isInternalMsg,
          origin,
          signMode: "amino",
          msgTypes,
          isADR36SignDoc: true,
        });

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
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        ?.bech32PrefixAccAddr ?? "";
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
        pubKey: key.pubKey,
        signOptions,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { newSignDocBytes: Uint8Array; signature?: Uint8Array }) => {
        const newSignDocBytes = res.newSignDocBytes;
        const newSignDoc = SignDoc.decode(newSignDocBytes);

        let signature: Uint8Array;

        // XXX: 참고로 어차피 현재 ledger app이 direct signing을 지원하지 않는다. 그냥 일단 처리해놓은 것.
        if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature");
          }
          signature = res.signature;
        } else {
          const _sig = await this.keyRingService.sign(
            chainId,
            vaultId,
            newSignDocBytes,
            isEthermintLike ? "keccak256" : "sha256"
          );
          signature = new Uint8Array([..._sig.r, ..._sig.s]);
        }

        const msgTypes = TxBody.decode(newSignDoc.bodyBytes).messages.map(
          (msg) => msg.typeUrl
        );

        this.analyticsService.logEventIgnoreError("tx_signed", {
          chainId,
          isInternal: env.isInternalMsg,
          origin,
          signMode: "direct",
          msgTypes,
        });

        try {
          const authInfo = AuthInfo.decode(newSignDoc.authInfoBytes);
          if (authInfo.signerInfos.length === 1) {
            this.trackError(
              chainInfo,
              signer,
              authInfo.signerInfos[0].sequence,
              {
                isInternal: env.isInternalMsg,
                origin,
                signMode: "direct",
                msgTypes,
              }
            );
          }
        } catch (e) {
          console.log(e);
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

  async signDirectAux(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    signDoc: SignDocDirectAux,
    // preferNoSetMemo 빼고는 다 무시됨
    signOptions: Exclude<
      KeplrSignOptions,
      "preferNoSetFee" | "disableBalanceCheck"
    >
  ): Promise<DirectAuxSignResponse> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        ?.bech32PrefixAccAddr ?? "";
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
        signDocBytes: SignDocDirectAux.encode(signDoc).finish(),
        isDirectAux: true,
        signer,
        pubKey: key.pubKey,
        signOptions: {
          preferNoSetMemo: signOptions.preferNoSetMemo,
          disableBalanceCheck: true,
          preferNoSetFee: true,
        },
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { newSignDocBytes: Uint8Array; signature?: Uint8Array }) => {
        const newSignDocBytes = res.newSignDocBytes;
        const newSignDoc = SignDocDirectAux.decode(newSignDocBytes);

        let signature: Uint8Array;

        // XXX: 참고로 어차피 현재 ledger app이 direct signing을 지원하지 않는다. 그냥 일단 처리해놓은 것.
        if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature");
          }
          signature = res.signature;
        } else {
          const _sig = await this.keyRingService.sign(
            chainId,
            vaultId,
            newSignDocBytes,
            isEthermintLike ? "keccak256" : "sha256"
          );
          signature = new Uint8Array([..._sig.r, ..._sig.s]);
        }

        const msgTypes = TxBody.decode(newSignDoc.bodyBytes).messages.map(
          (msg) => msg.typeUrl
        );

        this.analyticsService.logEventIgnoreError("tx_signed", {
          chainId,
          isInternal: env.isInternalMsg,
          origin,
          signMode: "direct",
          isDirectAux: true,
          msgTypes,
        });

        return {
          signed: {
            ...newSignDoc,
            accountNumber: Long.fromString(newSignDoc.accountNumber),
            sequence: Long.fromString(newSignDoc.sequence),
          },
          signature: encodeSecp256k1Signature(key.pubKey, signature),
        };
      }
    );
  }

  async signDirectAuxSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    signDoc: SignDocDirectAux,
    // preferNoSetMemo 빼고는 다 무시됨
    signOptions: Exclude<
      KeplrSignOptions,
      "preferNoSetFee" | "disableBalanceCheck"
    >
  ): Promise<DirectAuxSignResponse> {
    return await this.signDirectAux(
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
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);

    const key = await this.getKey(vaultId, chainId);
    const bech32Prefix = chainInfo.bech32Config?.bech32PrefixAccAddr ?? "";
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
      Buffer.from(signature.signature, "base64"),
      isEthermintLike ? "ethsecp256k1" : "secp256k1"
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
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

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

    if (isEthermintLike && keyInfo.type === "ledger" && !forceEVMLedger) {
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
        ?.bech32PrefixAccAddr ?? "";
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
        pubKey: key.pubKey,
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
          throw new Error("Frontend should provide signature");
        }

        const msgTypes = newSignDoc.msgs
          .filter((msg) => msg.type)
          .map((msg) => msg.type);

        this.analyticsService.logEventIgnoreError("tx_signed", {
          chainId,
          isInternal: env.isInternalMsg,
          origin,
          ethSignType: "eip-712",
          msgTypes,
        });

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

  async requestICNSAdr36SignaturesSelected(
    env: Env,
    origin: string,
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
    return await this.requestICNSAdr36Signatures(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      contractAddress,
      owner,
      username,
      addressChainIds
    );
  }

  async requestICNSAdr36Signatures(
    env: Env,
    origin: string,
    vaultId: string,
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
    const interactionInfo = {
      chainId,
      owner,
      username,
      origin,
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
      if (chainInfo.hideInUI) {
        throw new Error("Can't sign for hidden chain");
      }

      Bech32Address.validate(
        contractAddress,
        chainInfo.bech32Config?.bech32PrefixAccAddr
      );

      const key = await this.getKey(vaultId, chainId);
      const bech32Address = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config?.bech32PrefixAccAddr ?? ""
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

      const key = await this.getKey(vaultId, chainId);

      const bech32Address = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config?.bech32PrefixAccAddr ?? ""
      );

      interactionInfo.accountInfos.push({
        chainId: chainInfo.chainId,
        bech32Prefix: chainInfo.bech32Config?.bech32PrefixAccAddr ?? "",
        bech32Address: bech32Address,
        pubKey: key.pubKey,
      });
    }

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-cosmos-icns",
      "request-sign-icns-adr36",
      interactionInfo,
      async () => {
        // 현재로써는 ledger에서는 따로 signature를 처리해줄 필요는 없다.
        // 왜냐하면 어차피 ledger의 cosmos app에서는 coin type이 118로 고정되어있어서 모두 같은 주소를 가지기 때문이다.
        // 아직까지 ethereum app 등은 지원하지 않기 때문에 실제로는 ledger에 대한 처리가 없더라도 문제가 되지 않는다.

        const r: {
          chainId: string;
          bech32Prefix: string;
          bech32Address: string;
          addressHash: "cosmos" | "ethereum";
          pubKey: Uint8Array;
          signatureSalt: number;
          signature: Uint8Array;
        }[] = [];

        const ownerBech32 = Bech32Address.fromBech32(owner);
        for (const accountInfo of interactionInfo.accountInfos) {
          const isEthermintLike = KeyRingService.isEthermintLike(
            this.chainsService.getChainInfoOrThrow(accountInfo.chainId)
          );

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

            const signDoc = makeADR36AminoSignDoc(
              accountInfo.bech32Address,
              data
            );

            const _sig = await this.keyRingService.sign(
              accountInfo.chainId,
              vaultId,
              serializeSignDoc(signDoc),
              isEthermintLike ? "keccak256" : "sha256"
            );
            const signature = new Uint8Array([..._sig.r, ..._sig.s]);

            r.push({
              chainId: accountInfo.chainId,
              bech32Prefix: accountInfo.bech32Prefix,
              bech32Address: accountInfo.bech32Address,
              addressHash: isEthermintLike ? "ethereum" : "cosmos",
              pubKey: new PubKeySecp256k1(accountInfo.pubKey).toBytes(
                // Should return uncompressed format if ethereum.
                // Else return as compressed format.
                isEthermintLike
              ),
              signatureSalt: salt,
              signature,
            });
          } else {
            r.push({
              chainId: accountInfo.chainId,
              bech32Prefix: accountInfo.bech32Prefix,
              bech32Address: accountInfo.bech32Address,
              addressHash: isEthermintLike ? "ethereum" : "cosmos",
              pubKey: new PubKeySecp256k1(accountInfo.pubKey).toBytes(
                // Should return uncompressed format if ethereum.
                // Else return as compressed format.
                isEthermintLike
              ),
              signatureSalt: 0,
              signature: new Uint8Array(0),
            });
          }
        }

        return r;
      }
    );
  }

  // secret wasm에서만 사용됨
  async legacySignArbitraryInternal(
    chainId: string,
    memo: string
  ): Promise<Uint8Array> {
    const _sig = await this.keyRingService.sign(
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
    return new Uint8Array([..._sig.r, ..._sig.s]);
  }

  async enableVaultsWithCosmosAddress(
    chainId: string,
    bech32Address: string
  ): Promise<
    {
      vaultId: string;
      newEnabledChains: ReadonlyArray<string>;
    }[]
  > {
    const chainInfo = this.chainsService.getChainInfo(chainId);
    if (!chainInfo) {
      throw new Error("ChainInfo not found");
    }

    if (!bech32Address) {
      throw new Error("Bech32Address is empty");
    }

    Bech32Address.validate(
      bech32Address,
      chainInfo.bech32Config?.bech32PrefixAccAddr
    );

    const changedVaults = new Set<string>();

    const keyInfos = this.keyRingService.getKeyInfos();
    for (const keyInfo of keyInfos) {
      if (
        !this.chainsUIService.isEnabled(keyInfo.id, chainId) &&
        (!this.keyRingService.needKeyCoinTypeFinalize(keyInfo.id, chainId) ||
          (chainInfo.alternativeBIP44s ?? []).length === 0)
      ) {
        let key: Key;
        try {
          key = await this.getKey(keyInfo.id, chainId);
        } catch (e) {
          console.log(e);
          continue;
        }
        if (key.bech32Address === bech32Address) {
          if (
            this.keyRingService.needKeyCoinTypeFinalize(keyInfo.id, chainId)
          ) {
            this.keyRingService.finalizeKeyCoinType(
              keyInfo.id,
              chainId,
              chainInfo.bip44.coinType
            );
          }
          this.chainsUIService.enableChain(keyInfo.id, chainId);

          changedVaults.add(keyInfo.id);
        }
      }
    }

    const res: {
      vaultId: string;
      newEnabledChains: ReadonlyArray<string>;
    }[] = [];

    for (const changedVault of changedVaults) {
      res.push({
        vaultId: changedVault,
        newEnabledChains:
          this.chainsUIService.enabledChainIdentifiersForVault(changedVault),
      });
    }

    return res;
  }

  protected trackError(
    chainInfo: ChainInfo,
    sender: string,
    sequence: string,
    additonalInfo: {
      signMode: string;
      msgTypes: string[];
      isInternal: boolean;
      origin: string;
    }
  ) {
    const accSeq = `${sender}/${sequence}`;

    const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
    txTracer.addEventListener("error", () => {
      try {
        txTracer.close();
      } catch {
        // noop
      }
    });
    txTracer.addEventListener("close", () => {
      try {
        txTracer.close();
      } catch {
        // noop
      }
    });
    setTimeout(() => {
      try {
        txTracer.close();
      } catch {
        // noop
      }
    }, 5 * 60 * 1000);
    txTracer
      .traceTx({
        "tx.acc_seq": accSeq,
      })
      .then((res) => {
        try {
          txTracer.close();
        } catch {
          // noop
        }

        if (!res) {
          return;
        }

        const txs = res.txs
          ? res.txs.map((res: any) => res.tx_result || res)
          : [res.tx_result || res];
        if (txs && Array.isArray(txs)) {
          for (const tx of txs) {
            if ("code" in tx && tx.code && tx.log) {
              this.analyticsService.logEventIgnoreError("tx_error_log", {
                chainId: chainInfo.chainId,
                chainName: chainInfo.chainName,
                code: tx.code,
                log: tx.log,
                accSeq,
                sender,
                sequence,
                ...additonalInfo,
              });
            }
          }
        }
      });
  }

  // XXX: There are other way to handle tx with ethermint on ledger.
  //      However, some chains have probably competitive spirit with evmos.
  //      They make unnecessary and silly minor changes to ethermint spec.
  //      Thus, there is a probability that it will potentially not work on other chains and they blame us.
  //      So, block them explicitly for now.
  public static throwErrorIfEthermintWithLedgerButNotSupported(
    chainId: string
  ) {
    if (
      !chainId.startsWith("evmos_") &&
      !chainId.startsWith("injective") &&
      !chainId.startsWith("dymension_") &&
      !chainId.startsWith("nim_") &&
      !chainId.startsWith("dimension_") &&
      !chainId.startsWith("zetachain_") &&
      !chainId.startsWith("eip155:")
    ) {
      throw new KeplrError(
        "keyring",
        152,
        "Ledger is unsupported for this chain"
      );
    }
  }
}
