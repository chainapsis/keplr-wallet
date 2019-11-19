import { ChainInfo } from "../../chain-info";
import { Api } from "@everett-protocol/cosmosjs/core/api";
import { Rest } from "@everett-protocol/cosmosjs/core/rest";
import { defaultTxEncoder } from "@everett-protocol/cosmosjs/common/stdTx";
import { stdTxBuilder } from "@everett-protocol/cosmosjs/common/stdTxBuilder";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import { Account } from "@everett-protocol/cosmosjs/core/account";
import { queryAccount } from "@everett-protocol/cosmosjs/core/query";
import { Codec } from "@node-a-team/ts-amino";
import * as CmnCdc from "@everett-protocol/cosmosjs/common/codec";
import * as Crypto from "@everett-protocol/cosmosjs/crypto";
import * as Bank from "@everett-protocol/cosmosjs/x/bank";
import { WalletProvider } from "@everett-protocol/cosmosjs/core/walletProvider";

export class CosmosJS {
  static fromChainInfo<R extends Rest = Rest>(
    chainInfo: ChainInfo,
    walletProvider: WalletProvider,
    restFactory: (context: Context) => R,
    registerCodec?: (codec: Codec) => void
  ): Api<R> {
    return new Api<R>(
      {
        chainId: chainInfo.chainId,
        walletProvider: walletProvider,
        rpc: chainInfo.rpc,
        rest: chainInfo.rest,
        disableGlobalBech32Config: true
      },
      {
        txEncoder: defaultTxEncoder,
        txBuilder: stdTxBuilder,
        restFactory,
        queryAccount: (
          context: Context,
          address: string | Uint8Array
        ): Promise<Account> => {
          return queryAccount(
            context.get("bech32Config"),
            context.get("rpcInstance"),
            address
          );
        },
        bech32Config: chainInfo.bech32Config,
        bip44: chainInfo.bip44,
        registerCodec: registerCodec
          ? registerCodec
          : (codec: Codec) => {
              CmnCdc.registerCodec(codec);
              Crypto.registerCodec(codec);
              Bank.registerCodec(codec);
            }
      }
    );
  }
}
