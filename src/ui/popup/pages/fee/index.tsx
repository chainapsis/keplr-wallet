import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo
} from "react";

import { HeaderLayout } from "../../layouts/header-layout";

import { FeeButtons, Input, TextArea } from "../../../components/form";
import { Button } from "../../../components/button";

import { RouteComponentProps } from "react-router";

import { useTxBuilderConfig } from "../../../hooks";
import useForm, { FormContext } from "react-hook-form";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";

import bigInteger from "big-integer";
import queryString from "query-string";
import { getCurrency } from "../../../../common/currency";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.module.scss";

import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

interface FormData {
  gas: string;
  fee: Coin | undefined;
  memo: string;
}

export const FeePage: FunctionComponent<RouteComponentProps<{
  chainId: string;
}>> = observer(({ match, location, history }) => {
  const query = queryString.parse(location.search);
  const inPopup = query.inPopup ?? false;

  const chainId = match.params.chainId;

  const { chainStore, priceStore } = useStore();

  const formMethods = useForm<FormData>({
    defaultValues: {
      gas: "",
      memo: ""
    }
  });
  const { register, handleSubmit, setValue, errors } = formMethods;

  register({ name: "fee" }, { required: "Fee is required" });

  const feeCurrency = useMemo(() => {
    return getCurrency(chainStore.chainInfo.feeCurrencies[0]);
  }, [chainStore.chainInfo.feeCurrencies]);

  const feePrice = priceStore.getValue("usd", feeCurrency?.coinGeckoId);

  const feeValue = useMemo(() => {
    return feePrice ? feePrice.value : new Dec(0);
  }, [feePrice]);

  const onConfigInit = useCallback(
    (chainId: string, config: TxBuilderConfig) => {
      chainStore.setChain(chainId);

      setValue("gas", config.gas.toString());

      // Always returns the fee by fee buttons.
      /*if (config.fee instanceof Coin) {
        setValue("fee", config.fee);
      }*/
      // TODO: handle multiple fees.

      setValue("memo", config.memo);
    },
    [chainStore, setValue]
  );

  const onApprove = useCallback(() => {
    // Don't do anything. Wallet provider will redirect to signing page.
  }, []);

  const txBuilder = useTxBuilderConfig(chainId, onConfigInit, onApprove);

  useEffect(() => {
    return () => {
      // If requested chain id is changed, just reject the prior one.
      if (!inPopup && txBuilder.reject) {
        txBuilder.reject();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txBuilder.reject, chainId, inPopup]);

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (!txBuilder.loading && !inPopup && txBuilder.reject) {
        await txBuilder.reject();
      }
    };

    addEventListener("beforeunload", beforeunload);
    // It can know that page is requested newly by catching hash changed event.
    addEventListener("hashchange", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
      removeEventListener("hashchange", beforeunload);
    };
  }, [txBuilder, inPopup]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={
        inPopup
          ? () => {
              history.goBack();
            }
          : undefined
      }
    >
      <form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data: FormData) => {
          if (!txBuilder.approve) {
            throw new Error("tx builder is not loaded");
          }

          const config = txBuilder.config;
          if (!config) {
            throw new Error("config is not loaded");
          }
          config.gas = bigInteger(data.gas);
          config.fee = data.fee as Coin;
          config.memo = data.memo;
          await txBuilder.approve(config);
        })}
      >
        <div className={style.formInnerContainer}>
          <div>
            <Input
              type="text"
              label="Gas"
              name="gas"
              error={errors.gas && errors.gas.message}
              ref={register({
                required: "Gas is required",
                validate: (value: string) => {
                  try {
                    bigInteger(value);
                  } catch (e) {
                    return "Gas should be number";
                  }
                }
              })}
            />
            <TextArea
              label="Memo (Optional)"
              name="memo"
              rows={2}
              style={{ resize: "none" }}
              error={errors.memo && errors.memo.message}
              ref={register({})}
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
            disabled={txBuilder.initializing}
            loading={txBuilder.requested}
          >
            Set Fee
          </Button>
        </div>
      </form>
    </HeaderLayout>
  );
});
