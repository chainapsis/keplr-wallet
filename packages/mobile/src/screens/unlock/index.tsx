import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dimensions, Image, StatusBar, StyleSheet, View } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../styles";
import * as SplashScreen from "expo-splash-screen";
import { TextInput } from "../../components/input";
import { Button } from "../../components/button";
import delay from "delay";
import { useStore } from "../../stores";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StackActions, useNavigation } from "@react-navigation/native";
import { KeyRingStatus } from "@keplr-wallet/background";
import { KeychainStore } from "../../stores/keychain";
import { AccountStore } from "@keplr-wallet/stores";
import { autorun } from "mobx";

let splashScreenHided = false;
async function hideSplashScreen() {
  if (!splashScreenHided) {
    console.log("Hide Splash screen");
    if (await SplashScreen.hideAsync()) {
      splashScreenHided = true;
    }
  }
}

async function waitAccountLoad(
  accountStore: AccountStore<any, any, any, any>,
  chainId: string
): Promise<void> {
  if (accountStore.getAccount(chainId).bech32Address) {
    return;
  }

  return new Promise((resolve) => {
    const disposer = autorun(() => {
      if (accountStore.getAccount(chainId).bech32Address) {
        resolve();
        if (disposer) {
          disposer();
        }
      }
    });
  });
}

/*
 If the biomeric is on, just try to unlock by biometric automatically once.
 */
enum AutoBiomtricStatus {
  NO_NEED,
  NEED,
  FAILED,
  SUCCESS,
}

const useAutoBiomtric = (keychainStore: KeychainStore, tryEnabled: boolean) => {
  const [status, setStatus] = useState(AutoBiomtricStatus.NO_NEED);
  const tryBiometricAutoOnce = useRef(false);

  useEffect(() => {
    if (keychainStore.isBiometryOn && status === AutoBiomtricStatus.NO_NEED) {
      setStatus(AutoBiomtricStatus.NEED);
    }
  }, [keychainStore.isBiometryOn, status]);

  useEffect(() => {
    if (
      !tryBiometricAutoOnce.current &&
      status === AutoBiomtricStatus.NEED &&
      tryEnabled
    ) {
      tryBiometricAutoOnce.current = true;
      (async () => {
        try {
          await keychainStore.tryUnlockWithBiometry();
          setStatus(AutoBiomtricStatus.SUCCESS);
        } catch (e) {
          console.log(e);
          setStatus(AutoBiomtricStatus.FAILED);
        }
      })();
    }
  }, [keychainStore, status, tryEnabled]);

  return status;
};

/**
 * UnlockScreen is expected to be opened when the keyring store's state is "not loaded (yet)" or "locked" at launch.
 * And, this screen has continuity with the splash screen
 * @constructor
 */
export const UnlockScreen: FunctionComponent = observer(() => {
  const {
    keyRingStore,
    keychainStore,
    accountStore,
    chainStore,
    analyticsStore,
  } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  const [isSplashEnd, setIsSplashEnd] = useState(false);

  const [animatedContinuityEffectOpacity] = useState(
    () => new Animated.Value(1)
  );

  const navigateToHomeOnce = useRef(false);
  const navigateToHome = useCallback(async () => {
    if (!navigateToHomeOnce.current) {
      // Wait the account of selected chain is loaded.
      await waitAccountLoad(accountStore, chainStore.current.chainId);
      navigation.dispatch(StackActions.replace("MainTabDrawer"));
    }
    navigateToHomeOnce.current = true;
  }, [accountStore, chainStore, navigation]);

  const autoBiometryStatus = useAutoBiomtric(
    keychainStore,
    keyRingStore.status === KeyRingStatus.LOCKED && isSplashEnd
  );

  useEffect(() => {
    if (isSplashEnd && autoBiometryStatus === AutoBiomtricStatus.SUCCESS) {
      (async () => {
        await hideSplashScreen();

        analyticsStore.logEvent("Account unlocked", {
          authType: "biometrics",
        });
      })();
    }
  }, [analyticsStore, autoBiometryStatus, isSplashEnd, navigation]);

  useEffect(() => {
    if (
      isSplashEnd &&
      keyRingStore.status === KeyRingStatus.LOCKED &&
      (autoBiometryStatus === AutoBiomtricStatus.NO_NEED ||
        autoBiometryStatus === AutoBiomtricStatus.FAILED)
    ) {
      setTimeout(() => {
        Animated.timing(animatedContinuityEffectOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.ease,
        }).start();
      }, 700);
    }
  }, [
    animatedContinuityEffectOpacity,
    autoBiometryStatus,
    isSplashEnd,
    keyRingStore.status,
  ]);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const tryBiometric = useCallback(async () => {
    try {
      setIsBiometricLoading(true);
      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
      // So to make sure that the loading state changes, just wait very short time.
      await delay(10);
      await keychainStore.tryUnlockWithBiometry();

      await hideSplashScreen();

      analyticsStore.logEvent("Account unlocked", {
        authType: "biometrics",
      });
    } catch (e) {
      console.log(e);
      setIsBiometricLoading(false);
    }
  }, [analyticsStore, keychainStore]);

  const tryUnlock = async () => {
    try {
      setIsLoading(true);
      // Decryption needs slightly huge computation.
      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
      // before the actually decryption is complete.
      // So to make sure that the loading state changes, just wait very short time.
      await delay(10);
      await keyRingStore.unlock(password);

      await hideSplashScreen();

      analyticsStore.logEvent("Account unlocked", {
        authType: "password",
      });
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setIsFailed(true);
    }
  };

  const routeToRegisterOnce = useRef(false);
  useEffect(() => {
    // If the keyring is empty,
    // route to the register screen.
    if (
      !routeToRegisterOnce.current &&
      isSplashEnd &&
      keyRingStore.status === KeyRingStatus.EMPTY
    ) {
      (async () => {
        await hideSplashScreen();
        routeToRegisterOnce.current = true;
        navigation.dispatch(
          StackActions.replace("Register", {
            screen: "Register.Intro",
          })
        );
      })();
    }
  }, [isSplashEnd, keyRingStore.status, navigation]);

  useEffect(() => {
    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      (async () => {
        await hideSplashScreen();
        navigateToHome();
      })();
    }
  }, [keyRingStore.status, navigateToHome]);

  return (
    <React.Fragment>
      <View
        style={style.flatten([
          "absolute-fill",
          "background-color-splash-background",
        ])}
      />
      <View
        style={style.flatten(["flex-1", "background-color-splash-background"])}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={style.flatten(["flex-grow-1"])}
        >
          <View style={style.get("flex-5")} />
          <Image
            style={StyleSheet.flatten([style.flatten(["width-full"])])}
            fadeDuration={0}
            resizeMode="contain"
            source={require("../../assets/logo/splash-image.png")}
          />
          <View style={style.get("flex-3")} />
          <View style={style.flatten(["padding-x-page"])}>
            <TextInput
              containerStyle={style.flatten(["padding-bottom-40"])}
              label="Password"
              returnKeyType="done"
              secureTextEntry={true}
              value={password}
              error={isFailed ? "Invalid password" : undefined}
              onChangeText={setPassword}
              onSubmitEditing={tryUnlock}
            />
            <Button
              text="Sign in"
              size="large"
              loading={isLoading}
              onPress={tryUnlock}
            />
            {keychainStore.isBiometryOn ? (
              <Button
                containerStyle={style.flatten(["margin-top-40"])}
                text="Use Biometric Authentication"
                mode="text"
                loading={isBiometricLoading}
                onPress={tryBiometric}
              />
            ) : null}
          </View>
          <View style={style.get("flex-7")} />
        </KeyboardAwareScrollView>
      </View>
      <Animated.View
        style={StyleSheet.flatten([
          style.flatten(["absolute-fill"]),
          {
            opacity: animatedContinuityEffectOpacity,
          },
        ])}
        pointerEvents={isSplashEnd ? "none" : "auto"}
      >
        <SplashContinuityEffectView
          onAnimationEnd={() => {
            setIsSplashEnd(true);
          }}
        />
      </Animated.View>
    </React.Fragment>
  );
});

const useAnimationState = () => {
  return useState(() => {
    return {
      finished: new Animated.Value<number>(0),
      position: new Animated.Value<number>(0),
      time: new Animated.Value<number>(0),
      frameTime: new Animated.Value<number>(0),
    };
  })[0];
};

export const SplashContinuityEffectView: FunctionComponent<{
  onAnimationEnd: () => void;
}> = ({ onAnimationEnd }) => {
  const style = useStyle();

  const onAnimationEndRef = useRef(onAnimationEnd);
  onAnimationEndRef.current = onAnimationEnd;

  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [logoSize, setLogoSize] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >();

  const [animation] = useState(() => {
    return {
      isStarted: new Animated.Value<number>(0),
      backgroundClock: new Animated.Clock(),
      backgroundClippingClock: new Animated.Clock(),

      backgroundDone: new Animated.Value(0),
      backgroundClippingDone: new Animated.Value(0),
    };
  });

  const backgroundClippingWidth = useAnimationState();
  const backgroundClippingHeight = useAnimationState();
  const backgroundClippingRadius = useAnimationState();

  const backgroundDelay = useAnimationState();
  const backgroundWidth = useAnimationState();
  const backgroundHeight = useAnimationState();

  useEffect(() => {
    if (isBackgroundLoaded && logoSize) {
      (async () => {
        await hideSplashScreen();

        animation.isStarted.setValue(1);
      })();
    }
  }, [animation.isStarted, isBackgroundLoaded, logoSize]);

  const backgroundClippingAnimationDuration = 700;
  const backgroundAnimationDuration = 900;
  const backgroundAnimationDelay = 300;

  const expectedLogoSize = logoSize
    ? logoSize.height * (Dimensions.get("window").width / logoSize.width)
    : 0;

  const expectedBorderRadius = expectedLogoSize / 4.45;

  Animated.useCode(() => {
    return [
      Animated.cond(
        Animated.and(
          Animated.greaterThan(animation.isStarted, 0),
          Animated.eq(animation.backgroundClippingDone, 0)
        ),
        [
          Animated.cond(
            Animated.not(
              Animated.clockRunning(animation.backgroundClippingClock)
            ),
            [Animated.startClock(animation.backgroundClippingClock)],
            [
              Animated.timing(
                animation.backgroundClippingClock,
                backgroundClippingWidth,
                {
                  duration: backgroundClippingAnimationDuration,
                  easing: Easing.out(Easing.cubic),
                  toValue: 1,
                }
              ),
              Animated.timing(
                animation.backgroundClippingClock,
                backgroundClippingHeight,
                {
                  duration: backgroundClippingAnimationDuration,
                  easing: Easing.out(Easing.cubic),
                  toValue: 1,
                }
              ),
              Animated.timing(
                animation.backgroundClippingClock,
                backgroundClippingRadius,
                {
                  duration: backgroundClippingAnimationDuration,
                  easing: Easing.out(Easing.cubic),
                  toValue: 1,
                }
              ),
              Animated.cond(
                Animated.and(
                  backgroundClippingWidth.finished,
                  backgroundClippingHeight.finished,
                  backgroundClippingRadius.finished
                ),
                [
                  Animated.set(animation.backgroundClippingDone, 1),
                  Animated.debug(
                    "Background clipping animation is done",
                    Animated.stopClock(animation.backgroundClippingClock)
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ];
  }, [
    animation.backgroundClippingClock,
    animation.backgroundClippingDone,
    animation.isStarted,
    backgroundClippingHeight,
    backgroundClippingRadius,
    backgroundClippingWidth,
  ]);

  Animated.useCode(() => {
    return [
      Animated.cond(
        Animated.and(
          Animated.greaterThan(animation.isStarted, 0),
          Animated.eq(animation.backgroundDone, 0)
        ),
        [
          Animated.cond(
            Animated.not(Animated.clockRunning(animation.backgroundClock)),
            [Animated.startClock(animation.backgroundClock)],
            [
              Animated.cond(
                backgroundDelay.finished,
                [
                  Animated.timing(animation.backgroundClock, backgroundWidth, {
                    duration: backgroundAnimationDuration,
                    easing: Easing.out(Easing.quad),
                    toValue: 1,
                  }),
                  Animated.timing(animation.backgroundClock, backgroundHeight, {
                    duration: backgroundAnimationDuration,
                    easing: Easing.out(Easing.quad),
                    toValue: 1,
                  }),
                  Animated.cond(
                    Animated.and(
                      backgroundWidth.finished,
                      backgroundHeight.finished
                    ),
                    [
                      Animated.set(animation.backgroundDone, 1),
                      Animated.debug(
                        "Background animation is done",
                        Animated.stopClock(animation.backgroundClock)
                      ),
                      Animated.call([], () => {
                        onAnimationEndRef.current();
                      }),
                    ]
                  ),
                ],
                [
                  // `backgroundDelay` is actually not used for animation,
                  // it is for the delay.
                  Animated.timing(animation.backgroundClock, backgroundDelay, {
                    duration: backgroundAnimationDelay,
                    easing: Easing.ease,
                    toValue: 1,
                  }),
                  Animated.cond(backgroundDelay.finished, [
                    Animated.debug(
                      "Delay for background animation is reached",
                      backgroundDelay.finished
                    ),
                  ]),
                ]
              ),
            ]
          ),
        ]
      ),
    ];
  }, [
    animation.isStarted,
    animation.backgroundDone,
    animation.backgroundClock,
    backgroundDelay,
    backgroundWidth,
    backgroundHeight,
  ]);

  return (
    <React.Fragment>
      <View
        style={style.flatten([
          "absolute-fill",
          "background-color-splash-background",
        ])}
      />
      <View
        style={style.flatten([
          "absolute-fill",
          "items-center",
          "justify-center",
        ])}
      >
        <Animated.View
          style={StyleSheet.flatten([
            style.flatten([
              "width-full",
              "height-full",
              "overflow-hidden",
              "items-center",
              "justify-center",
            ]),
            {
              width: backgroundClippingWidth.position.interpolate({
                inputRange: [0, 1],
                outputRange: [Dimensions.get("window").width, expectedLogoSize],
              }),
              height: backgroundClippingHeight.position.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  Dimensions.get("window").height +
                    (StatusBar.currentHeight ?? 0),
                  expectedLogoSize,
                ],
              }),
              borderRadius: backgroundClippingRadius.position.interpolate({
                inputRange: [0, 1],
                outputRange: [0, expectedBorderRadius],
              }),
            },
          ])}
        >
          <Animated.Image
            style={StyleSheet.flatten([
              style.flatten(["width-full", "height-full"]),
              {
                width: backgroundWidth.position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    Dimensions.get("window").width,
                    expectedLogoSize,
                  ],
                }),
                height: backgroundHeight.position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    Dimensions.get("window").height +
                      (StatusBar.currentHeight ?? 0),
                    expectedLogoSize,
                  ],
                }),
              },
            ])}
            source={require("../../assets/logo/splash-screen-only-background.png")}
            resizeMode="stretch"
            fadeDuration={0}
            onLoadEnd={() => {
              setIsBackgroundLoaded(true);
            }}
          />
        </Animated.View>
      </View>
      <View
        style={style.flatten([
          "absolute-fill",
          "items-center",
          "justify-center",
        ])}
      >
        <Image
          style={style.flatten(["width-full", "height-full"])}
          source={require("../../assets/logo/splash-screen-only-k.png")}
          resizeMode="contain"
          fadeDuration={0}
          onLoad={(e) => {
            setLogoSize(e.nativeEvent.source);
          }}
        />
      </View>
    </React.Fragment>
  );
};
