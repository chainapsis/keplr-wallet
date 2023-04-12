import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring-v2";
import {
  AminoSignResponse,
  ChainInfo,
  KeplrSignOptions,
  Key,
  StdSignature,
  StdSignDoc,
} from "@keplr-wallet/types";
import { APP_PORT, Env } from "@keplr-wallet/router";
import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
  encodeSecp256k1Signature,
  makeADR36AminoSignDoc,
  serializeSignDoc,
  verifyADR36AminoSignDoc,
} from "@keplr-wallet/cosmos";
import { escapeHTML, sortObjectByKey } from "@keplr-wallet/common";
import { trimAminoSignDoc } from "../keyring/amino-sign-doc";
import { InteractionService } from "../interaction";
import { Buffer } from "buffer/";

export class KeyRingCosmosService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService
  ) {}

  async init() {
    // TODO: ?
  }

  async getKeySelected(env: Env, chainId: string): Promise<Key> {
    return await this.getKey(env, this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(env: Env, vaultId: string, chainId: string): Promise<Key> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const pubKey = await this.keyRingService.getPubKey(env, chainId, vaultId);

    const isEthermintLike = this.isEthermintLike(chainInfo);
    const address = (() => {
      if (isEthermintLike) {
        return pubKey.getEthAddress();
      }

      return pubKey.getCosmosAddress();
    })();

    const bech32Address = new Bech32Address(address);

    return {
      name: this.keyRingService.getKeyRingNameSelected(),
      algo: isEthermintLike ? "ethsecp256k1" : "secp256k1",
      // TODO: Not sure we should return uncompressed pub key if ethermint.
      pubKey: pubKey.toBytes(),
      address,
      bech32Address: bech32Address.toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      ),
      // TODO
      isNanoLedger: false,
      isKeystone: false,
    };
  }

  async computeNotFinalizedMnemonicKeyAddresses(
    env: Env,
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
          env,
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
    // TODO: Handle ethermint
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const isEthermintLike = this.isEthermintLike(chainInfo);

    signDoc = {
      ...signDoc,
      memo: escapeHTML(signDoc.memo),
    };

    signDoc = trimAminoSignDoc(signDoc);
    signDoc = sortObjectByKey(signDoc);

    const key = await this.getKey(env, vaultId, chainId);
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

    let newSignDoc = (await this.interactionService.waitApprove(
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
      }
    )) as StdSignDoc;

    newSignDoc = {
      ...newSignDoc,
      memo: escapeHTML(newSignDoc.memo),
    };

    try {
      const signature = await this.keyRingService.sign(
        env,
        chainId,
        vaultId,
        serializeSignDoc(newSignDoc),
        isEthermintLike ? "keccak256" : "sha256"
      );

      return {
        signed: newSignDoc,
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
    // TODO: Handle ethermint
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const isEthermintLike = this.isEthermintLike(chainInfo);

    const key = await this.getKey(env, vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const signDoc = makeADR36AminoSignDoc(signer, data);
    const newSignDoc = (await this.interactionService.waitApprove(
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
      }
    )) as StdSignDoc;

    if (!checkAndValidateADR36AminoSignDoc(newSignDoc)) {
      throw new Error("Invalid ADR36 sign doc delivered from view");
    }

    try {
      const signature = await this.keyRingService.sign(
        env,
        chainId,
        vaultId,
        serializeSignDoc(newSignDoc),
        isEthermintLike ? "keccak256" : "sha256"
      );

      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }

  async verifyAminoADR36Selected(
    env: Env,
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    return await this.verifyAminoADR36(
      env,
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      data,
      signature
    );
  }

  async verifyAminoADR36(
    env: Env,
    vaultId: string,
    chainId: string,
    signer: string,
    data: Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    const key = await this.getKey(env, vaultId, chainId);
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

  protected isEthermintLike(chainInfo: ChainInfo): boolean {
    return (
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign")
    );
  }
}
