import {
  Keplr,
  OfflineDirectSigner,
  OfflineAminoSigner,
  AccountData,
  AminoSignResponse,
  StdSignDoc,
  DirectSignResponse,
  SignDoc,
  KeplrSignOptions,
} from "@keplr-wallet/types";

export class CosmJSOfflineSignerOnlyAmino implements OfflineAminoSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly keplr: Keplr,
    protected readonly signOptions?: KeplrSignOptions
  ) {}

  async getAccounts(): Promise<AccountData[]> {
    const key = await this.keplr.getKey(this.chainId);

    return [
      {
        address: key.bech32Address,
        // Currently, only secp256k1 is supported.
        algo: "secp256k1",
        pubkey: key.pubKey,
      },
    ];
  }

  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    if (this.chainId !== signDoc.chain_id) {
      throw new Error("Unmatched chain id with the offline signer");
    }

    const key = await this.keplr.getKey(signDoc.chain_id);

    if (key.bech32Address !== signerAddress) {
      throw new Error("Unknown signer address");
    }

    return await this.keplr.signAmino(
      this.chainId,
      signerAddress,
      signDoc,
      this.signOptions
    );
  }

  // Fallback function for the legacy cosmjs implementation before the stargate.
  async sign(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.signAmino(signerAddress, signDoc);
  }
}

export class CosmJSOfflineSigner
  extends CosmJSOfflineSignerOnlyAmino
  implements OfflineAminoSigner, OfflineDirectSigner
{
  constructor(chainId: string, keplr: Keplr, signOptions?: KeplrSignOptions) {
    super(chainId, keplr, signOptions);
  }

  async signDirect(
    signerAddress: string,
    signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    if (this.chainId !== signDoc.chainId) {
      throw new Error("Unmatched chain id with the offline signer");
    }

    const key = await this.keplr.getKey(signDoc.chainId);

    if (key.bech32Address !== signerAddress) {
      throw new Error("Unknown signer address");
    }

    return await this.keplr.signDirect(
      this.chainId,
      signerAddress,
      signDoc,
      this.signOptions
    );
  }
}
