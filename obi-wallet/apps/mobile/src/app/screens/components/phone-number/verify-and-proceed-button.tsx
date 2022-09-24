import { useIntl } from "react-intl";

import { Button } from "../../../button";
import ShieldCheck from "./assets/shield-check.svg";
import { StyleProp, ViewStyle } from "react-native";

export interface VerifyAndProceedButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function VerifyAndProceedButton({
  onPress,
  disabled,
  style,
}: VerifyAndProceedButtonProps) {
  const intl = useIntl();

  return (
    <Button
      label={intl.formatMessage({
        id: "onboarding3.verifyandproceed",
        defaultMessage: "Verify & Proceed",
      })}
      LeftIcon={ShieldCheck}
      flavor={disabled ? "gray" : "blue"}
      onPress={() => {
        !disabled && onPress();
      }}
      disabled={disabled}
      style={[{ marginBottom: 20 }, style]}
    />
  );
}
