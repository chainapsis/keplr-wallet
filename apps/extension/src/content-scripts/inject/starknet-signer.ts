import {
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  SignerInterface,
  TypedData,
} from "starknet";
import { Keplr } from "@keplr-wallet/types";

export class SignerInterfaceImpl extends SignerInterface {
  constructor(protected readonly keplr: Keplr) {
    super();
  }

  async getPubKey(): Promise<string> {
    if (!this.keplr.starknet.chainId) {
      throw new Error("Chain id is not set");
    }

    return (
      "0x" +
      Buffer.from(
        (await this.keplr.getStarknetKey(this.keplr.starknet.chainId)).pubKey
      ).toString("hex")
    );
  }

  async signDeclareTransaction(
    _transaction: DeclareSignerDetails
  ): Promise<Signature> {
    throw new Error("Method not implemented.");
  }

  async signDeployAccountTransaction(
    _transaction: DeployAccountSignerDetails
  ): Promise<Signature> {
    throw new Error("Method not implemented.");
  }

  async signMessage(
    typedData: TypedData,
    accountAddress: string
  ): Promise<Signature> {
    throw new Error("Method not implemented.");
  }

  async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails
  ): Promise<Signature> {
    if (!this.keplr.starknet.chainId) {
      throw new Error("Chain id is not set");
    }

    return await this.keplr.signStarknetTx(
      this.keplr.starknet.chainId,
      transactions,
      transactionsDetail
    );
  }
}
