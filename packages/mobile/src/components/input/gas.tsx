import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { IGasConfig } from "@keplr-wallet/hooks";
import { InputCardView } from "components/new/card-view/input-card";
import { useStyle } from "styles/index";

export const GasInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;

  label: string;

  gasConfig: IGasConfig;
}> = observer(
  ({ labelStyle, containerStyle, inputContainerStyle, label, gasConfig }) => {
    const style = useStyle();
    const [isEnabled, setIsEnabled] = useState(true);

    return (
      <View>
        <View style={style.flatten(["flex-row", "items-center"])}>
          <Text
            style={StyleSheet.flatten([
              style.flatten([
                "h6",
                "color-platinum-100",
                "margin-y-24",
                "margin-right-18",
              ]) as ViewStyle,
            ])}
          >
            {"Auto"}
          </Text>
          <Switch
            trackColor={{
              false: "#767577",
              true: Platform.OS === "ios" ? "#ffffff00" : "#767577",
            }}
            thumbColor={isEnabled ? "#5F38FB" : "#D0BCFF66"}
            style={[
              {
                borderRadius: 16,
                borderWidth: 1,
              },
              style.flatten(["border-color-pink-light@90%"]),
            ]}
            onValueChange={() =>
              setIsEnabled((previousState) => !previousState)
            }
            value={isEnabled}
            // style={style.flatten([])}
          />
        </View>
        {!isEnabled ? (
          <View
            style={style.flatten(["flex-row", "justify-between"]) as ViewStyle}
          >
            <InputCardView
              label="Gas adjustment"
              placeholder="-"
              containerStyle={
                style.flatten(["flex-2", "margin-right-16"]) as ViewStyle
              }
              editable={false}
              keyboardType="numeric"
            />
            <InputCardView
              label="Estimated "
              placeholder="-"
              containerStyle={style.flatten(["flex-2"]) as ViewStyle}
              editable={false}
              keyboardType="numeric"
            />
          </View>
        ) : null}
        <View style={style.flatten(["margin-top-16"]) as ViewStyle}>
          <InputCardView
            label="Gas amount"
            placeholder="-"
            value={gasConfig.gasRaw}
            onChangeText={(value: string) => {
              if (value.match(/^\d*$/)) {
                gasConfig.setGas(value);
              }
            }}
            maxLength={8}
            keyboardType="numeric"
            editable={isEnabled}
          />
        </View>
      </View>
    );
  }
);
