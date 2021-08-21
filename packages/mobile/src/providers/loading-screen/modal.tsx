import React, { FunctionComponent } from "react";
import { registerModal } from "../../modals/staging/base";
import { LoadingSpinner } from "../../components/staging/spinner";
import { View } from "react-native";
import { useStyle } from "../../styles";

export const LoadingScreenModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  () => {
    const style = useStyle();

    return (
      <View style={style.flatten(["items-center", "justify-center"])}>
        <LoadingSpinner size={30} color="white" />
      </View>
    );
  },
  {
    align: "center",
    transitionVelocity: 0,
  }
);
