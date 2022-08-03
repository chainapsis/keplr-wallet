import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type StackParamList = Record<string, object>;

export const Stack = createNativeStackNavigator<StackParamList>();

export function useNavigation() {
  return useNavigationOriginal<NavigationProp<StackParamList>>();
}
