import React, { FunctionComponent, useState } from "react";
import { Input } from "../../../components/form";
import { RouteComponentProps } from "react-router-dom";
import { useStore } from "../../stores";

import { HeaderLayout } from "../../layouts";
import { Button } from "../../../components/button";
import { Result } from "../../../components/result";

import { PopupWalletProvider } from "../../wallet-provider";

import { MsgSend } from "@everett-protocol/cosmosjs/x/bank";
import {
  AccAddress,
  useBech32Config,
  useBech32ConfigPromise
} from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";

import bigInteger from "big-integer";
import useForm from "react-hook-form";
import { observer } from "mobx-react";

import queryString from "query-string";
import { useCosmosJS } from "../../../hooks";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import { getCurrency } from "../../../../chain-info";

interface FormData {
  recipient: string;
  amount: string;
  memo: string;
}

export const SendPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { register, handleSubmit, errors } = useForm<FormData>({
      defaultValues: {
        recipient: "",
        amount: "",
        memo: ""
      }
    });

    const { chainStore, accountStore } = useStore();
    const [walletProvider] = useState(
      new PopupWalletProvider(
        {
          onRequestTxBuilderConfig: (chainId: string) => {
            history.push(`/fee/${chainId}?inPopup=true`);
          }
        },
        {
          onRequestSignature: (index: string) => {
            history.replace(`/sign/${index}?inPopup=true`);
          }
        }
      )
    );
    const cosmosJS = useCosmosJS(chainStore.chainInfo, walletProvider);

    return (
      <HeaderLayout
        showChainName
        canChangeChainInfo={false}
        onBackButton={() => {
          history.goBack();
        }}
      >
        <form
          onSubmit={handleSubmit(async (data: FormData) => {
            await useBech32ConfigPromise(
              chainStore.chainInfo.bech32Config,
              async () => {
                const msg = new MsgSend(
                  AccAddress.fromBech32(accountStore.bech32Address),
                  AccAddress.fromBech32(data.recipient),
                  [Coin.parse(data.amount)]
                );

                const config: TxBuilderConfig = {
                  gas: bigInteger(60000),
                  memo: data.memo,
                  fee: new Coin(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    getCurrency(
                      chainStore.chainInfo.nativeCurrency
                    )!.coinMinimalDenom,
                    new Int("1000")
                  )
                };

                if (cosmosJS.sendMsgs) {
                  await cosmosJS.sendMsgs(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [msg!],
                    config,
                    () => {
                      history.replace("/send/result");
                    },
                    e => {
                      history.replace(`/send/result?error=${e.toString()}`);
                    }
                  );
                }
              }
            );
          })}
        >
          <Input
            type="text"
            label="Recipient"
            name="recipient"
            error={errors.recipient && errors.recipient.message}
            ref={register({
              required: "Recipient is required",
              validate: (value: string) => {
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
              validate: (value: string) => {
                try {
                  Coin.parse(value);
                } catch (e) {
                  return "Invalid amount";
                }
              }
            })}
          />
          <Input
            type="text"
            label="Memo (Optional)"
            name="memo"
            error={errors.memo && errors.memo.message}
            ref={register({ required: false })}
          />
          <Button
            type="submit"
            color="primary"
            size="medium"
            fullwidth
            loading={cosmosJS.loading}
            active={cosmosJS.sendMsgs != null}
          >
            Send
          </Button>
        </form>
      </HeaderLayout>
    );
  }
);

export const SendResultPage: FunctionComponent<RouteComponentProps> = ({
  location,
  history
}) => {
  const query = queryString.parse(location.search);
  const error = query.error as string | undefined;

  return (
    <HeaderLayout showChainName canChangeChainInfo={false}>
      <Result
        status={error ? "error" : "success"}
        title={error ? "Transaction fails" : "Transaction succeeds"}
        subTitle={error ? error : "Wait a second. Tx will be commited soon."}
        extra={
          <Button
            size="medium"
            onClick={() => {
              history.replace("/");
            }}
          >
            Go to main
          </Button>
        }
      />
    </HeaderLayout>
  );
};
