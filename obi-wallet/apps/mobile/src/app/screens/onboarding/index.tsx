import { MultisigPhoneNumber } from "./common/1-phone-number";
import { MultisigPhoneNumberConfirm } from "./common/2-phone-number-confirm";
import { MultisigBiometrics } from "./common/3-biometrics";
import { MultisigSocial } from "./common/4-social";
import { MultisigInit } from "./create-multisig-init";
import { LookupProxyWallets } from "./lookup-proxy-wallets";
import { OnboardingStack } from "./onboarding-stack";
import { RecoverMultisig } from "./recover-multisig";
import { RecoverSinglesig } from "./recover-singlesig";
import { ReplaceMultisig } from "./replace-multisig-key";
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
        name="create-multisig-biometrics"
        component={MultisigBiometrics}
      />
      <OnboardingStack.Screen
        name="create-multisig-phone-number"
        component={MultisigPhoneNumber}
      />
      <OnboardingStack.Screen
        name="create-multisig-phone-number-confirm"
        component={MultisigPhoneNumberConfirm}
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
        name="replace-multisig"
        component={ReplaceMultisig}
      />
      <OnboardingStack.Screen
        name="recover-multisig"
        component={RecoverMultisig}
      />
      <OnboardingStack.Screen
        name="recover-singlesig"
        component={RecoverSinglesig}
      />
      <OnboardingStack.Screen
        name="lookup-proxy-wallets"
        component={LookupProxyWallets}
      />
    </OnboardingStack.Navigator>
  );
}
