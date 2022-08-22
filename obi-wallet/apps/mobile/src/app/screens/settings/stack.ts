import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
export const Stack = createNativeStackNavigator();
export interface StackParamList extends Record<string, object> {
  settings;
}
export function useNavigation() {
  return useNavigationOriginal<NavigationProp<StackParamList>>();
}
