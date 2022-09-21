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
  keyReplace?: "phone_number" | "social" | "biometrics";
}

export function OnboardingScreen({
  initialRouteName,
  keyReplace,
}: OnboardingScreensProps) {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}
    >
      <OnboardingStack.Screen name="welcome" component={Welcome} />
      {keyReplace === "phone_number" ? (
        <OnboardingStack.Screen
          name="create-multisig-phone-number"
          component={MultisigPhoneNumber}
        />
      ) : null}
      {keyReplace === "phone_number" ? (
        <OnboardingStack.Screen
          name="create-multisig-phone-number-confirm"
          component={MultisigPhoneNumberConfirm}
        />
      ) : null}
      {keyReplace === "biometrics" ? (
        <OnboardingStack.Screen
          name="create-multisig-biometrics"
          component={MultisigBiometrics}
        />
      ) : null}
      {keyReplace === "social" ? (
        <OnboardingStack.Screen
          name="create-multisig-social"
          component={MultisigSocial}
        />
      ) : null}
      {keyReplace === null ? (
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
      {keyReplace === null ? (
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
