import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo
} from "react";

import { HeaderLayout } from "../../layouts/header-layout";

import {
  DefaultGasPriceStep,
  FeeButtons,
  Input,
  TextArea
} from "../../../components/form";
import { Button } from "reactstrap";

import { RouteComponentProps } from "react-router";

import { useTxBuilderConfig } from "../../../hooks";
import useForm, { FormContext } from "react-hook-form";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";

import bigInteger from "big-integer";
import queryString from "query-string";
import {
  getCurrency,
  getFiatCurrencyFromLanguage
} from "../../../../common/currency";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.module.scss";

import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import {
  disableScroll,
  enableScroll,
  fitWindow,
  isChrome
} from "../../../../common/window";

import { FormattedMessage, useIntl } from "react-intl";
import { useLanguage } from "../../language";

interface FormData {
  gas: string;
  fee: Coin | undefined;
  memo: string;
}

export const FeePage: FunctionComponent<RouteComponentProps<{
  id: string;
}>> = observer(({ match, location, history }) => {
  const query = queryString.parse(location.search);
  const external = query.external ?? false;

  const intl = useIntl();

  useEffect(() => {
    if (external) {
      fitWindow();
      disableScroll();
    } else {
      enableScroll();
    }
  }, [external]);

  const id = match.params.id;

  const { chainStore, priceStore } = useStore();

  const formMethods = useForm<FormData>({
    defaultValues: {
      gas: "",
      memo: ""
    }
  });
  const { register, handleSubmit, setValue, errors, watch } = formMethods;

  register({ name: "fee" }, { required: "Fee is required" });

  const gas = watch("gas");
  let gasInt = parseInt(gas);
  if (Number.isNaN(gasInt)) {
    gasInt = 0;
  }

  const feeCurrency = useMemo(() => {
    return getCurrency(chainStore.chainInfo.feeCurrencies[0]);
  }, [chainStore.chainInfo.feeCurrencies]);

  const language = useLanguage();

  useEffect(() => {
    const fiatCurrency = getFiatCurrencyFromLanguage(language.language);

    const coinGeckoId = feeCurrency?.coinGeckoId;

    if (coinGeckoId && !priceStore.hasFiat(fiatCurrency.currency)) {
      priceStore.fetchValue([fiatCurrency.currency], [coinGeckoId]);
    }
  }, [feeCurrency?.coinGeckoId, language.language, priceStore]);

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
    if (external) {
      // If it runs on not chrome, setting fee page will be closed and siging page will be opened by wallet provider.
      // But, if it runs on chrome, wallet provider will replace window with signing page, so we don't have to close this page.
      if (!isChrome()) {
        window.close();
      }
    }
  }, [external]);

  const txBuilder = useTxBuilderConfig(id, onConfigInit, onApprove);

  useEffect(() => {
    return () => {
      // If requested id is changed, just reject the prior one.
      if (external && txBuilder.reject) {
        txBuilder.reject();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txBuilder.reject, id, external]);

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (!txBuilder.loading && external && txBuilder.reject) {
        await txBuilder.reject();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [txBuilder, external]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={
        !external
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
              type="number"
              step="1"
              label={intl.formatMessage({
                id: "fee.input.gas"
              })}
              name="gas"
              error={errors.gas && errors.gas.message}
              ref={register({
                required: intl.formatMessage({
                  id: "fee.input.gas.required"
                }),
                validate: (value: string) => {
                  try {
                    bigInteger(value);
                  } catch (e) {
                    return intl.formatMessage({
                      id: "fee.input.gas.invalid"
                    });
                  }
                }
              })}
            />
            <TextArea
              label={intl.formatMessage({
                id: "fee.input.memo"
              })}
              name="memo"
              rows={2}
              style={{ resize: "none" }}
              error={errors.memo && errors.memo.message}
              ref={register({})}
            />
            <FormContext {...formMethods}>
              <FeeButtons
                label={intl.formatMessage({
                  id: "fee.input.fee"
                })}
                feeSelectLabels={{
                  low: intl.formatMessage({ id: "fee-buttons.select.low" }),
                  average: intl.formatMessage({
                    id: "fee-buttons.select.average"
                  }),
                  high: intl.formatMessage({ id: "fee-buttons.select.high" })
                }}
                name="fee"
                error={errors.fee && errors.fee.message}
                currency={feeCurrency!}
                gasPriceStep={DefaultGasPriceStep}
                gas={gasInt}
              />
            </FormContext>
          </div>
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            color="primary"
            block
            disabled={txBuilder.initializing}
            data-loading={txBuilder.requested}
          >
            <FormattedMessage id="fee.button.set" />
          </Button>
        </div>
      </form>
    </HeaderLayout>
  );
});
