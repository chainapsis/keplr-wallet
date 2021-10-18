import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { TextStyle, ViewStyle } from "react-native";
import { IGasConfig } from "@keplr-wallet/hooks";
import { TextInput } from "./input";

export const GasInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;

  label: string;

  gasConfig: IGasConfig;
}> = observer(
  ({ labelStyle, containerStyle, inputContainerStyle, label, gasConfig }) => {
    return (
      <TextInput
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        label={label}
        value={gasConfig.gas.toString()}
        onChangeText={(text) => {
          const gas = parseInt(text);
          if (!isNaN(gas) && gas > 0) {
            gasConfig.setGas(gas);
          }
        }}
        keyboardType="number-pad"
      />
    );
  }
);
