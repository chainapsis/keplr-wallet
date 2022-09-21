import { useStore } from "../../stores";
import { MultisigPhoneNumber } from "./common/1-phone-number";
import { MultisigPhoneNumberConfirm } from "./common/2-phone-number-confirm";
import { MultisigBiometrics } from "./common/3-biometrics";
import { MultisigSocial } from "./common/4-social";
import { MultisigInit } from "./create-multisig-init";
import { OnboardingStack } from "./onboarding-stack";
import { RecoverSinglesig } from "./recover-singlesig";
import { ReplaceMultisigPropose } from "./replace-multisig-key/1-propose";
import { ReplaceMultisigConfirm } from "./replace-multisig-key/2-confirm";
import { Welcome } from "./welcome";

export interface OnboardingScreensProps {
  initialRouteName?: string;
  keyInRecovery?: string;
}

export function OnboardingScreen({
  initialRouteName,
  keyInRecovery,
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
          name="replace-multisig-propose"
          component={ReplaceMultisigPropose}
        />
      )}
      {keyInRecovery === "" ? (
        <OnboardingStack.Screen
          name="recover-singlesig"
          component={RecoverSinglesig}
        />
      ) : (
        <OnboardingStack.Screen
          name="replace-multisig-confirm"
          component={ReplaceMultisigConfirm}
        />
      )}
    </OnboardingStack.Navigator>
  );
}
