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
  return (
    <Button
      label="Verify & Proceed"
      LeftIcon={ShieldCheck}
      flavor={disabled ? "gray" : "blue"}
      onPress={onPress}
      disabled={disabled}
    />
  );
}
