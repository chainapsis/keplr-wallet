import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { EmptyAmountError, IAmountConfig } from "@keplr-wallet/hooks";
import { TextInput } from "../text-input";
import { Subtitle3 } from "../../typography";
import { ArrowAcrossIcon } from "../../icon";
import { IconButton } from "../../icon-button";

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
      rightLabel={
        <Subtitle3 style={{ cursor: "pointer", textDecoration: "underline" }}>
          Max
        </Subtitle3>
      }
      type="number"
      value={amountConfig.value}
      onChange={(e) => {
        e.preventDefault();

        amountConfig.setValue(e.target.value);
      }}
      right={
        <IconButton onClick={() => console.log("TODO")}>
          <ArrowAcrossIcon width="1.75rem" height="1.75rem" />
        </IconButton>
      }
      error={(() => {
        const uiProperties = amountConfig.uiProperties;

        const err = uiProperties.error || uiProperties.warning;

        if (err instanceof EmptyAmountError) {
          return;
        }

        if (err) {
          return err.message || err.toString();
        }
      })()}
    />
  );
});
