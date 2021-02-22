import {
  OfflineSigner,
  AccountData,
  SignResponse,
  StdSignDoc,
} from "@cosmjs/launchpad";
import { fromHex } from "@cosmjs/encoding";
import { Keplr } from "@keplr/types";

export class CosmJSOfflineSigner implements OfflineSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly keplr: Keplr
  ) {}

  async getAccounts(): Promise<AccountData[]> {
    const key = await this.keplr.getKey(this.chainId);

    return [
      {
        address: key.bech32Address,
        // Currently, only secp256k1 is supported.
        algo: "secp256k1",
        pubkey: fromHex(key.pubKeyHex),
      },
    ];
  }

  async sign(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<SignResponse> {
    if (this.chainId !== signDoc.chain_id) {
      throw new Error("Unmatched chain id with the offline signer");
    }

    const key = await this.keplr.getKey(signDoc.chain_id);

    if (key.bech32Address !== signerAddress) {
      throw new Error("Unknown signer address");
    }

    return await this.keplr.sign(this.chainId, signerAddress, signDoc);
  }
}
