import { MultisigPhoneNumber } from "./common/1-phone-number";
import { MultisigPhoneNumberConfirm } from "./common/2-phone-number-confirm";
import { MultisigBiometrics } from "./common/3-biometrics";
import { MultisigSocial } from "./common/4-social";
import { MultisigInit } from "./create-multisig-init";
import { OnboardingStack } from "./onboarding-stack";
import { RecoverSinglesig } from "./recover-singlesig";
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
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}
    >
      <OnboardingStack.Screen name="welcome" component={Welcome} />
      {keyInRecovery === "biometrics" || keyInRecovery === "" ? (
        <OnboardingStack.Screen
          name="create-multisig-biometrics"
          component={MultisigBiometrics}
        />
      ) : null}
      {keyInRecovery === "phoneNumber" || keyInRecovery === "" ? (
        <OnboardingStack.Screen
          name="create-multisig-phone-number"
          component={MultisigPhoneNumber}
        />
      ) : null}
      {keyInRecovery === "phoneNumber" || keyInRecovery === "" ? (
        <OnboardingStack.Screen
          name="create-multisig-phone-number-confirm"
          component={MultisigPhoneNumberConfirm}
        />
      ) : null}
      {keyInRecovery === "social" || keyInRecovery === "" ? (
        <OnboardingStack.Screen
          name="create-multisig-social"
          component={MultisigSocial}
        />
      ) : null}
      {keyInRecovery === "" ? (
        <OnboardingStack.Screen
          name="create-multisig-init"
          component={MultisigInit}
        />
      ) : (
        <OnboardingStack.Screen
          name="replace-multisig"
          component={ReplaceMultisig}
        />
      )}
      {updateProposed === true ? (
        <OnboardingStack.Screen
          name="replace-multisig-confirm"
          component={ReplaceMultisig}
        />
      ) : null}
      {keyInRecovery === "" ? (
        <OnboardingStack.Screen
          name="recover-singlesig"
          component={RecoverSinglesig}
        />
      ) : null}
    </OnboardingStack.Navigator>
  );
}
