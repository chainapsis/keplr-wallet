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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const components: any = {
    "create-multisig-biometrics": MultisigBiometrics,
    "create-multisig-phone-number": MultisigPhoneNumber,
    "create-multisig-phone-number-confirm": MultisigPhoneNumberConfirm,
    "create-multisig-social": MultisigSocial,
    "create-multisig-init": MultisigInit,
    "replace-multisig": ReplaceMultisig,
    "replace-multisig-confirm": ReplaceMultisigConfirm,
    "recover-singlesig": RecoverSinglesig,
  };

  const mayRenderStackPiece = (renderWhen: string[], name: string) => {
    if (keyCheck(renderWhen)) {
      const SpecificComponent = components[name];
      return (
        <OnboardingStack.Screen name={name} component={SpecificComponent} />
      );
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
      {mayRenderStackPiece(["biometrics", ""], "create-multisig-biometrics")}
      {mayRenderStackPiece(["phoneNumber", ""], "create-multisig-phone-number")}
      {mayRenderStackPiece(
        ["phoneNumber", ""],
        "create-multisig-phone-number-confirm"
      )}
      {mayRenderStackPiece(["", "social"], "create-multisig-social")}
      {mayRenderStackPiece([""], "create-multisig-init")}
      {mayRenderStackPiece(
        ["social", "biometrics", "phoneNumber"],
        "replace-multisig"
      )}
      {mayRenderStackPiece(
        ["social", "biometrics", "phoneNumber"],
        "replace-multisig-confirm"
      )}
      {mayRenderStackPiece([""], "recover-singlesig")}
    </OnboardingStack.Navigator>
  );
}
