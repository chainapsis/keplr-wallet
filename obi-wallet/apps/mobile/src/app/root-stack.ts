import { App } from "@obi-wallet/common";
import {
  NavigationProp,
  ParamListBase,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SettingsStackParamList } from "./screens/settings/settings-stack";

export interface RootStackParamList
  extends ParamListBase,
    SettingsStackParamList {
  "state-renderer": undefined;
  "web-view": {
    app: App;
  };
  send: undefined;
  receive: undefined;
}

export const RootStack = createNativeStackNavigator<RootStackParamList>();

export function useRootNavigation() {
  return useNavigationOriginal<NavigationProp<RootStackParamList>>();
}
