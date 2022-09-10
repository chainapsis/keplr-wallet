import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export interface StackParamList extends Record<string, object | undefined> {
  onboarding1: undefined;
  onboarding2: undefined;
  onboarding3: {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
  onboarding4: undefined;
  onboarding5: undefined;
  onboarding6: undefined;
}

export const Stack = createNativeStackNavigator<StackParamList>();

export function useNavigation() {
  return useNavigationOriginal<NavigationProp<StackParamList>>();
}
