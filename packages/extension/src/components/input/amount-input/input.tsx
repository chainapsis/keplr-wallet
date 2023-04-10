import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IAmountConfig } from "@keplr-wallet/hooks";
import { TextInput } from "../text-input";
import { Subtitle3 } from "../../typography";
import { Box } from "../../box";
import { ColorPalette } from "../../../styles";
import { ArrowAcrossIcon } from "../../icon";

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
        <Box style={{ color: ColorPalette["gray-50"] }}>
          <ArrowAcrossIcon width="1rem" height="1rem" />
        </Box>
      }
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
