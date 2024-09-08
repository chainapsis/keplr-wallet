import { ChainGetter } from "@keplr-wallet/stores";
import { ERC20Currency, Keplr } from "@keplr-wallet/types";
import { action, makeObservable, observable } from "mobx";
import { uint256, Call } from "starknet";
import { StoreAccount } from "./internal";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";

export class StarknetAccountBase {
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

  async estimateInvokeFee(
    sender: string,
    calls: Call[],
    transactionVersion: "0x2" | "0x3"
  ) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      transactionVersion,
      this.chainId,
      this.getKeplr
    );

    return await walletAccount.estimateInvokeFee(calls);
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
    transactionVersion: "0x2" | "0x3"
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

    return await this.estimateInvokeFee(sender, calls, transactionVersion);
  }

  async execute(
    sender: string,
    calls: Call[],
    fee: {
      maxFee?: Int;
      tip?: Int;
    },
    transactionVersion: "0x2" | "0x3"
  ) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    const walletAccount = new StoreAccount(
      modularChainInfo.starknet.rpc,
      sender,
      transactionVersion,
      this.chainId,
      this.getKeplr
    );

    return await walletAccount.execute(calls, {
      maxFee: fee.maxFee?.toString(),
      tip: fee.maxFee?.toString(),
    });
  }

  async executeForSendTokenTx(
    sender: string,
    amount: string,
    currency: ERC20Currency,
    recipient: string,
    fee: {
      maxFee?: Int;
      tip?: Int;
    },
    transactionVersion: "0x2" | "0x3"
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

    return await this.execute(sender, calls, fee, transactionVersion);
  }
}
