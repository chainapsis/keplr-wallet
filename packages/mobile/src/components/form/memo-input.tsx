import React, { FunctionComponent } from "react";
import { IMemoConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { DefaultInput } from "../input";

export interface MemoInputProps {
  memoConfig: IMemoConfig;
  disabled?: boolean;
}

// TODO: Handle the max memo bytes length for each chain.
export const MemoInput: FunctionComponent<MemoInputProps> = observer(
  ({ memoConfig, disabled = false }) => {
    return (
      <DefaultInput
        label="Memo (optional)"
        onChangeText={(value) => {
          memoConfig.setMemo(value);
        }}
        disabled={disabled}
      />
    );
  }
);
