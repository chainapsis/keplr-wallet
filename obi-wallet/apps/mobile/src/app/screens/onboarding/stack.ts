import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export interface StackParamList extends Record<string, object> {
  onboarding3: {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  };
}

export const Stack = createNativeStackNavigator<StackParamList>();

export function useNavigation() {
  return useNavigationOriginal<NavigationProp<StackParamList>>();
}
