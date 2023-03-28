import React, { FunctionComponent } from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import { IRecipientConfig } from "@keplr-wallet/hooks";

export const RecipientInput: FunctionComponent<{
  recipientConfig: IRecipientConfig;
}> = observer(({ recipientConfig }) => {
  return (
    <TextInput
      label="Recipient"
      onChange={(e) => {
        e.preventDefault();
        recipientConfig.setValue(e.target.value);
      }}
      value={recipientConfig.value}
      error={(() => {
        const uiProperties = recipientConfig.uiProperties;

        const err = uiProperties.error || uiProperties.warning;
        if (err) {
          return err.message || err.toString();
        }
      })()}
    />
  );
});
