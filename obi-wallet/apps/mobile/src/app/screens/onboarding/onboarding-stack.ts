import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export interface OnboardingStackParamList
  extends Record<string, object | undefined> {
  welcome: undefined;
  "create-multisig-biometrics": undefined;
  "create-multisig-phone-number": undefined;
  "create-multisig-phone-number-confirm": {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
  "create-multisig-social": undefined;
  "create-multisig-create": undefined;
  "replace-multisig": undefined;
}

export const OnboardingStack =
  createNativeStackNavigator<OnboardingStackParamList>();

export function useOnboardingNavigation() {
  return useNavigationOriginal<NavigationProp<OnboardingStackParamList>>();
}
