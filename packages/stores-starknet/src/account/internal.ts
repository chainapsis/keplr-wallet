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
  DeployAccountContractPayload,
  DeployContractResponse,
  CallData,
  hash as starknetHash,
  DeployAccountSignerDetails,
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

  public override async deployAccount(
    {
      classHash,
      constructorCalldata = [],
      addressSalt = 0,
      contractAddress: providedContractAddress,
    }: DeployAccountContractPayload,
    details: UniversalDetails = {}
  ): Promise<DeployContractResponse> {
    const version = details.version;
    if (version !== "0x1" && version !== "0x3") {
      throw new Error(`Invalid version: ${version}`);
    }
    const nonce = 0; // DEPLOY_ACCOUNT transaction will have a nonce zero as it is the first transaction in the account
    const chainId = await this.getChainId();

    const compiledCalldata = CallData.compile(constructorCalldata);
    const contractAddress =
      providedContractAddress ??
      starknetHash.calculateContractAddressFromHash(
        addressSalt,
        classHash,
        compiledCalldata,
        0
      );

    const estimate = await this.getUniversalSuggestedFee(
      version,
      {
        type: TransactionType.DEPLOY_ACCOUNT,
        payload: {
          classHash,
          constructorCalldata: compiledCalldata,
          addressSalt,
          contractAddress,
        },
      },
      details
    );

    const keplr = await this.getKeplr();
    if (!keplr) {
      throw new Error("Keplr is not initialized");
    }
    const { transaction: newTransaction, signature } =
      await keplr.signStarknetDeployAccountTransaction(this.keplrChainId, {
        ...stark.v3Details(details),
        classHash,
        constructorCalldata: compiledCalldata,
        contractAddress,
        addressSalt,
        chainId,
        resourceBounds: estimate.resourceBounds,
        maxFee: estimate.maxFee,
        version,
        nonce,
      });

    return this.deployAccountContract(
      { classHash, addressSalt, constructorCalldata, signature },
      {
        ...stark.v3Details(newTransaction),
        ...newTransaction,
      }
    );
  }

  public async deployAccountWithFee(
    {
      classHash,
      constructorCalldata = [],
      addressSalt = 0,
      contractAddress: providedContractAddress,
    }: DeployAccountContractPayload,
    fee:
      | {
          type: "ETH";
          maxFee: string;
        }
      | {
          type: "STRK";
          gas: string;
          maxGasPrice: string;
        },
    preSigned?: {
      transaction: DeployAccountSignerDetails;
      signature: string[];
    }
  ): Promise<DeployContractResponse> {
    if (preSigned) {
      const {
        transaction: { classHash, addressSalt, constructorCalldata },
        signature,
      } = preSigned;
      return this.deployAccountContract(
        {
          classHash,
          addressSalt,
          constructorCalldata,
          signature,
        },
        preSigned.transaction
      );
    }

    const nonce = 0; // DEPLOY_ACCOUNT transaction will have a nonce zero as it is the first transaction in the account
    const chainId = await this.getChainId();

    const compiledCalldata = CallData.compile(constructorCalldata);
    const contractAddress =
      providedContractAddress ??
      starknetHash.calculateContractAddressFromHash(
        addressSalt,
        classHash,
        compiledCalldata,
        0
      );

    const signerDetails: DeployAccountSignerDetails = (() => {
      switch (fee.type) {
        case "ETH":
          return {
            classHash,
            constructorCalldata: compiledCalldata,
            contractAddress,
            addressSalt,

            version: "0x1",
            nonce: nonce,
            chainId: chainId,

            maxFee: num.toHex(fee.maxFee),
            resourceBounds: {
              l1_gas: {
                max_amount: "0x0",
                max_price_per_unit: "0x0",
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
        case "STRK":
          return {
            classHash,
            constructorCalldata: compiledCalldata,
            contractAddress,
            addressSalt,

            version: "0x3",
            nonce: nonce,
            chainId: chainId,

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
    const { transaction: newTransaction, signature } =
      await keplr.signStarknetDeployAccountTransaction(
        this.keplrChainId,
        signerDetails
      );

    return this.deployAccountContract(
      { classHash, addressSalt, constructorCalldata, signature },
      {
        ...stark.v3Details(newTransaction),
        ...newTransaction,
      }
    );
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
        },
    signTx?: (
      chainId: string,
      calls: Call[],
      details: InvocationsSignerDetails
    ) => Promise<{
      transactions: Call[];
      details: InvocationsSignerDetails;
      signature: string[];
    }>
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

    let transactions: Call[];
    let details: InvocationsSignerDetails;
    let signature: string[];

    if (signTx) {
      const result = await signTx(this.keplrChainId, calls, signerDetails);
      transactions = result.transactions;
      details = result.details;
      signature = result.signature;
    } else {
      const keplr = await this.getKeplr();
      if (!keplr) {
        throw new Error("Keplr is not initialized");
      }
      const result = await keplr.signStarknetTx(
        this.keplrChainId,
        calls,
        signerDetails
      );
      transactions = result.transactions;
      details = result.details;
      signature = result.signature;
    }

    const calldata = transaction.getExecuteCalldata(
      transactions,
      await this.getCairoVersion()
    );

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      details
    );
  }
}
