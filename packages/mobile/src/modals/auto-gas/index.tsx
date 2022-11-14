import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { TextInput } from "../../components/input";
import { Platform, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { Toggle } from "../../components/toggle";
import Svg, { Path } from "react-native-svg";
import { IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import * as RNLocalize from "react-native-localize";

const MultiplyIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 14 14">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12.657 12.686L1.343 1.373m11.314 0L1.343 12.686 12.657 1.373z"
      />
    </Svg>
  );
};

const AlertView: FunctionComponent<{
  text: string;
}> = ({ text }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "border-radius-8",
        "background-color-red-50",
        "padding-20",
        "margin-bottom-16",
      ])}
    >
      <Text style={style.flatten(["body3", "color-red-400"])}>{text}</Text>
    </View>
  );
};

export const AutoGasModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  gasConfig: IGasConfig;
  gasSimulator: IGasSimulator & {
    outdatedCosmosSdk?: boolean;
    forceDisabled?: boolean;
    forceDisableReason?: Error | undefined;
  };
}> = registerModal(
  observer(({ gasSimulator, gasConfig }) => {
    const style = useStyle();

    return (
      <CardModal title="Set Gas">
        {gasSimulator.outdatedCosmosSdk ? (
          <AlertView
            text="Gas estimation is not supported, because this chain uses outdated
              cosmos-sdk"
          />
        ) : null}
        {gasSimulator.forceDisabled && gasSimulator.forceDisableReason ? (
          <AlertView text={gasSimulator.forceDisableReason.message} />
        ) : null}

        <View
          style={style.flatten([
            "flex-row",
            "justify-between",
            "items-center",
            "margin-bottom-16",
          ])}
        >
          <Text style={style.flatten(["subtitle3"])}>Gas</Text>
          <View style={style.get("flex-1")} />
          <Text style={style.flatten(["subtitle3", "margin-right-10"])}>
            Auto
          </Text>
          <Toggle
            on={gasSimulator.enabled}
            onChange={(value) => {
              gasSimulator.setEnabled(value);
            }}
          />
        </View>

        {gasSimulator.enabled ? (
          <View style={style.flatten(["flex-row", "items-center"])}>
            <TextInput
              label="Gas Adjustment"
              value={
                gasSimulator.gasEstimated != null
                  ? gasSimulator.gasAdjustmentRaw
                  : "-"
              }
              onChangeText={(text) => {
                gasSimulator.setGasAdjustment(text);
              }}
              editable={gasSimulator.gasEstimated != null}
              returnKeyType="done"
              containerStyle={style.flatten(["flex-1"])}
              keyboardType={(() => {
                if (Platform.OS === "ios") {
                  // In IOS, the numeric type keyboard has a decimal separator "." or "," depending on the language and region of the user device.
                  // However, asset input in keplr unconditionally follows the US standard, so it must be ".".
                  // However, if only "," appears on the keyboard, "." cannot be entered.
                  // In this case, it is inevitable to use a different type of keyboard.
                  if (
                    RNLocalize.getNumberFormatSettings().decimalSeparator !==
                    "."
                  ) {
                    return "numbers-and-punctuation";
                  }
                  return "numeric";
                } else {
                  // In Android, the numeric type keyboard has both "." and ",".
                  // So, there is no need to use other keyboard type on any case.
                  return "numeric";
                }
              })()}
            />

            <View style={style.flatten(["margin-left-12", "margin-right-12"])}>
              <MultiplyIcon size={16} color="#C6C6CD" />
            </View>

            <TextInput
              label="Predicted gas"
              value={gasSimulator.gasEstimated?.toString() ?? "-"}
              containerStyle={style.flatten(["flex-1"])}
              editable={false}
            />
          </View>
        ) : null}
        <TextInput
          label="Gas Amount"
          value={gasConfig.gas.toString()}
          onChangeText={(text) => {
            gasConfig.setGas(text);
          }}
          returnKeyType="done"
          editable={!gasSimulator.enabled}
          keyboardType="numeric"
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
