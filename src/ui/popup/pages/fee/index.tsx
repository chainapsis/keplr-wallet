import React, { FunctionComponent, useCallback, useState } from "react";

import { HeaderLayout } from "../../layouts/header-layout";

import { Input, CoinInput } from "../../../components/form";
import { Button } from "../../../components/button";

import { RouteComponentProps } from "react-router";

import { useTxBuilderConfig } from "../../../hooks";
import useForm from "react-hook-form";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import {
  feeFromString,
  feeToString
} from "../../../../background/keyring/utils";

import bigInteger from "big-integer";
import queryString from "query-string";
import { getCurrencies } from "../../../../chain-info";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.module.scss";

interface FormData {
  gas: string;
  fee: string;
  memo: string;
}

export const FeePage: FunctionComponent<RouteComponentProps<{
  chainId: string;
}>> = observer(({ match, location, history }) => {
  const query = queryString.parse(location.search);
  const inPopup = query.inPopup ?? false;

  const chainId = match.params.chainId;

  const { chainStore } = useStore();

  const { register, handleSubmit, setValue, setError, errors } = useForm<
    FormData
  >({
    defaultValues: {
      gas: "",
      fee: "",
      memo: ""
    }
  });

  register(
    { name: "fee" },
    {
      required: "Fee is required"
    }
  );

  const [fee, setFee] = useState<string | undefined>();

  const onConfigInit = useCallback(
    (chainId: string, config: TxBuilderConfig) => {
      chainStore.setChain(chainId);

      setValue("gas", config.gas.toString());
      setFee(feeToString(config.fee));
      setValue("memo", config.memo);
    },
    [chainStore, setValue]
  );

  const onApprove = useCallback(() => {
    // Don't do anything. Wallet provider will redirect to signing page.
  }, []);

  const txBuilder = useTxBuilderConfig(chainId, onConfigInit, onApprove);

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
          config.fee = feeFromString(data.fee);
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
            <CoinInput
              label="Fee"
              name="fee"
              setValue={setValue}
              setError={setError}
              error={errors.fee && errors.fee.message}
              currencies={getCurrencies(chainStore.chainInfo.feeCurrencies)}
              defaultValue={fee}
            />
            <Input
              type="text"
              label="Memo (Optional)"
              name="memo"
              error={errors.memo && errors.memo.message}
              ref={register({})}
            />
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
