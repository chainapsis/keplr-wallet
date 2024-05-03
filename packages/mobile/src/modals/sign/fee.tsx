import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IFeeConfig, IGasConfig } from "@keplr-wallet/hooks";
import { Text, View, ViewStyle } from "react-native";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { KeplrSignOptions } from "@keplr-wallet/types";
import { FeeButtonsInner } from "components/new/fee-button/fee-button-component";

export const FeeInSign: FunctionComponent<{
  isInternal: boolean;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  signOptions?: KeplrSignOptions;
}> = observer(({ isInternal, signOptions, feeConfig, gasConfig }) => {
  const { chainStore, priceStore } = useStore();

  const style = useStyle();

  const preferNoSetFee = signOptions?.preferNoSetFee ?? false;

  const fee =
    feeConfig.fee ??
    new CoinPretty(
      chainStore.getChain(feeConfig.chainId).stakeCurrency,
      new Dec("0")
    );
  const price = priceStore.calculatePrice(fee);

  // If the signing request is from internal and the "preferNoSetFee" option is set,
  // prevent the user to edit the fee.
  const canFeeEditable = !isInternal || !preferNoSetFee;
  return (
    <React.Fragment>
      {feeConfig.feeType && canFeeEditable ? (
        <FeeButtonsInner
          label="Fee"
          labelStyle={style.flatten(["color-gray-200"]) as ViewStyle}
          gasLabel="gas"
          feeConfig={feeConfig}
          gasConfig={gasConfig}
        />
      ) : (
        <View style={style.flatten(["padding-bottom-28"]) as ViewStyle}>
          <View
            style={
              style.flatten([
                "flex-row",
                "items-center",
                "margin-bottom-4",
              ]) as ViewStyle
            }
          >
            <Text
              style={
                style.flatten([
                  "padding-y-4",
                  "color-gray-200",
                  "margin-y-4",
                ]) as ViewStyle
              }
            >
              Fee
            </Text>
            <View style={style.get("flex-1")} />
            <Text style={style.flatten(["body3", "color-text-low"])}>
              {price ? price.toString() : "-"}
            </Text>
          </View>
          <View style={style.flatten(["flex-row"])}>
            <View style={style.get("flex-1")} />
            <Text style={style.flatten(["subtitle1", "color-gray-300"])}>
              {fee.trim(true).toString()}
            </Text>
          </View>
        </View>
      )}
    </React.Fragment>
  );
});
