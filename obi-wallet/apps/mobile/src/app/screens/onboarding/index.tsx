import { MultisigPhoneNumber } from "./create-multisig/1-phone-number";
import { MultisigPhoneNumberConfirm } from "./create-multisig/2-phone-number-confirm";
import { MultisigBiometrics } from "./create-multisig/3-biometrics";
import { MultisigSocial } from "./create-multisig/4-social";
import { MultisigInit } from "./create-multisig/5-init";
import { OnboardingStack } from "./onboarding-stack";
import { RecoverSinglesig } from "./recover-singlesig";
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
