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
}

export function OnboardingScreen({ initialRouteName }: OnboardingScreensProps) {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}
    >
      <OnboardingStack.Screen name="welcome" component={Welcome} />
      <OnboardingStack.Screen
        name="create-multisig-phone-number"
        component={MultisigPhoneNumber}
      />
      <OnboardingStack.Screen
        name="create-multisig-phone-number-confirm"
        component={MultisigPhoneNumberConfirm}
      />
      <OnboardingStack.Screen
        name="create-multisig-biometrics"
        component={MultisigBiometrics}
      />
      <OnboardingStack.Screen
        name="create-multisig-social"
        component={MultisigSocial}
      />
      <OnboardingStack.Screen
        name="create-multisig-init"
        component={MultisigInit}
      />
      <OnboardingStack.Screen
        name="recover-singlesig"
        component={RecoverSinglesig}
      />
    </OnboardingStack.Navigator>
  );
}
