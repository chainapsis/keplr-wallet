import React, { FunctionComponent, useCallback } from "react";

import { HeaderLayout } from "../../layouts/header-layout";

import { Input } from "../../../components/form";
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

interface FormData {
  gas: string;
  fee: string;
  memo: string;
}

export const FeePage: FunctionComponent<RouteComponentProps<{
  chainId: string;
}>> = ({ match }) => {
  const chainId = match.params.chainId;

  const { register, handleSubmit, setValue, errors } = useForm<FormData>({
    defaultValues: {
      gas: "",
      fee: "",
      memo: ""
    }
  });

  const onConfigInit = useCallback(
    (config: TxBuilderConfig) => {
      setValue("gas", config.gas.toString());
      setValue("fee", feeToString(config.fee));
      setValue("memo", config.memo);
    },
    [setValue]
  );

  const onApprove = useCallback(() => {
    // Don't do anything. Wallet provider will redirect to signing page.
  }, []);

  const txBuilder = useTxBuilderConfig(chainId, onConfigInit, onApprove);

  return (
    <HeaderLayout showChainName canChangeChainInfo={false}>
      <form
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
        <Input
          type="text"
          label="Fee"
          name="fee"
          error={errors.fee && errors.fee.message}
          ref={register({
            required: "Fee is required"
            // TODO: validating
            // validate: (value:string) => {}
          })}
        />
        <Input
          type="text"
          label="Memo (Optional)"
          name="memo"
          error={errors.memo && errors.memo.message}
          ref={register({})}
        />
        <Button type="submit" color="primary" size="medium" fullwidth>
          Set Fee
        </Button>
      </form>
    </HeaderLayout>
  );
};
