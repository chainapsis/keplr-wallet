import { ChainGetter } from "@keplr-wallet/stores";
import {
  AppCurrency,
  ERC20Currency,
  EVMGasSimulateKind,
  EthSignType,
  EthTxReceipt,
  JsonRpcResponse,
  Keplr,
} from "@keplr-wallet/types";
import { DenomHelper, retry } from "@keplr-wallet/common";
import { erc20ContractInterface } from "../constants";
import { hexValue } from "@ethersproject/bytes";
import { parseUnits } from "@ethersproject/units";
import {
  TransactionTypes,
  UnsignedTransaction,
  serialize,
} from "@ethersproject/transactions";
import { getAddress as getEthAddress } from "@ethersproject/address";
import { action, makeObservable, observable } from "mobx";
import { Interface } from "@ethersproject/abi";
import {
  AccountStateDiffTracerResult,
  SimulateGasWithPendingErc20ApprovalResult,
  StateOverride,
  UnsignedEVMTransactionWithErc20Approvals,
} from "../types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

const opStackGasPriceOracleProxyAddress =
  "0x420000000000000000000000000000000000000F";

const opStackGasPriceOracleABI = new Interface([
  {
    inputs: [{ internalType: "bytes", name: "_data", type: "bytes" }],
    name: "getL1Fee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]);

async function traceCallWithDiff(
  rpcUrl: string,
  tx: { from: string; to: string; data: string; value?: string },
  blockTag: string = "latest"
): Promise<AccountStateDiffTracerResult> {
  const response = await simpleFetch<
    JsonRpcResponse<AccountStateDiffTracerResult>
  >(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "debug_traceCall",
      params: [
        tx,
        blockTag,
        {
          tracer: "prestateTracer",
          tracerConfig: {
            diffMode: true,
          },
        },
      ],
      id: 1,
    }),
  });

  const data = response.data;

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.result) {
    throw new Error("Unknown error");
  }

  return data.result;
}

function diffResultToStateOverride(
  diffResult: AccountStateDiffTracerResult,
  allowedAddresses: string[],
  useStateDiff: boolean = false
): StateOverride {
  const override: StateOverride = {};

  const allowed = new Set(allowedAddresses.map((addr) => addr.toLowerCase()));

  for (const [address, state] of Object.entries(diffResult.post)) {
    if (!allowed.has(address.toLowerCase())) {
      continue;
    }

    if (state.storage && Object.keys(state.storage).length > 0) {
      if (useStateDiff) {
        // 개별 슬롯만 패치 (stateDiff)
        override[address] = {
          stateDiff: state.storage,
        };
      } else {
        // 전체 스토리지 override (state)
        // 시스템 컨트랙트의 전체 상태를 덮어쓰려고 하면 오류가 발생할 수 있다.
        // 가능한 이 기능을 사용하지 않도록 하자.
        override[address] = {
          state: state.storage,
        };
      }
    }
  }

  return override;
}

export class EthereumAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    makeObservable(this);
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }

  async simulateGas(
    sender: string,
    unsignedTx: UnsignedTransaction,
    stateOverride?: StateOverride
  ) {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    const { to, value, data } = unsignedTx;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;

    const params: unknown[] = [
      {
        from: sender,
        to,
        value,
        data,
      },
    ];

    if (stateOverride) {
      params.push("latest", stateOverride);
    }

    const gasEstimated = await keplr.ethereum.request<string | undefined>({
      method: "eth_estimateGas",
      params,
      chainId: this.chainId,
    });

    if (!gasEstimated) {
      throw new Error("Failed to estimate gas");
    }

    return {
      gasUsed: parseInt(gasEstimated),
    };
  }

  async simulateGasForSendTokenTx({
    currency,
    amount,
    sender,
    recipient,
  }: {
    currency: AppCurrency;
    amount: string;
    sender: string;
    recipient: string;
  }) {
    // If the recipient address is invalid, the sender address will be used as the recipient for gas estimating gas.
    const tempRecipient = EthereumAccountBase.isEthereumHexAddressWithChecksum(
      recipient
    )
      ? recipient
      : sender;

    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    const unsignedTx: UnsignedTransaction = (() => {
      switch (denomHelper.type) {
        case "erc20":
          return {
            to: denomHelper.contractAddress,
            value: "0x0",
            data: erc20ContractInterface.encodeFunctionData("transfer", [
              tempRecipient,
              hexValue(parsedAmount),
            ]),
          };
        default:
          return {
            to: tempRecipient,
            value: hexValue(parsedAmount),
          };
      }
    })();

    return this.simulateGas(sender, unsignedTx);
  }

  async simulateGasWithPendingErc20Approval(
    sender: string,
    unsignedTx: UnsignedEVMTransactionWithErc20Approvals
  ): Promise<SimulateGasWithPendingErc20ApprovalResult> {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    const { to, value, data, requiredErc20Approvals } = unsignedTx;

    const erc20ApprovalTxs = requiredErc20Approvals?.map((approval) => {
      return {
        to: approval.tokenAddress,
        value: "0x0",
        data: erc20ContractInterface.encodeFunctionData("approve", [
          approval.spender,
          hexValue(BigInt(approval.amount)),
        ]),
      };
    });

    if (!erc20ApprovalTxs || erc20ApprovalTxs?.length === 0) {
      const result = await this.simulateGas(sender, unsignedTx);
      return {
        kind: EVMGasSimulateKind.TX_SIMULATED,
        gasUsed: result.gasUsed,
      };
    }

    if (erc20ApprovalTxs.length > 1) {
      throw new Error("Multiple ERC20 approvals are not supported");
    }

    const erc20Approval = requiredErc20Approvals?.[0];
    if (!erc20Approval) {
      throw new Error("Invalid ERC20 approval");
    }

    const erc20ApprovalTx = erc20ApprovalTxs[0];

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const keplr = (await this.getKeplr())!;

      const erc20ApprovalGasEstimated = await keplr.ethereum.request<
        string | undefined
      >({
        method: "eth_estimateGas",
        params: [
          {
            from: sender,
            to: erc20ApprovalTx.to,
            value: erc20ApprovalTx.value,
            data: erc20ApprovalTx.data,
          },
        ],
        chainId: this.chainId,
      });

      if (!erc20ApprovalGasEstimated) {
        throw new Error("Failed to estimate gas for ERC20 approval");
      }

      // State diff tracing for the ERC20 approval transaction
      const approvalStateDiff = await traceCallWithDiff(chainInfo.rpc, {
        from: sender,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: erc20ApprovalTx.to!,
        value: erc20ApprovalTx.value,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        data: erc20ApprovalTx.data!,
      });

      // estimate gas with state override with approval state diff
      const result = await this.simulateGas(
        sender,
        {
          to,
          value,
          data,
        },
        diffResultToStateOverride(
          approvalStateDiff,
          [
            sender,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            erc20ApprovalTx.to!,
            erc20Approval.spender,
          ],
          true
        )
      );

      return {
        kind: EVMGasSimulateKind.TX_BUNDLE_SIMULATED,
        gasUsed: result.gasUsed,
        erc20ApprovalGasUsed: parseInt(erc20ApprovalGasEstimated),
      };
    } catch (e) {
      console.error("Failed to simulate gas with pending ERC20 approval", e);

      // fallback to simulate only the erc20 approval tx
      const result = await this.simulateGas(sender, erc20ApprovalTx);
      return {
        kind: EVMGasSimulateKind.APPROVAL_ONLY_SIMULATED,
        erc20ApprovalGasUsed: result.gasUsed,
      };
    }
  }

  async simulateOpStackL1Fee(unsignedTx: UnsignedTransaction): Promise<string> {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!chainInfo.features.includes("op-stack-l1-data-fee")) {
      throw new Error("The chain isn't built with OP Stack");
    }

    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;

    const l1Fee = await keplr.ethereum.request<string>({
      method: "eth_call",
      params: [
        {
          to: opStackGasPriceOracleProxyAddress,
          data: opStackGasPriceOracleABI.encodeFunctionData("getL1Fee", [
            serialize(unsignedTx),
          ]),
        },
        "latest",
      ],
      chainId: this.chainId,
    });

    return l1Fee;
  }

  makeSendTokenTx({
    currency,
    amount,
    to,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
  }: {
    currency: AppCurrency;
    amount: string;
    to: string;
    gasLimit: number;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasPrice?: string;
  }): UnsignedTransaction {
    const parsedAmount = parseUnits(amount, currency.coinDecimals);
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    const feeObject =
      maxFeePerGas && maxPriorityFeePerGas
        ? {
            maxFeePerGas: hexValue(Number(maxFeePerGas)),
            maxPriorityFeePerGas: hexValue(Number(maxPriorityFeePerGas)),
            gasLimit: hexValue(gasLimit),
          }
        : {
            gasPrice: hexValue(Number(gasPrice ?? "0")),
            gasLimit: hexValue(gasLimit),
          };

    // Support EIP-1559 transaction only.
    const unsignedTx: UnsignedTransaction = (() => {
      switch (denomHelper.type) {
        case "erc20":
          return {
            ...this.makeTx(
              denomHelper.contractAddress,
              "0x0",
              erc20ContractInterface.encodeFunctionData("transfer", [
                to,
                hexValue(parsedAmount),
              ])
            ),
            ...feeObject,
          };
        default:
          return {
            ...this.makeTx(to, hexValue(parsedAmount)),
            ...feeObject,
          };
      }
    })();

    return unsignedTx;
  }

  makeErc20ApprovalTx(
    currency: ERC20Currency,
    spender: string,
    amount: string
  ): UnsignedTransaction {
    const parsedAmount = parseUnits(amount, currency.coinDecimals);

    return this.makeTx(
      currency.contractAddress,
      "0x0",
      erc20ContractInterface.encodeFunctionData("approve", [
        spender,
        hexValue(parsedAmount),
      ])
    );
  }

  makeTx(to: string, value: string, data?: string): UnsignedTransaction {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM chain info provided");
    }

    return {
      chainId: evmInfo.chainId,
      to,
      value,
      data,
    };
  }

  /**
   * Sign an Ethereum transaction.
   * @param sender - The sender address.
   * @param unsignedTx - The unsigned transaction to sign.
   * @param options - The options for the transaction.
   * @returns The signed transaction in serialized format.
   */
  async signEthereumTx(
    sender: string,
    unsignedTx: UnsignedEVMTransactionWithErc20Approvals,
    options?: {
      nonceMethod?: "pending" | "latest";
    }
  ) {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      throw new Error("No EVM info provided");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;

    const transactionCount = await keplr.ethereum.request<string>({
      method: "eth_getTransactionCount",
      params: [sender, options?.nonceMethod || "pending"],
      chainId: this.chainId,
    });

    unsignedTx = {
      ...unsignedTx,
      nonce:
        parseInt(transactionCount) +
        (unsignedTx.requiredErc20Approvals?.length ?? 0),
    };

    const signEthereum = keplr.signEthereum.bind(keplr);

    const signature = await signEthereum(
      this.chainId,
      sender,
      JSON.stringify(unsignedTx),
      EthSignType.TRANSACTION
    );

    const isEIP1559 =
      !!unsignedTx.maxFeePerGas || !!unsignedTx.maxPriorityFeePerGas;
    if (isEIP1559) {
      unsignedTx.type = TransactionTypes.eip1559;
    }

    return serialize(unsignedTx, signature);
  }

  async sendEthereumTx(
    sender: string,
    unsignedTx: UnsignedTransaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: EthTxReceipt) => void;
    },
    options?: {
      sendTx?: (chainId: string, signedTx: Buffer) => Promise<string>;
      nonceMethod?: "pending" | "latest";
    }
  ) {
    try {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      const evmInfo = chainInfo.evm;
      if (!evmInfo) {
        throw new Error("No EVM info provided");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const keplr = (await this.getKeplr())!;

      const transactionCount = await keplr.ethereum.request<string>({
        method: "eth_getTransactionCount",
        params: [sender, options?.nonceMethod || "pending"],
        chainId: this.chainId,
      });
      unsignedTx = {
        ...unsignedTx,
        nonce: parseInt(transactionCount),
      };

      const signEthereum = keplr.signEthereum.bind(keplr);

      const signature = await signEthereum(
        this.chainId,
        sender,
        JSON.stringify(unsignedTx),
        EthSignType.TRANSACTION
      );

      const isEIP1559 =
        !!unsignedTx.maxFeePerGas || !!unsignedTx.maxPriorityFeePerGas;
      if (isEIP1559) {
        unsignedTx.type = TransactionTypes.eip1559;
      }

      const signedTx = Buffer.from(
        serialize(unsignedTx, signature).replace("0x", ""),
        "hex"
      );

      const sendEthereumTx = keplr.sendEthereumTx.bind(keplr);
      const txHash = options?.sendTx
        ? await options.sendTx(this.chainId, signedTx)
        : await sendEthereumTx(this.chainId, signedTx);

      if (!txHash) {
        throw new Error("No tx hash responded");
      }

      if (onTxEvents?.onBroadcasted) {
        onTxEvents.onBroadcasted(txHash);
      }

      retry(
        () => {
          return new Promise<void>(async (resolve, reject) => {
            const txReceipt = await keplr.ethereum.request<EthTxReceipt>({
              method: "eth_getTransactionReceipt",
              params: [txHash],
              chainId: this.chainId,
            });
            if (txReceipt) {
              onTxEvents?.onFulfill?.(txReceipt);
              resolve();
            }

            reject();
          });
        },
        {
          maxRetries: 10,
          waitMsAfterError: 500,
          maxWaitMsAfterError: 4000,
        }
      );

      return txHash;
    } catch (e) {
      if (onTxEvents?.onBroadcastFailed) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }
  }

  static isEthereumHexAddressWithChecksum(hexAddress: string): boolean {
    const isHexAddress = !!hexAddress.match(/^0x[0-9A-Fa-f]*$/);
    const isChecksumAddress = !!hexAddress.match(
      /([A-F].*[a-f])|([a-f].*[A-F])/
    );
    if (!isHexAddress || hexAddress.length !== 42) {
      return false;
    }

    const checksumHexAddress = getEthAddress(hexAddress.toLowerCase());
    if (isChecksumAddress && checksumHexAddress !== hexAddress) {
      return false;
    }

    return true;
  }
}
