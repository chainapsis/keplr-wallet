import {
  Abi,
  Account,
  AllowArray,
  Call,
  InvokeFunctionResponse,
  TransactionType,
  UniversalDetails,
  num,
  stark,
  InvocationsSignerDetails,
  transaction,
} from "starknet";
import { Keplr } from "@keplr-wallet/types";

export class StoreAccount extends Account {
  constructor(
    public readonly rpc: string,
    public override readonly address: string,
    transactionVersion: "0x2" | "0x3",
    public readonly keplrChainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    super({ nodeUrl: rpc }, address, "", "1", transactionVersion);
  }

  public override async execute(
    transactions: AllowArray<Call>,
    transactionsDetail?: UniversalDetails
  ): Promise<InvokeFunctionResponse>;
  public override async execute(
    transactions: AllowArray<Call>,
    abis?: Abi[],
    transactionsDetail?: UniversalDetails
  ): Promise<InvokeFunctionResponse>;
  public override async execute(
    transactions: AllowArray<Call>,
    arg2?: Abi[] | UniversalDetails,
    transactionsDetail: UniversalDetails = {}
  ): Promise<InvokeFunctionResponse> {
    const details =
      arg2 === undefined || Array.isArray(arg2) ? transactionsDetail : arg2;
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    const nonce = num.toBigInt(details.nonce ?? (await this.getNonce()));
    const version = stark.toTransactionVersion(
      this.getPreferredVersion("0x1", "0x3"), // TODO: does this depend on cairo version ?
      details.version
    );

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.INVOKE, payload: transactions },
      {
        ...details,
        version,
      }
    );

    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = {
      ...stark.v3Details(details),
      resourceBounds: estimate.resourceBounds,
      walletAddress: this.address,
      nonce,
      maxFee: estimate.maxFee,
      version,
      chainId,
      cairoVersion: await this.getCairoVersion(),
    };

    const keplr = await this.getKeplr();
    if (!keplr) {
      throw new Error("Keplr is not initialized");
    }
    const signature = await keplr.signStarknetTx(
      this.keplrChainId,
      calls,
      signerDetails
    );

    const calldata = transaction.getExecuteCalldata(
      calls,
      await this.getCairoVersion()
    );

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      {
        ...stark.v3Details(details),
        resourceBounds: estimate.resourceBounds,
        nonce,
        maxFee: estimate.maxFee,
        version,
      }
    );
  }
}
