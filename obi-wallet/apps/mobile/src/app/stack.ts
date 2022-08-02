import { App } from "@obi-wallet/common";
import {
  NavigationProp,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export interface StackParamList extends Record<string, object> {
  "web-view": {
    app: App;
  };
}

export const Stack = createNativeStackNavigator<StackParamList>();

export function useNavigation() {
  return useNavigationOriginal<NavigationProp<StackParamList>>();
}
