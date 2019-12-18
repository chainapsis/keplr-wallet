import React, { FunctionComponent, useMemo, useState } from "react";
import {
  FeeButtons,
  CoinInput,
  Input,
  TextArea
} from "../../../components/form";
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

import bigInteger from "big-integer";
import useForm, { FormContext } from "react-hook-form";
import { observer } from "mobx-react";

import queryString from "query-string";
import { useCosmosJS } from "../../../hooks";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import { getCurrencies, getCurrency } from "../../../../common/currency";

import style from "./style.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

interface FormData {
  recipient: string;
  amount: string;
  denom: string;
  memo: string;
  fee: Coin | undefined;
}

export const SendPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const formMethods = useForm<FormData>({
      defaultValues: {
        recipient: "",
        amount: "",
        denom: "",
        memo: ""
      }
    });
    const { register, handleSubmit, errors } = formMethods;

    register({ name: "fee" }, { required: "Fee is required" });

    const { chainStore, accountStore, priceStore } = useStore();
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

    const feeCurrency = useMemo(() => {
      return getCurrency(chainStore.chainInfo.feeCurrencies[0]);
    }, [chainStore.chainInfo.feeCurrencies]);

    const feePrice = priceStore.getValue("usd", feeCurrency?.coinGeckoId);

    const feeValue = useMemo(() => {
      return feePrice ? feePrice.value : new Dec(0);
    }, [feePrice]);

    return (
      <HeaderLayout
        showChainName
        canChangeChainInfo={false}
        onBackButton={() => {
          history.goBack();
        }}
      >
        <form
          className={style.formContainer}
          onSubmit={handleSubmit(async (data: FormData) => {
            const coin = CoinUtils.getCoinFromDecimals(data.amount, data.denom);

            await useBech32ConfigPromise(
              chainStore.chainInfo.bech32Config,
              async () => {
                const msg = new MsgSend(
                  AccAddress.fromBech32(accountStore.bech32Address),
                  AccAddress.fromBech32(data.recipient),
                  [coin]
                );

                const config: TxBuilderConfig = {
                  gas: bigInteger(60000),
                  memo: data.memo,
                  fee: data.fee as Coin
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
                    },
                    "commit"
                  );
                }
              }
            );
          })}
        >
          <div className={style.formInnerContainer}>
            <div>
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
              <CoinInput
                currencies={getCurrencies(chainStore.chainInfo.currencies)}
                label="Amount"
                error={
                  errors.amount &&
                  errors.amount.message &&
                  errors.denom &&
                  errors.denom.message
                }
                input={{
                  name: "amount",
                  ref: register({
                    required: "Amount is required"
                  })
                }}
                select={{
                  name: "denom",
                  ref: register({
                    required: "Denom is required"
                  })
                }}
              />
              <TextArea
                label="Memo (Optional)"
                name="memo"
                rows={2}
                style={{ resize: "none" }}
                error={errors.memo && errors.memo.message}
                ref={register({ required: false })}
              />
              <FormContext {...formMethods}>
                <FeeButtons
                  label="Fee"
                  name="fee"
                  error={errors.fee && errors.fee.message}
                  currency={feeCurrency!}
                  price={feeValue}
                />
              </FormContext>
            </div>
            <div style={{ flex: 1 }} />
            <Button
              type="submit"
              color="primary"
              size="medium"
              fullwidth
              loading={cosmosJS.loading}
              disabled={cosmosJS.sendMsgs == null}
            >
              Send
            </Button>
          </div>
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
      {/* TODO: change subtitle when tx succeeds */}
      <Result
        status={error ? "error" : "success"}
        title={error ? "Transaction fails" : "Transaction succeeds"}
        subTitle={error ? error : "Transaction succeeds."}
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
