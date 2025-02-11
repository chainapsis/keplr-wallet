import { ChainGetter } from "@keplr-wallet/stores";
import { ERC20Currency, Keplr } from "@keplr-wallet/types";
import { action, makeObservable, observable } from "mobx";
import {
  uint256,
  Call,
  RawArgs,
  DeployContractResponse,
  num,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
} from "starknet";
import { StoreAccount } from "./internal";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";

export class StarknetAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  @observable
  protected _isDeployingAccount: boolean = false;

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

  @action
  setIsDeployingAccount(value: boolean) {
    this._isDeployingAccount = value;
  }

  get isDeployingAccount(): boolean {
    return this._isDeployingAccount;
  }

  async estimateDeployAccount(
    sender: string,
    classHash: string,
    constructorCalldata: RawArgs,
    addressSalt: string,
    feeType: "ETH" | "STRK"
  ) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      this.chainId,
      this.getKeplr
    );

    return await walletAccount.estimateAccountDeployFee(
      {
        classHash,
        constructorCalldata,
        addressSalt,
      },
      {
        version: feeType === "ETH" ? "0x1" : "0x3",
      }
    );
  }

  async deployAccount(
    sender: string,
    classHash: string,
    constructorCalldata: RawArgs,
    addressSalt: string,
    feeType: "ETH" | "STRK",
    {
      onFulfilled,
      onBroadcastFailed,
    }: {
      onFulfilled?: (res: DeployContractResponse) => void;
      onBroadcastFailed?: (e?: Error) => void;
    } = {}
  ) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      this.chainId,
      this.getKeplr
    );

    try {
      const res = await walletAccount.deployAccount(
        {
          classHash,
          constructorCalldata,
          addressSalt,
        },
        {
          version: feeType === "ETH" ? "0x1" : "0x3",
        }
      );

      onFulfilled?.(res);
    } catch (e) {
      onBroadcastFailed?.(e);
    }
  }

  async deployAccountWithFee(
    sender: string,
    classHash: string,
    constructorCalldata: RawArgs,
    addressSalt: string,
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
  ) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      this.chainId,
      this.getKeplr
    );

    try {
      const res = await walletAccount.deployAccountWithFee(
        {
          classHash,
          constructorCalldata,
          addressSalt,
        },
        fee,
        preSigned
      );
      return res;
    } catch (e) {
      throw e;
    }
  }

  async estimateInvokeFee(
    sender: string,
    calls: Call[],
    feeType: "ETH" | "STRK"
  ) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      this.chainId,
      this.getKeplr
    );

    return await walletAccount.estimateInvokeFee(calls, {
      version: feeType === "ETH" ? "0x1" : "0x3",
    });
  }

  async estimateInvokeFeeForSendTokenTx(
    {
      currency,
      amount,
      sender,
      recipient,
    }: {
      currency: ERC20Currency;
      amount: string;
      sender: string;
      recipient: string;
    },
    feeType: "ETH" | "STRK"
  ) {
    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(
        DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
      );
      return dec.truncate().toString();
    })();

    const u256 = uint256.bnToUint256(actualAmount);

    const calls: Call[] = [
      {
        contractAddress: currency.contractAddress,
        // If the recipient address is empty, the sender address will be used as the recipient for estimating fee.
        calldata: [recipient === "" ? sender : recipient, u256],
        entrypoint: "transfer",
      },
    ];

    return await this.estimateInvokeFee(sender, calls, feeType);
  }

  async execute(
    sender: string,
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
  ) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      this.chainId,
      this.getKeplr
    );

    return await walletAccount.executeWithFee(calls, fee, signTx);
  }

  async executeForSendTokenTx(
    sender: string,
    amount: string,
    currency: ERC20Currency,
    recipient: string,
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
  ) {
    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(
        DecUtils.getTenExponentNInPrecisionRange(currency.coinDecimals)
      );
      return dec.truncate().toString();
    })();

    const u256 = uint256.bnToUint256(actualAmount);
    const calls: Call[] = [
      {
        contractAddress: currency.contractAddress,
        calldata: [recipient, u256],
        entrypoint: "transfer",
      },
    ];

    return await this.execute(sender, calls, fee);
  }

  async getNonce(sender: string): Promise<Int> {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      this.chainId,
      this.getKeplr
    );

    return new Int(num.toBigInt(await walletAccount.getNonce()));
  }
}
