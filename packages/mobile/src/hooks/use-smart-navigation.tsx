import {
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { createContext, FunctionComponent, useContext } from "react";

export class SmartNavigator<
  Params extends Partial<Record<keyof Config, unknown>>,
  Config extends Record<
    string,
    {
      upperScreenName: string;
    }
  >
> {
  constructor(protected readonly config: Config) {}

  // Helper generic method to avoid bothering "require 2 generic" error on the constructor.
  withParams<
    Params extends Partial<Record<keyof Config, unknown>>
  >(): SmartNavigator<Params, Config> {
    return new SmartNavigator<Params, Config>(this.config);
  }

  navigateSmart<ScreenName extends keyof Config>(
    route: ReturnType<typeof useRoute>,
    navigation: ReturnType<typeof useNavigation>,
    screenName: ScreenName,
    params: Params[ScreenName] extends void ? undefined : Params[ScreenName]
  ): void {
    const currentScreenName = route.name as string;

    if (!(currentScreenName in this.config)) {
      throw new Error(
        `Can't get the current screen info: ${currentScreenName}`
      );
    }

    const currentScreen = this.config[currentScreenName];
    const targetScreen = this.config[screenName];

    if (currentScreen.upperScreenName === targetScreen.upperScreenName) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      navigation.navigate(screenName as string, params as object | undefined);
    } else {
      navigation.navigate(targetScreen.upperScreenName, {
        screen: screenName,
        params,
      });
    }
  }

  pushSmart<ScreenName extends keyof Config>(
    route: ReturnType<typeof useRoute>,
    navigation: ReturnType<typeof useNavigation>,
    screenName: ScreenName,
    params: Params[ScreenName] extends void ? undefined : Params[ScreenName]
  ): void {
    const currentScreenName = route.name as string;

    if (!(currentScreenName in this.config)) {
      throw new Error(
        `Can't get the current screen info: ${currentScreenName}`
      );
    }

    const currentScreen = this.config[currentScreenName];
    const targetScreen = this.config[screenName];

    if (currentScreen.upperScreenName === targetScreen.upperScreenName) {
      navigation.dispatch(
        // eslint-disable-next-line @typescript-eslint/ban-types
        StackActions.push(screenName as string, params as object | undefined)
      );
    } else {
      navigation.dispatch(
        StackActions.push(targetScreen.upperScreenName, {
          screen: screenName,
          params,
        })
      );
    }
  }

  replaceSmart<ScreenName extends keyof Config>(
    route: ReturnType<typeof useRoute>,
    navigation: ReturnType<typeof useNavigation>,
    screenName: ScreenName,
    params: Params[ScreenName] extends void ? undefined : Params[ScreenName]
  ): void {
    const currentScreenName = route.name as string;

    if (!(currentScreenName in this.config)) {
      throw new Error(
        `Can't get the current screen info: ${currentScreenName}`
      );
    }

    const currentScreen = this.config[currentScreenName];
    const targetScreen = this.config[screenName];

    if (currentScreen.upperScreenName === targetScreen.upperScreenName) {
      navigation.dispatch(
        // eslint-disable-next-line @typescript-eslint/ban-types
        StackActions.replace(screenName as string, params as object | undefined)
      );
    } else {
      navigation.dispatch(
        StackActions.replace(targetScreen.upperScreenName, {
          screen: screenName,
          params,
        })
      );
    }
  }
}

export const createSmartNavigatorProvider = <
  Params extends Partial<Record<keyof Config, unknown>>,
  Config extends Record<
    string,
    {
      upperScreenName: string;
    }
  >
>(
  navigator: SmartNavigator<Params, Config>
): {
  SmartNavigatorProvider: FunctionComponent;
  useSmartNavigation: () => ReturnType<typeof useNavigation> & {
    navigateSmart: <ScreenName extends keyof Config>(
      screenName: ScreenName,
      params: Params[ScreenName] extends void ? undefined : Params[ScreenName]
    ) => void;
    pushSmart: <ScreenName extends keyof Config>(
      screenName: ScreenName,
      params: Params[ScreenName] extends void ? undefined : Params[ScreenName]
    ) => void;
    replaceSmart: <ScreenName extends keyof Config>(
      screenName: ScreenName,
      params: Params[ScreenName] extends void ? undefined : Params[ScreenName]
    ) => void;
  };
} => {
  const context = createContext<SmartNavigator<Params, Config> | undefined>(
    undefined
  );

  return {
    // eslint-disable-next-line react/display-name
    SmartNavigatorProvider: ({ children }) => {
      return <context.Provider value={navigator}>{children}</context.Provider>;
    },
    useSmartNavigation: () => {
      const navigator = useContext(context);
      if (!navigator)
        throw new Error("You probably forgot to use SmartNavigationProvider");

      const nativeNavigation = useNavigation();
      const nativeRoute = useRoute();
      return {
        ...nativeNavigation,
        navigateSmart: <ScreenName extends keyof Config>(
          screenName: ScreenName,
          params: Params[ScreenName] extends void
            ? undefined
            : Params[ScreenName]
        ) => {
          navigator.navigateSmart(
            nativeRoute,
            nativeNavigation,
            screenName,
            params
          );
        },
        pushSmart: <ScreenName extends keyof Config>(
          screenName: ScreenName,
          params: Params[ScreenName] extends void
            ? undefined
            : Params[ScreenName]
        ) => {
          navigator.pushSmart(
            nativeRoute,
            nativeNavigation,
            screenName,
            params
          );
        },
        replaceSmart: <ScreenName extends keyof Config>(
          screenName: ScreenName,
          params: Params[ScreenName] extends void
            ? undefined
            : Params[ScreenName]
        ) => {
          navigator.replaceSmart(
            nativeRoute,
            nativeNavigation,
            screenName,
            params
          );
        },
      };
    },
  };
};
