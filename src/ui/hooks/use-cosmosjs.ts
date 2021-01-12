import { ChainInfo } from "../../background/chains";
import { WalletProvider } from "@chainapsis/cosmosjs/core/walletProvider";
import { Context } from "@chainapsis/cosmosjs/core/context";
import { GaiaRest } from "@chainapsis/cosmosjs/gaia/rest";
import { Codec } from "@chainapsis/ts-amino";
import * as CmnCdc from "@chainapsis/cosmosjs/common/codec";
import * as Crypto from "@chainapsis/cosmosjs/crypto";
import * as Bank from "@chainapsis/cosmosjs/x/bank";
import * as Distr from "@chainapsis/cosmosjs/x/distribution";
import * as Staking from "@chainapsis/cosmosjs/x/staking";
import * as Slashing from "@chainapsis/cosmosjs/x/slashing";
import * as Gov from "@chainapsis/cosmosjs/x/gov";
import * as Wasm from "@chainapsis/cosmosjs/x/wasm";
import * as SecretWasm from "../../common/secretjs/x/compute";
import { Rest } from "@chainapsis/cosmosjs/core/rest";
import { useCallback, useEffect, useState } from "react";
import { Msg } from "@chainapsis/cosmosjs/core/tx";
import { TxBuilderConfig } from "@chainapsis/cosmosjs/core/txBuilder";
import { Api } from "@chainapsis/cosmosjs/core/api";
import { defaultTxEncoder } from "@chainapsis/cosmosjs/common/stdTx";
import { stdTxBuilder } from "@chainapsis/cosmosjs/common/stdTxBuilder";
import { Account } from "@chainapsis/cosmosjs/core/account";
import { queryAccount } from "@chainapsis/cosmosjs/core/query";
import { RequestBackgroundTxMsg } from "../../background/tx";
import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";
import Axios from "axios";
import {
  ResultBroadcastTx,
  ResultBroadcastTxCommit
} from "@chainapsis/cosmosjs/rpc/tx";

const Buffer = require("buffer/").Buffer;

export type SendMsgs = (
  msgs: Msg[],
  config: TxBuilderConfig,
  onSuccess?: (result?: ResultBroadcastTx | ResultBroadcastTxCommit) => void,
  onFail?: (e: Error) => void,
  mode?: "commit" | "sync" | "async"
) => Promise<void>;

export interface CosmosJsHook {
  api?: Api<Rest>;
  loading: boolean;
  error?: Error;
  addresses: string[];
  sendMsgs?: SendMsgs;
}

/**
 * useCosmosJS hook returns the object related to cosmosjs api.
 * sendMsgs in returned value can send msgs asynchronously safely.
 * sendMsgs will not make state transition after component unmounted.
 * Make sure to pass the wallet provider as state to avoid re-rendering unnecessarily.
 * You can override rest factory or register codec.
 * Also, make sure that you pass rest factory and register codec by using useCallback to avoid unnecessary re-rendering.
 */
export const useCosmosJS = <R extends Rest = Rest>(
  chainInfo: ChainInfo,
  walletProvider: WalletProvider,
  opts: {
    restFactory?: (context: Context) => R;
    registerCodec?: (codec: Codec) => void;
    useBackgroundTx?: boolean;
  } = {}
): CosmosJsHook => {
  const [api, setApi] = useState<Api<Rest> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const memorizedRestFactory = useCallback<(context: Context) => R>(
    opts?.restFactory ||
      ((context: Context) => (new GaiaRest(context) as unknown) as R),
    [opts?.restFactory]
  );

  const memorizedRegisterCodec = useCallback<(codec: Codec) => void>(
    opts?.registerCodec ||
      ((codec: Codec) => {
        CmnCdc.registerCodec(codec);
        Crypto.registerCodec(codec);
        if (chainInfo.chainId.startsWith("shentu")) {
          codec.registerConcrete("bank/MsgSend", Bank.MsgSend.prototype);
        } else {
          Bank.registerCodec(codec);
        }
        Distr.registerCodec(codec);
        Staking.registerCodec(codec);
        Slashing.registerCodec(codec);
        Gov.registerCodec(codec);
        Wasm.registerCodec(codec);
        SecretWasm.registerCodec(codec);
      }),
    [opts?.registerCodec]
  );

  const [addresses, setAddresses] = useState<string[]>([]);
  const [sendMsgs, setSendMsgs] = useState<SendMsgs | undefined>(undefined);

  useEffect(() => {
    setLoading(false);
    let isSubscribed = true;

    const isStargate = chainInfo.features
      ? chainInfo.features.includes("stargate")
      : false;

    const api = new Api<R>(
      {
        chainId: chainInfo.chainId,
        walletProvider: walletProvider,
        rpc: chainInfo.rpc,
        rest: chainInfo.rest
      },
      {
        txEncoder: defaultTxEncoder,
        txBuilder: stdTxBuilder,
        rpcInstanceFactory: chainInfo.rpcConfig
          ? (rpc: string) => {
              return Axios.create({
                ...{
                  baseURL: rpc
                },
                ...chainInfo.rpcConfig
              });
            }
          : undefined,
        restInstanceFactory: chainInfo.restConfig
          ? (rest: string) => {
              return Axios.create({
                ...{
                  baseURL: rest
                },
                ...chainInfo.restConfig
              });
            }
          : undefined,
        restFactory: memorizedRestFactory,
        queryAccount: (
          context: Context,
          address: string | Uint8Array
        ): Promise<Account> => {
          return queryAccount(
            context.get("rpcInstance"),
            address,
            chainInfo.bech32Config.bech32PrefixAccAddr,
            {
              isStargate
            }
          );
        },
        bech32Config: chainInfo.bech32Config,
        bip44: chainInfo.bip44,
        registerCodec: memorizedRegisterCodec
      }
    );

    if (!api.wallet) {
      if (isSubscribed) {
        setError(new Error("their is no wallet"));
      }
    } else {
      (async () => {
        await api.enable();
        const keys = await api.getKeys();
        const addresses: string[] = [];
        for (const key of keys) {
          addresses.push(key.bech32Address);
        }
        if (isSubscribed) {
          setAddresses(addresses);
        }
      })();
    }

    api.isStargate = isStargate;
    setApi(api);

    const _sendMsgs: SendMsgs = async (
      msgs: Msg[],
      config: TxBuilderConfig,
      onSuccess?: (
        result?: ResultBroadcastTx | ResultBroadcastTxCommit
      ) => void,
      onFail?: (e: Error) => void,
      mode: "commit" | "sync" | "async" = "commit"
    ) => {
      if (isSubscribed) {
        setLoading(true);
      }
      try {
        if (api.wallet) {
          await api.enable();

          if (!opts?.useBackgroundTx) {
            const result = await api.sendMsgs(msgs, config, mode);

            if (result.mode === "sync" || result.mode === "async") {
              if (result.code !== 0) {
                throw new Error(result.log);
              }
            } else if (result.mode === "commit") {
              if (
                result.checkTx.code !== undefined &&
                result.checkTx.code !== 0
              ) {
                throw new Error(result.checkTx.log);
              }
              if (
                result.deliverTx.code !== undefined &&
                result.deliverTx.code !== 0
              ) {
                throw new Error(result.deliverTx.log);
              }
            }

            if (onSuccess) {
              onSuccess(result);
            }
          } else {
            const tx = await api.context.get("txBuilder")(
              api.context,
              msgs,
              config
            );
            let bz = api.context.get("txEncoder")(api.context, tx, isStargate);

            if (isStargate) {
              const json = JSON.parse(Buffer.from(bz).toString());
              bz = Buffer.from(JSON.stringify(json.value));
            }

            const msg = new RequestBackgroundTxMsg(
              api.context.get("chainId"),
              Buffer.from(bz).toString("hex"),
              mode,
              isStargate
            );
            await sendMessage(BACKGROUND_PORT, msg);

            if (onSuccess) {
              onSuccess();
            }
          }
        } else {
          throw new Error("their is no wallet");
        }
      } catch (e) {
        if (isSubscribed) {
          setError(e);
        }
        if (onFail) {
          onFail(e);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    setSendMsgs(() => _sendMsgs);

    return () => {
      isSubscribed = false;
    };
  }, [
    chainInfo,
    walletProvider,
    memorizedRestFactory,
    memorizedRegisterCodec,
    opts.useBackgroundTx
  ]);

  return {
    api,
    loading,
    error,
    addresses,
    sendMsgs
  };
};
