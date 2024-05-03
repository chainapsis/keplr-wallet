import React, { FunctionComponent, useState } from "react";

import styleFeeButtons from "./fee-buttons.module.scss";

import { FormGroup } from "reactstrap";

import { observer } from "mobx-react-lite";
import { IFeeConfig } from "@keplr-wallet/hooks";
import { FormattedMessage } from "react-intl";

import { useStore } from "../../../stores";
import { Card } from "@components-v2/card";
import { Dropdown } from "@components-v2/dropdown";

export const FeeCurrencySelector: FunctionComponent<{
  feeConfig: IFeeConfig;
}> = observer(({ feeConfig }) => {
  const { queriesStore } = useStore();
  const queryBalances = queriesStore
    .get(feeConfig.chainId)
    .queryBalances.getQueryBech32Address(feeConfig.sender);

  const [randomId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes).toString("hex");
  });

  const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);

  const firstFeeCurrencyDenom =
    feeConfig.feeCurrencies.length > 0
      ? feeConfig.feeCurrencies[0].coinMinimalDenom
      : "";

  // Show the fee currencies that account has.
  // But, always show the first fee currency to reduce the confusion to user because first fee currency has priority.
  const selectableCurrencies = feeConfig.feeCurrencies.filter((cur) => {
    if (
      firstFeeCurrencyDenom &&
      cur.coinMinimalDenom === firstFeeCurrencyDenom
    ) {
      return true;
    }

    const bal = queryBalances.getBalanceFromCurrency(cur);
    return !bal.toDec().isZero();
  });

  return (
    <FormGroup style={{ marginBottom: "0px" }}>
      <div className={styleFeeButtons["label"]}>
        <FormattedMessage id="input.fee.selector.fee-currency" />
      </div>
      <Card
        key={`selector-${randomId}`}
        heading={feeConfig.feeCurrency?.coinDenom || "Unknown"}
        rightContent={require("@assets/svg/wireframe/chevron-down.svg")}
        style={{ background: "rgba(255,255,255,0.1)" }}
        onClick={() => setIsOpenTokenSelector(!isOpenTokenSelector)}
      />
      <Dropdown
        isOpen={isOpenTokenSelector}
        setIsOpen={setIsOpenTokenSelector}
        closeClicked={() => setIsOpenTokenSelector(!isOpenTokenSelector)}
        title={"Fee Token"}
      >
        {selectableCurrencies.map((currency) => {
          return (
            <Card
              heading={currency.coinDenom}
              key={currency.coinMinimalDenom}
              style={
                currency.coinDenom === feeConfig.feeCurrency?.coinDenom
                  ? { background: "#5F38FB" }
                  : {}
              }
              onClick={(e: any) => {
                e.preventDefault();

                feeConfig.setAutoFeeCoinMinimalDenom(currency.coinMinimalDenom);
              }}
            />
          );
        })}
      </Dropdown>
    </FormGroup>
  );
});
