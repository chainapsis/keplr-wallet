import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useStyle } from "../../../styles";
import { useSmartNavigation } from "../../../navigation";
import { Controller, useForm } from "react-hook-form";
import { PageWithScrollView } from "../../../components/page";
import { TextInput } from "../../../components/input";
import { View, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import Web3Auth, {
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from "@web3auth/react-native-sdk";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import Constants, { AppOwnership } from "expo-constants";
import * as Linking from "expo-linking";
import { Buffer } from "buffer/";
import { useLoadingScreen } from "../../../providers/loading-screen";
import { useStore } from "../../../stores";
import { LOGIN_PROVIDER_TYPE } from "@toruslabs/openlogin-utils/dist/types/interfaces";
import { AuthApiKey } from "../../../config"; // for using ethers.js

const isEnvDevelopment = process.env["NODE_ENV"] !== "production";
const scheme = "fetchwallet";
const resolvedRedirectUrl =
  Constants.appOwnership === AppOwnership.Expo ||
  Constants.appOwnership === AppOwnership.Guest
    ? Linking.createURL("web3auth", {})
    : Linking.createURL("web3auth", { scheme });

const web3auth = new Web3Auth(WebBrowser, SecureStore, {
  clientId: AuthApiKey,
  network: isEnvDevelopment
    ? OPENLOGIN_NETWORK.TESTNET
    : OPENLOGIN_NETWORK.CYAN,
  useCoreKitKey: false,
});
interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

// CONTRACT: Only supported on IOS
const useWeb3AuthSignIn = (
  type: LOGIN_PROVIDER_TYPE
): {
  privateKey: Uint8Array | undefined;
  email: string | undefined;
} => {
  const [privateKey, setPrivateKey] = useState<Uint8Array | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const loadingScreen = useLoadingScreen();
  const navigation = useNavigation();

  const login = async () => {
    try {
      loadingScreen.setIsLoading(true);
      if (!web3auth) {
        console.log("Web3auth not initialized");
        return;
      }

      console.log("Logging in");
      await web3auth.login({
        loginProvider: type,
        redirectUrl: resolvedRedirectUrl,
        mfaLevel: "default",
        curve: "secp256k1",
      });
      console.log(`Logged in ${web3auth.privKey}`);
      if (web3auth.privKey) {
        setEmail(web3auth.userInfo()?.email);
        setPrivateKey(Buffer.from(web3auth.privKey, "hex"));
      }
    } catch (e: any) {
      console.log(e.message);
      navigation.goBack();
    } finally {
      loadingScreen.setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await web3auth.init();
      if (web3auth?.privKey) {
        setEmail(web3auth.userInfo()?.email);
        setPrivateKey(Buffer.from(web3auth.privKey, "hex"));
      } else {
        await login();
      }
    };
    init();
  }, []);

  return {
    privateKey,
    email,
  };
};

const logoutWeb3Auth = async () => {
  if (!web3auth) {
    console.log("Web3auth not initialized");
    return;
  }

  console.log("Logging out");
  await web3auth.logout();
};

export const TorusSignInScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          type: "google" | "apple";
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const { analyticsStore } = useStore();

  const smartNavigation = useSmartNavigation();

  useEffect(() => {
    smartNavigation.setOptions({
      title:
        route.params.type === "apple"
          ? "Sign in with Apple"
          : "Sign in with Google",
    });
  }, [route.params.type, smartNavigation]);

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const [mode] = useState(registerConfig.mode);

  // Below uses the hook conditionally.
  // This is a silly way, but `route.params.type` never changed in the logic.
  const { privateKey, email } = useWeb3AuthSignIn(
    route.params.type === "apple" ? LOGIN_PROVIDER.APPLE : LOGIN_PROVIDER.GOOGLE
  );
  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);

  const submit = handleSubmit(async () => {
    if (!privateKey || !email) {
      return;
    }

    setIsCreating(true);

    try {
      await registerConfig.createPrivateKey(
        getValues("name"),
        privateKey,
        getValues("password"),
        { email, socialType: route.params.type }
      );
      analyticsStore.setUserProperties({
        registerType: route.params.type,
        accountType: "privateKey",
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
      console.log(e);
      setIsCreating(false);
    } finally {
      await logoutWeb3Auth();
    }
  });

  return (
    <PageWithScrollView
      backgroundMode="tertiary"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <Controller
        control={control}
        rules={{
          required: "Name is required",
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Wallet nickname"
              returnKeyType={mode === "add" ? "done" : "next"}
              onSubmitEditing={() => {
                if (mode === "add") {
                  submit();
                }
                if (mode === "create") {
                  setFocus("password");
                }
              }}
              maxLength={30}
              error={errors.name?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
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
                if (value.length < 8) {
                  return "Password must be longer than 8 characters";
                }
              },
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  label="Password"
                  returnKeyType="next"
                  secureTextEntry={true}
                  onSubmitEditing={() => {
                    setFocus("confirmPassword");
                  }}
                  error={errors.password?.message}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  ref={ref}
                />
              );
            }}
            name="password"
            defaultValue=""
          />
          <Controller
            control={control}
            rules={{
              required: "Confirm password is required",
              validate: (value: string) => {
                if (value.length < 8) {
                  return "Password must be longer than 8 characters";
                }

                if (getValues("password") !== value) {
                  return "Password doesn't match";
                }
              },
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  label="Confirm password"
                  returnKeyType="done"
                  secureTextEntry={true}
                  onSubmitEditing={() => {
                    submit();
                  }}
                  error={errors.confirmPassword?.message}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  ref={ref}
                />
              );
            }}
            name="confirmPassword"
            defaultValue=""
          />
        </React.Fragment>
      ) : null}
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Next"
        size="large"
        loading={isCreating}
        onPress={submit}
        disabled={!privateKey || !email}
      />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});
