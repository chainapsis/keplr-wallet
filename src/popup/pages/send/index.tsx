import React, { FunctionComponent, useState } from "react";
import { Form, Input, Label } from "../../components/form";
import { RouteComponentProps } from "react-router-dom";
import { useStore } from "../../stores";

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

// Don't need to be observer
export const SendPage: FunctionComponent<RouteComponentProps> = ({
  history
}) => {
  const { chainStore, accountStore } = useStore();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <Form
      onSubmit={async e => {
        e.preventDefault();

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
            AccAddress.fromBech32(recipient),
            [Coin.parse(amount)]
          );
          cosmosjs.sendMsgs([msg], {
            gas: bigInteger(60000),
            memo: "test",
            fee: new Coin("uatom", new Int("111"))
          });
        });
      }}
    >
      <Label>Recipient</Label>
      <Input
        type="text"
        required
        value={recipient}
        onChange={e => {
          setRecipient(e.target.value);
        }}
      />
      <Label>Amount</Label>
      <Input
        type="text"
        required
        value={amount}
        onChange={e => {
          setAmount(e.target.value);
        }}
      />
      <Input type="submit" value="Submit" />
    </Form>
  );
};
