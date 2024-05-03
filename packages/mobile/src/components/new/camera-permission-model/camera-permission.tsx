import { CardModal } from "modals/card";
import React, { FunctionComponent, ReactElement } from "react";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { Button } from "components/button";

export const CameraPermissionModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  onPress: () => void;
  title: string;
  buttonText: string;
  icon: ReactElement;
}> = ({ isOpen, onPress, title, buttonText, icon, close }) => {
  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <React.Fragment>
      <CardModal
        isOpen={isOpen}
        disableGesture={true}
        cardStyle={style.flatten(["padding-bottom-32"]) as ViewStyle}
        close={close}
      >
        <IconWithText
          icon={icon}
          iconStyle={{ marginRight: -45 }}
          title={title}
          subtitle={
            "We need your permission to access the camera to scan the QR code in the next step."
          }
          subtitleStyle={style.flatten(["subtitle3"]) as ViewStyle}
        />
        <Button
          containerStyle={
            style.flatten(["border-radius-32", "margin-top-18"]) as ViewStyle
          }
          textStyle={style.flatten(["body3"]) as ViewStyle}
          size="large"
          text={buttonText}
          onPress={onPress}
        />
      </CardModal>
    </React.Fragment>
  );
};
