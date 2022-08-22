import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
export const Stack = createNativeStackNavigator();
export type StackParamList = Record<string, object>;

export function useNavigation() {
  return useNavigationOriginal<NavigationProp<StackParamList>>();
}
