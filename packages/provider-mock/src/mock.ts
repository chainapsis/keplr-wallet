import {
  EthSignType,
  Keplr,
  KeplrIntereactionOptions,
  KeplrMode,
  KeplrSignOptions,
  Key,
  AminoSignResponse,
  BroadcastMode,
  StdSignature,
  StdSignDoc,
  OfflineAminoSigner,
  OfflineDirectSigner,
  DirectSignResponse,
} from "@keplr-wallet/types";
import { SecretUtils } from "secretjs/types/enigmautils";
import {
  Bech32Address,
  encodeSecp256k1Signature,
  serializeSignDoc,
} from "@keplr-wallet/cosmos";
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
} from "@keplr-wallet/provider";
import { Mnemonic, PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import Long from "long";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";

export class MockKeplr implements Keplr {
  readonly version: string = "0.0.1";
  readonly mode: KeplrMode = "extension";

  public defaultOptions: KeplrIntereactionOptions = {};

  public readonly walletMap: {
    [chainId: string]: PrivKeySecp256k1 | undefined;
  } = {};

  getWallet(chainId: string): PrivKeySecp256k1 {
    if (!this.walletMap[chainId]) {
      const chainInfo = this.chainInfos.find(
        (info) => info.chainId === chainId
      );

      if (!chainInfo) {
        throw new Error("Unknown chain");
      }

      this.walletMap[chainId] = new PrivKeySecp256k1(
        Mnemonic.generateWalletFromMnemonic(this.mnemonic)
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.walletMap[chainId]!;
  }

  constructor(
    public readonly sendTxFn: (
      chainId: string,
      stdTx: Uint8Array,
      mode: BroadcastMode
    ) => Promise<Uint8Array>,
    public readonly chainInfos: {
      readonly chainId: string;
      readonly bech32Config: {
        readonly bech32PrefixAccAddr: string;
      };
    }[],
    public readonly mnemonic: string
  ) {}

  enable(): Promise<void> {
    // noop.
    return Promise.resolve(undefined);
  }

  enigmaDecrypt(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  enigmaEncrypt(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  experimentalSuggestChain(): Promise<void> {
    throw new Error("Not implemented");
  }

  getEnigmaPubKey(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  getEnigmaUtils(): SecretUtils {
    throw new Error("Not implemented");
  }

  async getKey(chainId: string): Promise<Key> {
    const wallet = this.getWallet(chainId);

    return {
      name: "mock",
      algo: "secp256k1",
      pubKey: wallet.getPubKey().toBytes(),
      address: wallet.getPubKey().getAddress(),
      bech32Address: new Bech32Address(
        wallet.getPubKey().getAddress()
      ).toBech32(
        this.chainInfos.find((c) => c.chainId === chainId)!.bech32Config
          .bech32PrefixAccAddr
      ),
      isNanoLedger: false,
    };
  }

  signArbitrary(
    _chainId: string,
    _signer: string,
    _data: string | Uint8Array
  ): Promise<StdSignature> {
    throw new Error("Not implemented");
  }

  verifyArbitrary(
    _chainId: string,
    _signer: string,
    _data: string | Uint8Array,
    _signature: StdSignature
  ): Promise<boolean> {
    throw new Error("Not implemented");
  }

  signEthereum(
    _chainId: string,
    _signer: string,
    _data: string | Uint8Array,
    _type: EthSignType
  ): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  getOfflineSigner(chainId: string): OfflineAminoSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getSecret20ViewingKey(): Promise<string> {
    throw new Error("Not implemented");
  }

  sendTx(
    chainId: string,
    stdTx: Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    return this.sendTxFn(chainId, stdTx, mode);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    _?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    const wallet = await this.getWallet(chainId);

    const key = await this.getKey(chainId);
    if (signer !== key.bech32Address) {
      throw new Error("Unmatched signer");
    }

    const signature = wallet.sign(serializeSignDoc(signDoc));

    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(
        wallet.getPubKey().toBytes(),
        signature
      ),
    };
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      /** SignDoc bodyBytes */
      bodyBytes?: Uint8Array | null;

      /** SignDoc authInfoBytes */
      authInfoBytes?: Uint8Array | null;

      /** SignDoc chainId */
      chainId?: string | null;

      /** SignDoc accountNumber */
      accountNumber?: Long | null;
    },
    _?: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    const wallet = await this.getWallet(chainId);

    const key = await this.getKey(chainId);
    if (signer !== key.bech32Address) {
      throw new Error("Unmatched signer");
    }

    const signature = wallet.sign(
      SignDoc.encode(
        SignDoc.fromPartial({
          bodyBytes: signDoc.bodyBytes!,
          authInfoBytes: signDoc.authInfoBytes!,
          chainId: signDoc.chainId!,
          accountNumber: signDoc.accountNumber!.toString(),
        })
      ).finish()
    );

    return {
      signed: {
        bodyBytes: signDoc.bodyBytes!,
        authInfoBytes: signDoc.authInfoBytes!,
        chainId: signDoc.chainId!,
        accountNumber: signDoc.accountNumber!,
      },
      signature: encodeSecp256k1Signature(
        wallet.getPubKey().toBytes(),
        signature
      ),
    };
  }

  suggestToken(): Promise<void> {
    throw new Error("Not implemented");
  }

  getEnigmaTxEncryptionKey(
    _chainId: string,
    _nonce: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  getOfflineSignerAuto(
    _chainId: string
  ): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    throw new Error("Not implemented");
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineAminoSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this);
  }

  experimentalSignEIP712CosmosTx_v0(
    _chainId: string,
    _signer: string,
    _eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    _signDoc: StdSignDoc,
    _signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    throw new Error("Not yet implemented");
  }
}
