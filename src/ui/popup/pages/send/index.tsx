import React, { FunctionComponent, useState } from "react";
import { Input } from "../../../components/form";
import { RouteComponentProps } from "react-router-dom";
import { useStore } from "../../stores";

import { HeaderLayout } from "../../layouts/HeaderLayout";

import { PopupWalletProvider } from "../../wallet-provider";

import { Api } from "@everett-protocol/cosmosjs/core/api";
import { Rest } from "@everett-protocol/cosmosjs/core/rest";
import { Account } from "@everett-protocol/cosmosjs/core/account";
import { defaultTxEncoder } from "@everett-protocol/cosmosjs/common/stdTx";
import { stdTxBuilder } from "@everett-protocol/cosmosjs/common/stdTxBuilder";
import { queryAccount } from "@everett-protocol/cosmosjs/core/query";
import { GaiaRest } from "@everett-protocol/cosmosjs/gaia/rest";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import { Codec } from "@node-a-team/ts-amino";
import * as CmnCdc from "@everett-protocol/cosmosjs/common/codec";
import * as Bank from "@everett-protocol/cosmosjs/x/bank";
import * as Crypto from "@everett-protocol/cosmosjs/crypto";
import { MsgSend } from "@everett-protocol/cosmosjs/x/bank";
import {
  AccAddress,
  useBech32Config
} from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";

import bigInteger from "big-integer";
import useForm from "react-hook-form";
import { observer } from "mobx-react";
import { Button } from "../../../components/button";

interface FormData {
  recipient: string;
  amount: string;
}

// Don't need to be observer
export const SendPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { register, handleSubmit, errors } = useForm<FormData>({
      defaultValues: {
        recipient: "",
        amount: ""
      }
    });

    const { chainStore, accountStore } = useStore();
    const [loading, setLoading] = useState(false);

    return (
      <HeaderLayout
        showChainName
        canChangeChainInfo={false}
        onBackButton={() => {
          history.goBack();
        }}
      >
        <form
          onSubmit={handleSubmit(async data => {
            setLoading(true);

            const cosmosjs = new Api<Rest>(
              {
                chainId: chainStore.chainInfo.chainId,
                walletProvider: new PopupWalletProvider({
                  onRequestSignature: (index: string) => {
                    history.push(`/sign/${index}`);
                  }
                }),
                rpc: chainStore.chainInfo.rpc,
                // No need.
                rest: "",
                disableGlobalBech32Config: true
              },
              {
                txEncoder: defaultTxEncoder,
                txBuilder: stdTxBuilder,
                restFactory: (context: Context) => {
                  return new GaiaRest(context);
                },
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
                bech32Config: chainStore.chainInfo.bech32Config,
                bip44: chainStore.chainInfo.bip44,
                registerCodec: (codec: Codec) => {
                  CmnCdc.registerCodec(codec);
                  Crypto.registerCodec(codec);
                  // XXX: If cosmos-sdk/MsgSend has disambiguation bytes, it will not work
                  Bank.registerCodec(codec);
                }
              }
            );

            await cosmosjs.enable();

            // eslint-disable-next-line react-hooks/rules-of-hooks
            useBech32Config(chainStore.chainInfo.bech32Config, () => {
              const msg = new MsgSend(
                AccAddress.fromBech32(accountStore.bech32Address),
                AccAddress.fromBech32(data.recipient),
                [Coin.parse(data.amount)]
              );
              cosmosjs.sendMsgs([msg], {
                gas: bigInteger(60000),
                memo: "test",
                fee: new Coin("uatom", new Int("111"))
              });
            });
          })}
        >
          <Input
            type="text"
            label="Recipient"
            name="recipient"
            error={errors.recipient && errors.recipient.message}
            ref={register({
              required: "Recipient is required",
              validate: value => {
                // This is not react hook.
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return useBech32Config(
                  chainStore.chainInfo.bech32Config,
                  () => {
                    try {
                      AccAddress.fromBech32(value);
                    } catch (e) {
                      return "Invalid address";
                    }
                  }
                );
              }
            })}
          />
          <Input
            type="text"
            label="Amount"
            name="amount"
            error={errors.amount && errors.amount.message}
            ref={register({
              required: "Amount is required",
              validate: value => {
                try {
                  Coin.parse(value);
                } catch (e) {
                  return "Invalid amount";
                }
              }
            })}
          />
          <Button
            type="submit"
            color="primary"
            size="medium"
            fullwidth
            loading={loading}
          >
            Send
          </Button>
        </form>
      </HeaderLayout>
    );
  }
);
