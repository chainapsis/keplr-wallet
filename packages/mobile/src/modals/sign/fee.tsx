import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { IFeeConfig, IGasConfig } from "@keplr-wallet/hooks";
import { Text, View } from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeplrSignOptions } from "@keplr-wallet/types";
import { RightArrowIcon } from "../../components/icon";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { FeeButtons } from "../../components/input";
import { Button } from "../../components/button";

const FeeButtonsModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}> = registerModal(
  observer(({ close, feeConfig, gasConfig }) => {
    return (
      <CardModal title="Set Fee">
        <FeeButtons
          label="Fee"
          gasLabel="Gas"
          feeConfig={feeConfig}
          gasConfig={gasConfig}
        />
        <Button
          color="primary"
          size="large"
          text="Confirm"
          onPress={() => {
            close();
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);

export const FeeInSign: FunctionComponent<{
  interactionKey: string;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  signOptions?: KeplrSignOptions;
}> = observer(({ interactionKey, signOptions, feeConfig, gasConfig }) => {
  const { chainStore, priceStore, interactionModalStore } = useStore();

  const style = useStyle();

  const urlInfo = interactionModalStore.getUrlInfo(interactionKey);
  const isInternal = urlInfo?.isInternal ?? false;
  const preferNoSetFee = signOptions?.preferNoSetFee ?? false;

  const fee =
    feeConfig.fee ??
    new CoinPretty(
      chainStore.getChain(feeConfig.chainId).stakeCurrency,
      new Dec("0")
    );
  const feePrice = priceStore.calculatePrice(fee);

  // If the signing request is from internal and the "preferNoSetFee" option is set,
  // prevent the user to edit the fee.
  const canFeeEditable = !isInternal || !preferNoSetFee;

  const [isSetFeeModalOpen, setIsSetFeeModalOpen] = useState(false);

  return (
    <React.Fragment>
      <FeeButtonsModal
        isOpen={isSetFeeModalOpen}
        close={() => setIsSetFeeModalOpen(false)}
        feeConfig={feeConfig}
        gasConfig={gasConfig}
      />
      <View style={style.flatten(["margin-bottom-28"])}>
        <View
          style={style.flatten(["flex-row", "items-center", "margin-bottom-4"])}
        >
          <Text style={style.flatten(["subtitle3", "color-text-black-medium"])}>
            Fee
          </Text>
          <View style={style.get("flex-1")} />
          <Text style={style.flatten(["body3", "color-text-black-low"])}>
            {feePrice ? feePrice.toString() : "-"}
          </Text>
        </View>
        <View style={style.flatten(["flex-row"])}>
          <View style={style.get("flex-1")} />
          <TouchableOpacity
            style={style.flatten(["flex-row", "items-center"])}
            disabled={!canFeeEditable}
            onPress={() => {
              setIsSetFeeModalOpen(true);
            }}
          >
            <Text
              style={style.flatten(
                ["subtitle1", "color-text-black-medium"],
                [canFeeEditable && "color-primary"]
              )}
            >
              {fee.trim(true).toString()}
            </Text>
            {canFeeEditable ? (
              <View style={style.flatten(["margin-left-6"])}>
                <RightArrowIcon
                  color={style.get("color-primary").color}
                  height={12}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </React.Fragment>
  );
});
