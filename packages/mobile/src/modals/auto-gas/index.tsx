import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { TextInput } from "../../components/input";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { Toggle } from "../../components/toggle";
import Svg, { Path } from "react-native-svg";
import { IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";

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

    const [isAuto, setIsAuto] = useState<boolean>(true);

    return (
      <CardModal
        title="Set Gas"
        parentContainerStyle={style.flatten(["background-color-white"])}
      >
        {gasSimulator.outdatedCosmosSdk ? (
          <View
            style={style.flatten([
              "border-radius-8",
              "background-color-red-50",
              "padding-20",
              "margin-bottom-10",
            ])}
          >
            <Text style={style.flatten(["body3", "color-red-400"])}>
              Gas estimation is not supported, because this chain uses outdated
              cosmos-sdk
            </Text>
          </View>
        ) : null}
        {gasSimulator.forceDisabled && gasSimulator.forceDisableReason ? (
          <View
            style={style.flatten([
              "border-radius-8",
              "background-color-red-50",
              "padding-20",
              "margin-bottom-10",
            ])}
          >
            <Text style={style.flatten(["body3", "color-red-400"])}>
              {gasSimulator.forceDisableReason.message}
            </Text>
          </View>
        ) : null}

        <View
          style={style.flatten([
            "flex-row",
            "justify-between",
            "items-center",
            "margin-bottom-8",
          ])}
        >
          <Text style={style.flatten(["subtitle3"])}>Gas</Text>
          <View style={style.flatten(["flex-row", "items-center"])}>
            <Text style={style.flatten(["subtitle3", "margin-right-8"])}>
              Auto
            </Text>
            <Toggle
              on={isAuto}
              onChange={(value) => {
                setIsAuto(value);
              }}
            />
          </View>
        </View>

        {isAuto ? (
          <View
            style={style.flatten(["width-full", "flex-row", "items-center"])}
          >
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
              inputContainerStyle={style.flatten(["border-color-gray-100"])}
            />

            <View style={style.flatten(["margin-left-8", "margin-right-8"])}>
              <MultiplyIcon size={16} color="#C6C6CD" />
            </View>

            <TextInput
              label="Predicted gas"
              value={gasSimulator.gasEstimated?.toString() ?? "-"}
              returnKeyType="done"
              containerStyle={style.flatten(["flex-1"])}
              inputContainerStyle={style.flatten(["border-color-gray-100"])}
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
          editable={!isAuto}
          inputContainerStyle={style.flatten(["border-color-gray-100"])}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
