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
  ETransactionVersion,
  OutsideExecutionVersion,
  UniversalDetails,
} from "starknet";
import { Fee, StoreAccount } from "./internal";
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
    gasTokenAddress?: string
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
      await this._buildUniversalDetails(sender, gasTokenAddress)
    );
  }

  async deployAccount(
    sender: string,
    classHash: string,
    constructorCalldata: RawArgs,
    addressSalt: string,
    feeTokenAddress?: string,
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
        await this._buildUniversalDetails(sender, feeTokenAddress)
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
    fee: Fee,
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
    gasTokenAddress?: string
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

    return await walletAccount.estimateInvokeFee(
      calls,
      await this._buildUniversalDetails(sender, gasTokenAddress)
    );
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
    gasTokenAddress?: string
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

    return await this.estimateInvokeFee(sender, calls, gasTokenAddress);
  }

  async execute(
    sender: string,
    calls: Call[],
    fee: Fee,
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
    fee: Fee
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

  async getOutsideExecutionSupported(sender: string) {
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

    const snip9Version = await walletAccount.getSnip9Version();
    return snip9Version !== OutsideExecutionVersion.UNSUPPORTED;
  }

  private async _buildUniversalDetails(
    sender: string,
    gasTokenAddress?: string
  ): Promise<UniversalDetails> {
    const details: UniversalDetails = {
      version: ETransactionVersion.V3,
    };

    if (gasTokenAddress) {
      // TODO: if account is not deployed, it will throw error.
      // Thus, we need to check if the account is deployed
      // or find is there any way to check the contract to deploy is supported by paymaster.
      const isSupported = await this.getOutsideExecutionSupported(sender);
      if (!isSupported) {
        // TODO: handle this case
        // throw new Error("Outside execution is not supported");
      }

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

      const isAvailable = await walletAccount.paymaster.isAvailable();
      if (!isAvailable) {
        throw new Error("Paymaster is not available");
      }

      // TODO: observable query로 빼기
      const supportedTokens =
        await walletAccount.paymaster.getSupportedTokens();

      let found = false;
      let gasTokenAddressWithout0x = gasTokenAddress.replace("0x", "");

      for (const token of supportedTokens) {
        // 0x 떼고 비교, 길이가 맞지 않으면 짧은 쪽에 zero padding 추가
        let tokenAddressWithout0x = token.token_address.replace("0x", "");
        if (tokenAddressWithout0x.length < gasTokenAddressWithout0x.length) {
          tokenAddressWithout0x = tokenAddressWithout0x.padStart(
            gasTokenAddressWithout0x.length,
            "0"
          );
        } else if (
          tokenAddressWithout0x.length > gasTokenAddressWithout0x.length
        ) {
          gasTokenAddressWithout0x = gasTokenAddressWithout0x.padStart(
            tokenAddressWithout0x.length,
            "0"
          );
        }

        if (
          tokenAddressWithout0x.toLowerCase() ===
          gasTokenAddressWithout0x.toLowerCase()
        ) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Gas token is not supported by paymaster");
      }

      details.paymaster = {
        feeMode: {
          mode: "default",
          gasToken: gasTokenAddress,
        },
      };
    }

    return details;
  }
}
