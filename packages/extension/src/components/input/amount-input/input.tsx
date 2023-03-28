import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IAmountConfig } from "@keplr-wallet/hooks";
import { TextInput } from "../text-input";

export const AmountInput: FunctionComponent<{
  amountConfig: IAmountConfig;
}> = observer(({ amountConfig }) => {
  if (amountConfig.amount.length !== 1) {
    throw new Error(
      `Amount input component only handles single amount: ${amountConfig.amount
        .map((a) => a.toString())
        .join(",")}`
    );
  }

  return (
    <TextInput
      label="Amount"
      type="number"
      value={amountConfig.value}
      onChange={(e) => {
        e.preventDefault();

        amountConfig.setValue(e.target.value);
      }}
      error={(() => {
        const uiProperties = amountConfig.uiProperties;

        const err = uiProperties.error || uiProperties.warning;
        if (err) {
          return err.message || err.toString();
        }
      })()}
    />
  );
});
