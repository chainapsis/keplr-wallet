import { useIntl } from "react-intl";

import { Button } from "../../../button";
import ShieldCheck from "./assets/shield-check.svg";

export interface VerifyAndProceedButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function VerifyAndProceedButton({
  onPress,
  disabled,
}: VerifyAndProceedButtonProps) {
  const intl = useIntl();

  return (
    <Button
      label={intl.formatMessage({ id: "onboarding3.verifyandproceed" })}
      LeftIcon={ShieldCheck}
      flavor={disabled ? "gray" : "blue"}
      onPress={onPress}
      disabled={disabled}
    />
  );
}
