import { WelcomeOnboarding } from "./1-welcome";
import { PhoneNumberOnboarding } from "./2-phone-number";
import { PhoneNumberConfirmOnboarding } from "./3-phone-number-confirm";
import { BiometricsOnboarding } from "./4-biometrics";
import { SocialOnboarding } from "./5-social";
import { MultisigOnboarding } from "./6-multisig";
import { Stack } from "./stack";

export interface OnboardingScreensProps {
  initialRouteName?: string;
}

export function OnboardingScreen({ initialRouteName }: OnboardingScreensProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="onboarding1" component={WelcomeOnboarding} />
      <Stack.Screen name="onboarding2" component={PhoneNumberOnboarding} />
      <Stack.Screen
        name="onboarding3"
        component={PhoneNumberConfirmOnboarding}
      />
      <Stack.Screen name="onboarding4" component={BiometricsOnboarding} />
      <Stack.Screen name="onboarding5" component={SocialOnboarding} />
      <Stack.Screen name="onboarding6" component={MultisigOnboarding} />
    </Stack.Navigator>
  );
}
