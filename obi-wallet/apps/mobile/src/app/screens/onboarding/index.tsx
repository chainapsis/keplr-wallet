import { MultisigPhoneNumber } from "./common/1-phone-number";
import { MultisigPhoneNumberConfirm } from "./common/2-phone-number-confirm";
import { MultisigBiometrics } from "./common/3-biometrics";
import { MultisigSocial } from "./common/4-social";
import { MultisigInit } from "./create-multisig-init";
import { OnboardingStack } from "./onboarding-stack";
import { RecoverSinglesig } from "./recover-singlesig";
import { ReplaceMultisigConfirm } from "./replace-multisig-confirm";
import { ReplaceMultisig } from "./replace-multisig-key";
import { Welcome } from "./welcome";

export interface OnboardingScreensProps {
  initialRouteName?: string;
  keyInRecovery?: string;
  updateProposed?: boolean;
}

export function OnboardingScreen({
  initialRouteName,
  keyInRecovery,
  updateProposed,
}: OnboardingScreensProps) {
  const mayRenderStackPiece = (
    keynames: string[],
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: any
  ) => {
    if (keyCheck(keynames)) {
      return <OnboardingStack.Screen name={name} component={component} />;
    } else {
      return;
    }
  };

  const keyCheck = (keynames: string[]) => {
    let checkPassed = false;
    keynames.forEach((keyname: string) => {
      if (keyInRecovery === keyname) {
        checkPassed = true;
      }
    });
    return checkPassed;
  };

  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}
    >
      <OnboardingStack.Screen name="welcome" component={Welcome} />
      {mayRenderStackPiece(["biometrics", ""], "create-multisig-biometrics", {
        MultisigBiometrics,
      })}
      {mayRenderStackPiece(
        ["phoneNumber", ""],
        "create-multisig-phone-number",
        { MultisigPhoneNumber }
      )}
      {mayRenderStackPiece(
        ["phoneNumber", ""],
        "create-multisig-phone-number-confirm",
        { MultisigPhoneNumberConfirm }
      )}
      {mayRenderStackPiece(["", "social"], "create-multisig-social", {
        MultisigSocial,
      })}
      {mayRenderStackPiece([""], "create-multisig-init", { MultisigInit })}
      {mayRenderStackPiece(
        ["social", "biometrics", "phoneNumber"],
        "replace-multisig",
        { ReplaceMultisig }
      )}
      {mayRenderStackPiece(
        ["social", "biometrics", "phoneNumber"],
        "replace-multisig-confirm",
        { ReplaceMultisigConfirm }
      )}
      {mayRenderStackPiece([""], "recover-singlesig", { RecoverSinglesig })}
    </OnboardingStack.Navigator>
  );
}
