import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export interface StackParamList extends Record<string, object> {
  onboarding3: {
    securityQuestion: string;
    securityAnswer: string;
    type: "text" | "whatsApp";
  };
}

export const Stack = createNativeStackNavigator<StackParamList>();

export function useNavigation() {
  return useNavigationOriginal<NavigationProp<StackParamList>>();
}
