import React, { FunctionComponent, useEffect, useState } from "react";
import { BIP44HDPath } from "@keplr-wallet/background";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { IconButton } from "components/new/button/icon";
import { InputCardView } from "components/new/card-view/input-card";
import { PageWithScrollView } from "components/page";
import { observer } from "mobx-react-lite";
import { Text, ViewStyle, View } from "react-native";
import { useStyle } from "styles/index";
import { EyeIcon } from "components/new/icon/eye";
import { Button } from "components/button";
import { Controller, useForm } from "react-hook-form";
import { useStore } from "stores/index";
import { useSmartNavigation } from "navigation/smart-navigation";
import { isPrivateKey, trimWordsStr } from "utils/format/format";
import { PasswordValidateView } from "components/new/password-validate/password-validate";
import { CheckIcon } from "components/new/icon/check";
import { XmarkIcon } from "components/new/icon/xmark";
import { HideEyeIcon } from "components/new/icon/hide-eye-icon";

interface FormData {
  mnemonic: string;
  name: string;
  password: string;
}

export const CreateAccountScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          mnemonic: string;
          bip44HDPath: BIP44HDPath;
          title: string;
        }
      >,
      string
    >
  >();

  const registerConfig = route.params.registerConfig;
  const bip44HDPath = route.params.bip44HDPath;
  const mnemonic = JSON.parse(decodeURIComponent(route.params.mnemonic));
  const title = route.params.title ? route.params.title : "Create your wallet";

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [mode] = useState(registerConfig.mode);
  const [isCreating, setIsCreating] = useState(false);

  const smartNavigation = useSmartNavigation();

  const style = useStyle();
  const { analyticsStore } = useStore();

  useEffect(() => {
    setValue("mnemonic", mnemonic, {
      shouldValidate: true,
    });
  }, [mnemonic]);

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const submit = handleSubmit(async () => {
    setIsCreating(true);

    const mnemonic = trimWordsStr(getValues("mnemonic"));

    if (!isPrivateKey(mnemonic)) {
      await registerConfig.createMnemonic(
        getValues("name").trim(),
        mnemonic,
        getValues("password"),
        bip44HDPath
      );
      analyticsStore.setUserProperties({
        registerType: "seed",
        accountType: "mnemonic",
      });
    } else {
      const privateKey = Buffer.from(mnemonic.trim().replace("0x", ""), "hex");
      await registerConfig.createPrivateKey(
        getValues("name"),
        privateKey,
        getValues("password")
      );
      analyticsStore.setUserProperties({
        registerType: "seed",
        accountType: "privateKey",
      });
    }

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
        {title}
      </Text>
      <Text style={style.flatten(["h6", "color-gray-200"]) as ViewStyle}>
        To keep your account safe, avoid any personal information or words
      </Text>
      <Controller
        control={control}
        rules={{
          required: "Name is required",
          validate: (value: string) => {
            if (value.trim().length < 3) {
              return "Name at least 3 characters";
            }
          },
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <InputCardView
              label="Account name"
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
              onChangeText={(text: string) => {
                text = text.replace(
                  /[`#$%^&*()+!\=\[\]{}'?*;:"\\|,.<>\/~]/,
                  ""
                );
                if (text[0] === " ") {
                  text = text.replace(/\s+/g, "");
                }
                text = text.replace(/ {1,}/g, " ");
                onChange(text);
              }}
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
        containerStyle={
          style.flatten([
            "margin-y-18",
            "background-color-white",
            "border-radius-32",
          ]) as ViewStyle
        }
        textStyle={{
          color: "#0B1742",
        }}
        text="Confirm"
        size="large"
        loading={isCreating}
        onPress={submit}
      />
    </PageWithScrollView>
  );
});
