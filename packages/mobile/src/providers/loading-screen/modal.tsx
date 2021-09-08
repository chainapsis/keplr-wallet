import React, { FunctionComponent, useEffect, useRef } from "react";
import { registerModal, useModalState } from "../../modals/base";
import { LoadingSpinner } from "../../components/spinner";
import { View } from "react-native";
import { useStyle } from "../../styles";

export const LoadingScreenModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  onOpenComplete?: () => void;
}> = registerModal(
  ({ onOpenComplete }) => {
    const style = useStyle();

    const onOpenCompleteRef = useRef(onOpenComplete);
    onOpenCompleteRef.current = onOpenComplete;

    const modal = useModalState();
    useEffect(() => {
      if (!modal.isTransitionOpening) {
        if (onOpenCompleteRef.current) {
          onOpenCompleteRef.current();
        }
      }
    }, [modal.isTransitionOpening]);

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
