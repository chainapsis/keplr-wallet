import { Button } from "../../../button";
import ShieldCheck from "./assets/shield-check.svg";

export interface VerifyAndProceedButtonProps {
  onPress: () => void;
}

export function VerifyAndProceedButton({
  onPress,
}: VerifyAndProceedButtonProps) {
  return (
    <Button
      label="Verify & Proceed"
      LeftIcon={ShieldCheck}
      flavor="blue"
      onPress={onPress}
    />
  );
}
