import React, { FunctionComponent, useEffect, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useStyle } from "styles/index";
import { useSmartNavigation } from "navigation/smart-navigation";
import { Controller, useForm } from "react-hook-form";
import { PageWithScrollView } from "components/page";
import {
  Alert,
  AppState,
  AppStateStatus,
  Linking,
  PermissionsAndroid,
  PermissionStatus,
  Platform,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useStore } from "stores/index";
import { Button } from "components/button";
import { useBIP44Option } from "../bip44";
import { InputCardView } from "components/new/card-view/input-card";
import { IconButton } from "components/new/button/icon";
import { EyeIcon } from "components/new/icon/eye";
import { HideEyeIcon } from "components/new/icon/hide-eye-icon";
import { PasswordValidateView } from "components/new/password-validate/password-validate";
import { XmarkIcon } from "components/new/icon/xmark";
import { CheckIcon } from "components/new/icon/check";
import { bleManager } from "@ledgerhq/react-native-hw-transport-ble";
import { State } from "react-native-ble-plx";
import * as Location from "expo-location";
import { LocationAccuracy } from "expo-location";
import DeviceInfo from "react-native-device-info";
import { LedgerLocationErrorModel } from "modals/ledger/ledger-error";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

enum BLEPermissionGrantStatus {
  NotInit = "notInit",
  Failed = "failed",
  // When it failed but need to try again.
  // For example, when the bluetooth permission is turned off, but user allows the permission in the app setting page and return to the app.
  FailedAndRetry = "failed-and-retry",
  Granted = "granted",
}

export const NewLedgerScreen: FunctionComponent = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const { analyticsStore, ledgerInitStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option(118);
  const [mode] = useState(registerConfig.mode);

  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isBLEAvailable, setIsBLEAvailable] = useState(false);
  const [showBLEAlert, setBLEAlert] = useState(true);
  const [retryLocation, setRetryLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [location, setLocation] = useState<
    Location.LocationObject | undefined
  >();

  useEffect(() => {
    if (Platform.OS === "android" && location == undefined) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS["ACCESS_FINE_LOCATION"]
      ).then((result) => {
        if (result) {
          fetchCurrentLocation();
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS["ACCESS_FINE_LOCATION"]
          ).then((result: PermissionStatus) => {
            if (result === "never_ask_again") {
              showLocationSettingAlert();
            } else if (result === "granted") {
              fetchCurrentLocation();
            }
          });
        }
      });
    }
  }, [retryLocation]);

  function showLocationSettingAlert() {
    Alert.alert(
      "Location Permission",
      "This app requires location permission to connect to Ledger devices.",
      [
        {
          text: "Settings",
          onPress: () => {
            Linking.openSettings();
          },
        },
        {
          text: "Close",
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  }

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        const apiLevel = await DeviceInfo.getApiLevel();
        if (apiLevel < 12) {
          setPermissionStatus(BLEPermissionGrantStatus.Granted);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const bleManagerSubscription = bleManager.onStateChange((newState) => {
      /// Do not remove this log
      console.log("State", newState);

      if (newState === State.PoweredOn) {
        setIsBLEAvailable(true);
        setBLEAlert(true);
      } else if (newState === State.PoweredOff && showBLEAlert) {
        setBLEAlert(false);
        let title = "Bluetooth Device Connection";
        let message =
          "Bluetooth Low Energy permission is required to connect to Ledger devices.";
        let btnText = "Enable";
        if (Platform.OS === "ios") {
          title =
            "Bluetooth Low Energy permission is required to connect to Ledger devices.";
          message = "You can allow new connections in Settings.";
          btnText = "Settings";
        }

        Alert.alert(
          title,
          message,
          [
            {
              text: btnText,
              onPress: () => {
                Platform.OS === "ios"
                  ? Linking.openURL("App-Prefs:Bluetooth")
                  : bleManager.enable();
              },
            },
            {
              text: "Close",
              style: "cancel",
            },
          ],
          { cancelable: false }
        );
      }
    }, true);
    return () => {
      bleManagerSubscription.remove();
    };
  }, [showBLEAlert]);

  const [permissionStatus, setPermissionStatus] =
    useState<BLEPermissionGrantStatus>(() => {
      if (Platform.OS === "android") {
        // If android, there is need to request the permission.
        // You should ask for the permission on next effect.
        return BLEPermissionGrantStatus.NotInit;
      } else {
        // If not android, there is no need to request the permission
        return BLEPermissionGrantStatus.Granted;
      }
    });

  useEffect(() => {
    const listener = (state: AppStateStatus) => {
      if (
        state === "active" &&
        permissionStatus === BLEPermissionGrantStatus.Failed
      ) {
        // When the app becomes active, the user may have granted permission on the setting page, so request the grant again.
        setPermissionStatus(BLEPermissionGrantStatus.FailedAndRetry);
      }
    };
    const callback = AppState.addEventListener("change", listener);

    return () => {
      callback.remove();
    };
  }, [permissionStatus]);

  useEffect(() => {
    // It is processed only in case of not init at first or re-request after failure.
    if (
      permissionStatus === BLEPermissionGrantStatus.NotInit ||
      permissionStatus === BLEPermissionGrantStatus.FailedAndRetry
    ) {
      checkAndRequestBluetoothPermission();
    }
  }, [permissionStatus]);

  const checkAndRequestBluetoothPermission = () => {
    if (Platform.OS === "android") {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS["BLUETOOTH_CONNECT"],
        PermissionsAndroid.PERMISSIONS["BLUETOOTH_SCAN"],
      ]).then((result) => {
        if (
          result["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS["GRANTED"]
        ) {
          setPermissionStatus(BLEPermissionGrantStatus.Granted);
        } else {
          setPermissionStatus(BLEPermissionGrantStatus.Failed);
        }
      });
    }
  };

  const fetchCurrentLocation = () => {
    Location.getCurrentPositionAsync({
      accuracy: LocationAccuracy.Highest,
    }).then((location) => {
      setLocation(location);
      setLocationError(undefined);
    });
  };

  const submit = handleSubmit(async () => {
    if (Platform.OS === "android" && location == undefined) {
      setLocationError("Location services are disabled");
      return;
    }
    setIsCreating(true);

    try {
      await registerConfig.createLedger(
        getValues("name"),
        getValues("password"),
        bip44Option.bip44HDPath,
        "Cosmos"
      );
      analyticsStore.setUserProperties({
        registerType: "ledger",
        accountType: "ledger",
      });

      smartNavigation.reset({
        index: 0,
        routes: [
          {
            name: "Register.End",
            params: {
              password: getValues("password"),
            },
          },
        ],
      });
    } catch (e) {
      ledgerInitStore.abortAll();
      // Definitely, the error can be thrown when the ledger connection failed
      console.log(e);
      setIsCreating(false);
    }
  });

  const checkPasswordValidity = (value: string) => {
    const error = [];

    const isContainsUppercase = /^(?=.*[A-Z]).*$/;
    if (!isContainsUppercase.test(value)) {
      error.push("uppercase");
    }

    const isContainsLowercase = /^(?=.*[a-z]).*$/;
    if (!isContainsLowercase.test(value)) {
      error.push("lowercase");
    }

    const isContainsSymbol =
      /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
    if (!isContainsSymbol.test(value)) {
      error.push("special character");
    }

    if (value.length < 8) {
      error.push("At least 8 characters");
    }
    return error;
  };

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <Text
        style={
          style.flatten([
            "h1",
            "color-white",
            "margin-y-10",
            "font-medium",
          ]) as ViewStyle
        }
      >
        Connect hardware wallet
      </Text>
      <Text style={style.flatten(["h6", "color-gray-200"]) as ViewStyle}>
        To keep your account safe, avoid any personal information or words
      </Text>
      <Controller
        control={control}
        rules={{
          required: "Name is required",
          validate: (value: string) => {
            if (value.length < 3) {
              return "Name at least 3 characters";
            }
          },
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <InputCardView
              label="Wallet nickname"
              containerStyle={
                style.flatten(["margin-bottom-4", "margin-top-18"]) as ViewStyle
              }
              returnKeyType={mode === "add" ? "done" : "next"}
              onSubmitEditing={() => {
                if (mode === "add") {
                  submit();
                }
                if (mode === "create") {
                  setFocus("password");
                }
              }}
              error={errors.name?.message}
              onBlur={() => {
                onBlur();
                onChange(value.trim());
              }}
              onChangeText={(text: string) =>
                onChange(
                  text.replace(/[`#$%^&*()+!\=\[\]{}'?*;:"\\|,.<>\/~]/, "")
                )
              }
              value={value}
              maxLength={30}
              refs={ref}
            />
          );
        }}
        name="name"
        defaultValue=""
      />
      {mode === "create" ? (
        <React.Fragment>
          <Controller
            control={control}
            rules={{
              required: "Password is required",
              validate: (value: string) => {
                if (checkPasswordValidity(value).toString()) {
                  return checkPasswordValidity(value).toString();
                }
              },
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              setPassword(value);

              return (
                <InputCardView
                  label="Password"
                  keyboardType={"default"}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    submit();
                  }}
                  error={errors.password?.message}
                  errorMassageShow={false}
                  onBlur={onBlur}
                  onChangeText={(text: string) => onChange(text.trim())}
                  value={value}
                  refs={ref}
                  rightIcon={
                    !showPassword ? (
                      <IconButton
                        icon={<EyeIcon />}
                        backgroundBlur={false}
                        onPress={() => {
                          setShowPassword(!showPassword);
                        }}
                      />
                    ) : (
                      <IconButton
                        icon={<HideEyeIcon />}
                        backgroundBlur={false}
                        onPress={() => {
                          setShowPassword(!showPassword);
                        }}
                      />
                    )
                  }
                />
              );
            }}
            name="password"
            defaultValue=""
          />
          <View style={style.flatten(["margin-y-18"]) as ViewStyle}>
            {password ? (
              <React.Fragment>
                <PasswordValidateView
                  text="At least 8 characters"
                  icon={
                    checkPasswordValidity(password).includes(
                      "At least 8 characters"
                    ) ? (
                      <XmarkIcon size={6} color="black" />
                    ) : (
                      <CheckIcon size={6} color="black" />
                    )
                  }
                  iconStyle={
                    style.flatten(
                      ["padding-4"],
                      [
                        checkPasswordValidity(password).includes(
                          "At least 8 characters"
                        )
                          ? "background-color-red-400"
                          : "background-color-green-400",
                      ]
                    ) as ViewStyle
                  }
                />
                <PasswordValidateView
                  text="Minumum 1 special character"
                  icon={
                    checkPasswordValidity(password).includes(
                      "special character"
                    ) ? (
                      <XmarkIcon size={6} color="black" />
                    ) : (
                      <CheckIcon size={6} color="black" />
                    )
                  }
                  iconStyle={
                    style.flatten(
                      ["padding-4"],
                      [
                        checkPasswordValidity(password).includes(
                          "special character"
                        )
                          ? "background-color-red-400"
                          : "background-color-green-400",
                      ]
                    ) as ViewStyle
                  }
                />
                <PasswordValidateView
                  text="Minumum 1 lowercase character"
                  icon={
                    checkPasswordValidity(password).includes("lowercase") ? (
                      <XmarkIcon size={6} color="black" />
                    ) : (
                      <CheckIcon size={6} color="black" />
                    )
                  }
                  iconStyle={
                    style.flatten(
                      ["padding-4"],
                      [
                        checkPasswordValidity(password).includes("lowercase")
                          ? "background-color-red-400"
                          : "background-color-green-400",
                      ]
                    ) as ViewStyle
                  }
                />
                <PasswordValidateView
                  text="Minumum 1 uppercase character"
                  icon={
                    checkPasswordValidity(password).includes("uppercase") ? (
                      <XmarkIcon size={6} color="black" />
                    ) : (
                      <CheckIcon size={6} color="black" />
                    )
                  }
                  iconStyle={
                    style.flatten(
                      ["padding-4"],
                      [
                        checkPasswordValidity(password).includes("uppercase")
                          ? "background-color-red-400"
                          : "background-color-green-400",
                      ]
                    ) as ViewStyle
                  }
                />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <PasswordValidateView text="At least 8 characters" />
                <PasswordValidateView text="Minumum 1 special character" />
                <PasswordValidateView text="Minumum 1 lowercase character" />
                <PasswordValidateView text="Minumum 1 uppercase character" />
              </React.Fragment>
            )}
          </View>
        </React.Fragment>
      ) : null}
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Continue"
        size="large"
        disabled={!isBLEAvailable}
        loading={isCreating}
        onPress={submit}
        containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
      />
      {
        <LedgerLocationErrorModel
          isOpen={!!locationError}
          close={() => {
            setLocationError(undefined);
          }}
          error={locationError ? locationError : ""}
          retry={() => {
            setRetryLocation(true);
          }}
        />
      }
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
};
