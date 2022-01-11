import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IMemoConfig } from "@keplr-wallet/hooks";
import { TextStyle, ViewStyle } from "react-native";
import { TextInput } from "./input";

export const MemoInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;

  label: string;

  memoConfig: IMemoConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    memoConfig,
  }) => {
    return (
      <TextInput
        label={label}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        value={memoConfig.memo}
        onChangeText={(text) => {
          memoConfig.setMemo(text);
        }}
      />
    );
  }
);
