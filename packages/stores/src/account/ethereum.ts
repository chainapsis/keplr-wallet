import { AccountSetBase, AccountSetBaseSuper } from "./base";
import { IQueriesStore, ERC20Queries } from "../query";
import { Buffer } from "buffer/";
import { ChainGetter } from "../common";
import { AppCurrency, EthSignType } from "@keplr-wallet/types";
import { CosmosAccount } from "./cosmos";
import { Dec, Int } from "@keplr-wallet/unit";
import { Bech32Address } from "@keplr-wallet/cosmos";

export interface EthereumAccount {
  ethereum: EthereumAccountImpl;
}

export const EthereumAccount = {
  use(options: {
    queriesStore: IQueriesStore<ERC20Queries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
    chainGetter: ChainGetter,
    chainId: string
  ) => EthereumAccount {
    return (base, chainGetter, chainId) => {
      return {
        ethereum: new EthereumAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
        ),
      };
    };
  },
};

export class EthereumAccountImpl {
  constructor(
    protected readonly base: AccountSetBase & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<ERC20Queries>
  ) {}

  public async broadcastERC20TokenTransfer(
    currency: AppCurrency,
    contractAddress: string,
    recipientBech32: string,
    value: Int,
    maxFeePerGas: Int,
    gasLimit: Int,
    onTxEvents?: {
      onBroadcasted?: (txHash: Uint8Array) => void;
    }
  ) {
    const keplr = await this.base.getKeplr();
    if (!keplr) {
      throw new Error("Can't get the Keplr API");
    }

    // Get hex representations of sender and recipient
    const senderBech32 = this.base.bech32Address;
    const senderHex = this.base.ethereumHexAddress;

    const recipientHex = Bech32Address.fromBech32(
      recipientBech32,
      this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixAccAddr
    ).toHex(true);

    const txClient = this.queriesStore.get(this.chainId).erc20.txClient;

    const tx = await txClient.createERC20TokenTransferTx(
      contractAddress,
      senderHex,
      recipientHex,
      value,
      maxFeePerGas,
      gasLimit
    );

    const signedTxBytes = await keplr.signEthereum(
      this.chainId,
      senderBech32,
      JSON.stringify(tx),
      EthSignType.TRANSACTION
    );

    const response = await txClient.broadcastSignedTx(signedTxBytes);

    // Send the transaction hash back
    const hash = Buffer.from(response.hash.replace("0x", ""), "hex");
    if (onTxEvents?.onBroadcasted) {
      onTxEvents.onBroadcasted(hash);
    }

    // Wait for block confirmation and transaction status
    const receipt = await txClient.waitForTransaction(response.hash);
    if (!receipt.status) {
      // For some reason, receipt.logs are empty, so we show a generic error message instead
      throw new Error(
        "EVM transaction execution rejected, please check all fields and retry."
      );
    }

    // Refresh the token balance on successful transaction
    const queryBalance = this.queriesStore
      .get(this.chainId)
      .queryBalances.getQueryBech32Address(this.base.bech32Address)
      .balances.find((bal) => {
        return bal.currency.coinMinimalDenom === currency.coinMinimalDenom;
      });

    if (queryBalance) {
      queryBalance.fetch();
    }
  }

  public convertNativeToContractDenom(value: string, decimals: number): Int {
    // Convert to contract denomination
    const factor = new Dec(10).pow(new Int(decimals));
    const dec = new Dec(value).mul(factor);

    return new Int(dec.truncate().toString());
  }
}
