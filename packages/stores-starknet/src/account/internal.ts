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
    public readonly keplrChainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    super({ nodeUrl: rpc }, address, "", "1");
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
    const version = details.version;
    if (version !== "0x1" && version !== "0x3") {
      throw new Error(`Invalid version: ${version}`);
    }

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
    const {
      transactions: newTransactions,
      details: newDetails,
      signature,
    } = await keplr.signStarknetTx(this.keplrChainId, calls, signerDetails);

    const calldata = transaction.getExecuteCalldata(
      newTransactions,
      await this.getCairoVersion()
    );

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      newDetails
    );
  }

  public async executeWithFee(
    calls: Call[],
    fee:
      | {
          type: "ETH";
          maxFee: string;
        }
      | {
          type: "STRK";
          gas: string;
          maxGasPrice: string;
        }
  ): Promise<InvokeFunctionResponse> {
    const nonce = await this.getNonce();
    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = (() => {
      switch (fee.type) {
        case "ETH":
          return {
            version: "0x1",
            walletAddress: this.address,
            nonce: nonce,
            chainId: chainId,
            cairoVersion: this.cairoVersion,
            skipValidate: false,

            maxFee: num.toHex(fee.maxFee),
          };
        case "STRK":
          return {
            version: "0x3",
            walletAddress: this.address,
            nonce: nonce,
            chainId: chainId,
            cairoVersion: this.cairoVersion,
            skipValidate: false,

            resourceBounds: {
              l1_gas: {
                max_amount: num.toHex(fee.gas),
                max_price_per_unit: num.toHex(fee.maxGasPrice),
              },
              l2_gas: {
                max_amount: "0x0",
                max_price_per_unit: "0x0",
              },
            },
            tip: "0x0",
            paymasterData: [],
            accountDeploymentData: [],
            nonceDataAvailabilityMode: "L1",
            feeDataAvailabilityMode: "L1",
          };
        default:
          throw new Error("Invalid fee type");
      }
    })();

    const keplr = await this.getKeplr();
    if (!keplr) {
      throw new Error("Keplr is not initialized");
    }
    const {
      transactions: newTransactions,
      details: newDetails,
      signature,
    } = await keplr.signStarknetTx(this.keplrChainId, calls, signerDetails);

    const calldata = transaction.getExecuteCalldata(
      newTransactions,
      await this.getCairoVersion()
    );

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      newDetails
    );
  }
}
