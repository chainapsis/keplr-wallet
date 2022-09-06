import { SocialKey } from "../components/keys/social-key";
import { Onboarding1 } from "./onboarding1";
import { Onboarding2 } from "./onboarding2";
import { Onboarding3 } from "./onboarding3";
import { Onboarding4 } from "./onboarding4";
import { Onboarding6 } from "./onboarding6";
import { Stack } from "./stack";

export function OnboardingScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="onboarding1" component={Onboarding1} />
      <Stack.Screen name="onboarding2" component={Onboarding2} />
      <Stack.Screen name="onboarding3" component={Onboarding3} />
      <Stack.Screen name="onboarding4" component={Onboarding4} />
      <Stack.Screen name="onboarding5" component={SocialKey} />
      <Stack.Screen name="onboarding6" component={Onboarding6} />
    </Stack.Navigator>
  );
}
