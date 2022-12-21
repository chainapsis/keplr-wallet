import { AccountSetBase, AccountSetBaseSuper } from "./base";
import {
  IQueriesStore,
  ERC20Queries,
  ObservableQueryERC20ContractInfo,
} from "../query";
import { Buffer } from "buffer/";
import { ChainGetter } from "../common";
import { AppCurrency, EthSignType } from "@keplr-wallet/types";
import { CosmosAccount } from "./cosmos";
import { BigNumber } from "@ethersproject/bignumber";
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
  protected erc20ContractQueries: Map<
    string,
    ObservableQueryERC20ContractInfo
  > = new Map();

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
    value: BigNumber,
    maxFeePerGas: BigNumber,
    gasLimit: BigNumber,
    onTxEvents?: {
      onBroadcasted?: (txHash: Uint8Array) => void;
    }
  ) {
    const keplr = await this.base.getKeplr();
    if (!keplr) {
      throw new Error("Can't get the Keplr API");
    }

    const senderBech32 = this.base.bech32Address;
    // Get hex representation of sender's account
    const senderHex = this.base.ethereumHexAddress;

    // Convert recipient address to hex
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

    // If applicable, send the hash back
    const hash = Buffer.from(response.hash.replace("0x", ""), "hex");
    if (onTxEvents?.onBroadcasted) {
      onTxEvents.onBroadcasted(hash);
    }

    // Wait for block confirmation, then refresh balance
    const receipt = await txClient.waitForTransaction(response.hash);

    console.log("Receipt");
    console.log(receipt);

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

  public fetchContractTokenInfo(contractAddress: string) {
    if (!this.erc20ContractQueries.has(contractAddress)) {
      const erc20ContractQuery = this.queriesStore.get(this.chainId).erc20
        .queryERC20ContractInfo;

      // Start contract query
      erc20ContractQuery.getQueryContract(contractAddress).tokenInfo;

      // Save query in internal map
      this.erc20ContractQueries.set(contractAddress, erc20ContractQuery);
    }
  }

  public scaleNativeToContractDenom(
    value: string,
    contractAddress: string
  ): BigNumber {
    // Fetch cached token info
    const erc20ContractQuery = this.erc20ContractQueries.get(contractAddress);
    if (!erc20ContractQuery) {
      throw new Error("No pre-fetched contract query found");
    }

    const tokenInfo = erc20ContractQuery.getQueryContract(contractAddress)
      .tokenInfo;

    if (!tokenInfo || !tokenInfo.decimals) {
      throw new Error(
        "Token info not found, cannot convert to contract denomination"
      );
    }

    const decimals = tokenInfo.decimals;

    // Convert to contract denomination
    const factor = new Dec(10).pow(new Int(decimals));
    const dec = new Dec(value).mul(factor);

    return BigNumber.from(dec.truncate().toString());
  }
}
