import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useStyle } from "../../../styles";
import { useSmartNavigation } from "../../../navigation";
import { Controller, useForm } from "react-hook-form";
import { PageWithScrollView } from "../../../components/page";
import { TextInput } from "../../../components/input";
import { View } from "react-native";
import { Button } from "../../../components/button";
import * as WebBrowser from "expo-web-browser";
import { Buffer } from "buffer/";
import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { useStore } from "../../../stores";
import { useLoadingScreen } from "../../../providers/loading-screen";
import * as AppleAuthentication from "expo-apple-authentication";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

const useTorusGoogleSignIn = (): {
  privateKey: Uint8Array | undefined;
  email: string | undefined;
} => {
  const [privateKey, setPrivateKey] = useState<Uint8Array | undefined>();
  const [email, setEmail] = useState<string | undefined>();

  const loadingScreen = useLoadingScreen();
  const naviagtion = useNavigation();

  useEffect(() => {
    loadingScreen.setIsLoading(true);

    (async () => {
      try {
        const nonce: string = Math.floor(Math.random() * 10000).toString();
        const state = encodeURIComponent(
          Buffer.from(
            JSON.stringify({
              instanceId: nonce,
              redirectToOpener: false,
            })
          ).toString("base64")
        );

        const finalUrl = new URL(
          "https://accounts.google.com/o/oauth2/v2/auth"
        );
        finalUrl.searchParams.append("response_type", "token id_token");
        finalUrl.searchParams.append(
          "client_id",
          "413984222848-8r7u4ip9i6htppalo6jopu5qbktto6mi.apps.googleusercontent.com"
        );
        finalUrl.searchParams.append("state", state);
        finalUrl.searchParams.append("scope", "profile email openid");
        finalUrl.searchParams.append("nonce", nonce);
        finalUrl.searchParams.append("prompt", "consent select_account");
        finalUrl.searchParams.append(
          "redirect_uri",
          "https://oauth.keplr.app/google.html"
        );

        const result = await WebBrowser.openAuthSessionAsync(
          finalUrl.href,
          "app.keplr.oauth://"
        );
        if (result.type !== "success") {
          throw new Error("Failed to get the oauth");
        }

        if (!result.url.startsWith("app.keplr.oauth://google#")) {
          throw new Error("Invalid redirection");
        }

        const redirectedUrl = new URL(result.url);
        const paramsString = redirectedUrl.hash;
        const searchParams = new URLSearchParams(
          paramsString.startsWith("#") ? paramsString.slice(1) : paramsString
        );
        if (state !== searchParams.get("state")) {
          throw new Error("State doesn't match");
        }
        const idToken = searchParams.get("id_token");
        const accessToken = searchParams.get("access_token");

        const userResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken || idToken}`,
            },
          }
        );

        if (userResponse.ok) {
          const userInfo: {
            picture: string;
            email: string;
            name: string;
          } = await userResponse.json();

          const { email } = userInfo;

          const nodeDetailManager = new NodeDetailManager({
            network: "mainnet",
            proxyAddress: "0x638646503746d5456209e33a2ff5e3226d698bea",
          });
          const {
            torusNodeEndpoints,
            torusNodePub,
            torusIndexes,
          } = await nodeDetailManager.getNodeDetails();

          const torus = new Torus({
            enableLogging: __DEV__,
            metadataHost: "https://metadata.tor.us",
            allowHost: "https://signer.tor.us/api/allow",
          });

          const response = await torus.getPublicAddress(
            torusNodeEndpoints,
            torusNodePub,
            {
              verifier: "chainapsis-google",
              verifierId: email.toLowerCase(),
            },
            true
          );
          const data = await torus.retrieveShares(
            torusNodeEndpoints,
            torusIndexes,
            "chainapsis-google",
            {
              verifier_id: email.toLowerCase(),
            },
            (idToken || accessToken) as string
          );
          if (typeof response === "string")
            throw new Error("must use extended pub key");
          if (
            data.ethAddress.toLowerCase() !== response.address.toLowerCase()
          ) {
            throw new Error("data ethAddress does not match response address");
          }

          setPrivateKey(Buffer.from(data.privKey.toString(), "hex"));
          setEmail(email);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (e) {
        console.log(e);
        naviagtion.goBack();
      } finally {
        loadingScreen.setIsLoading(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    privateKey,
    email,
  };
};

// CONTRACT: Only supported on IOS
const useTorusAppleSignIn = (): {
  privateKey: Uint8Array | undefined;
  email: string | undefined;
} => {
  const [privateKey, setPrivateKey] = useState<Uint8Array | undefined>();
  const [email, setEmail] = useState<string | undefined>();

  const loadingScreen = useLoadingScreen();
  const naviagtion = useNavigation();

  useEffect(() => {
    loadingScreen.setIsLoading(true);

    (async () => {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
        });

        if (!credential.identityToken) {
          throw new Error("Token is not provided");
        }

        const identityTokenSplit = credential.identityToken.split(".");
        if (identityTokenSplit.length !== 3) {
          throw new Error("Invalid token");
        }

        const payload = JSON.parse(
          Buffer.from(identityTokenSplit[1], "base64").toString()
        );

        const email = payload.email as string | undefined;
        if (!email) {
          throw new Error("Email is not provided");
        }
        const sub = payload.sub as string | undefined;
        if (!sub) {
          throw new Error("Subject is not provided");
        }

        const nodeDetailManager = new NodeDetailManager({
          network: "mainnet",
          proxyAddress: "0x638646503746d5456209e33a2ff5e3226d698bea",
        });
        const {
          torusNodeEndpoints,
          torusNodePub,
          torusIndexes,
        } = await nodeDetailManager.getNodeDetails();

        const torus = new Torus({
          enableLogging: __DEV__,
          metadataHost: "https://metadata.tor.us",
          allowHost: "https://signer.tor.us/api/allow",
        });

        const response = await torus.getPublicAddress(
          torusNodeEndpoints,
          torusNodePub,
          {
            verifier: "chainapsis-apple",
            verifierId: sub,
          },
          true
        );
        const data = await torus.retrieveShares(
          torusNodeEndpoints,
          torusIndexes,
          "chainapsis-apple",
          {
            verifier_id: sub,
          },
          credential.identityToken
        );
        if (typeof response === "string")
          throw new Error("must use extended pub key");
        if (data.ethAddress.toLowerCase() !== response.address.toLowerCase()) {
          throw new Error("data ethAddress does not match response address");
        }

        setPrivateKey(Buffer.from(data.privKey.toString(), "hex"));
        setEmail(email);
      } catch (e) {
        console.log(e);
        naviagtion.goBack();
      } finally {
        loadingScreen.setIsLoading(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    privateKey,
    email,
  };
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
  const { privateKey, email } =
    route.params.type === "apple"
      ? useTorusAppleSignIn()
      : useTorusGoogleSignIn();

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
      analyticsStore.setUserId();
      analyticsStore.setUserProperties({
        registerType: "google",
      });
      analyticsStore.logEvent("OAuth sign in finished", {
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
    }
  });

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
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
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
