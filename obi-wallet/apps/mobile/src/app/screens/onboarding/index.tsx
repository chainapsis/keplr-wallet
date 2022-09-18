import { MultisigPhoneNumberOnboarding } from "./create-multisig/1-phone-number";
import { PhoneNumberConfirmOnboarding } from "./create-multisig/2-phone-number-confirm";
import { BiometricsOnboarding } from "./create-multisig/3-biometrics";
import { SocialOnboarding } from "./create-multisig/4-social";
import { MultisigOnboarding } from "./create-multisig/5-create";
import { OnboardingStack } from "./onboarding-stack";
import { WelcomeOnboarding } from "./welcome";

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
      <OnboardingStack.Screen name="welcome" component={WelcomeOnboarding} />
      <OnboardingStack.Screen
        name="create-multisig-phone-number"
        component={MultisigPhoneNumberOnboarding}
      />
      <OnboardingStack.Screen
        name="create-multisig-phone-number-confirm"
        component={PhoneNumberConfirmOnboarding}
      />
      <OnboardingStack.Screen
        name="create-multisig-biometrics"
        component={BiometricsOnboarding}
      />
      <OnboardingStack.Screen
        name="create-multisig-social"
        component={SocialOnboarding}
      />
      <OnboardingStack.Screen
        name="create-multisig-init"
        component={MultisigOnboarding}
      />
    </OnboardingStack.Navigator>
  );
}
