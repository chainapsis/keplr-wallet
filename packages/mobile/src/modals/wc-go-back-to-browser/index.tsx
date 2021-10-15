import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { registerModal } from "../base";
import { CardModal } from "../card";

export const WCGoBackToBrowserModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  () => {
    const style = useStyle();

    return (
      <CardModal title="">
        <View style={style.flatten(["items-center"])}>
          <Text style={style.flatten(["subtitle1", "color-text-black-medium"])}>
            Go back to your browser
          </Text>
        </View>
      </CardModal>
    );
  },
  {
    disableSafeArea: true,
  }
);
