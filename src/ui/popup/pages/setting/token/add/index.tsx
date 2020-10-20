import React, { FunctionComponent, useCallback } from "react";
import { HeaderLayout } from "../../../../layouts/header-layout";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";

import style from "./style.module.scss";
import { Button, Form } from "reactstrap";
import { Input } from "../../../../../components/form";
import { useWasmTokenInfo } from "../../../../../hooks/use-wasm-token-info";
import { observer } from "mobx-react";
import { useStore } from "../../../../stores";
import useForm from "react-hook-form";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import { CW20Currency } from "../../../../../../common/currency";

interface FormData {
  contractAddress: string;
}

export const AddTokenPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { chainStore } = useStore();

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: ""
    }
  });

  const contractAddress = form.watch("contractAddress");

  const tokenInfo = useWasmTokenInfo(
    chainStore.chainInfo.rest,
    contractAddress,
    chainStore.chainInfo.restConfig
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "token.add"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <Form
        className={style.container}
        onSubmit={form.handleSubmit(async data => {
          if (
            tokenInfo.tokenInfo?.decimals &&
            tokenInfo.tokenInfo.name &&
            tokenInfo.tokenInfo.symbol
          ) {
            const currency: CW20Currency = {
              type: "cw20",
              contractAddress: data.contractAddress,
              coinMinimalDenom: tokenInfo.tokenInfo.name,
              coinDenom: tokenInfo.tokenInfo.symbol,
              coinDecimals: tokenInfo.tokenInfo.decimals
            };

            await chainStore.addToken(currency);

            history.push({
              pathname: "/"
            });
          }
        })}
      >
        <Input
          type="text"
          label="Contract Address"
          name="contractAddress"
          ref={form.register({
            required: "Contract address is required",
            validate: (value: string): string | undefined => {
              try {
                AccAddress.fromBech32(
                  value,
                  chainStore.chainInfo.bech32Config.bech32PrefixAccAddr
                );
              } catch {
                return "Invalid address";
              }
            }
          })}
          error={
            form.errors.contractAddress
              ? form.errors.contractAddress.message
              : tokenInfo.tokenInfo == null
              ? tokenInfo.error?.message
              : undefined
          }
        />
        <Input
          type="text"
          label="Name"
          value={tokenInfo.tokenInfo?.name}
          readOnly={true}
        />
        <Input
          type="text"
          label="Symbol"
          value={tokenInfo.tokenInfo?.symbol}
          readOnly={true}
        />
        <Input
          type="text"
          label="Decimals"
          value={tokenInfo.tokenInfo?.decimals}
          readOnly={true}
        />
        <div style={{ flex: 1 }} />
        <Button
          type="submit"
          color="primary"
          disabled={tokenInfo.tokenInfo == null || tokenInfo.fetching}
        >
          Submit
        </Button>
      </Form>
    </HeaderLayout>
  );
});
