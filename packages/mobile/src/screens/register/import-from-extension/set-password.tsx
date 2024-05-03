import React, { FunctionComponent, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PageWithScrollView } from "components/page";
import { View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { Button } from "components/button";
import { useSmartNavigation } from "navigation/smart-navigation";
import { ExportKeyRingData } from "@keplr-wallet/background";
import { Controller, useForm } from "react-hook-form";
import {
  registerExportedAddressBooks,
  registerExportedKeyRingDatas,
} from "utils/import-from-extension";
import {
  AddressBookConfigMap,
  AddressBookData,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { AsyncKVStore } from "../../../common";
import { InputCardView } from "components/new/card-view/input-card";
import { IconButton } from "components/new/button/icon";
import { EyeIcon } from "components/new/icon/eye";
import { HideEyeIcon } from "components/new/icon/hide-eye-icon";
import { PasswordValidateView } from "components/new/password-validate/password-validate";
import { XmarkIcon } from "components/new/icon/xmark";
import { CheckIcon } from "components/new/icon/check";

interface FormData {
  password: string;
  confirmPassword: string;
}

export const ImportFromExtensionSetPasswordScreen: FunctionComponent = observer(
  () => {
    const { chainStore, keyRingStore } = useStore();

    const [addressBookConfigMap] = useState(
      () =>
        new AddressBookConfigMap(new AsyncKVStore("address_book"), chainStore)
    );

    const route = useRoute<
      RouteProp<
        Record<
          string,
          {
            registerConfig: RegisterConfig;
            exportKeyRingDatas: ExportKeyRingData[];
            addressBooks: { [chainId: string]: AddressBookData[] | undefined };
          }
        >,
        string
      >
    >();

    const smartNavigation = useSmartNavigation();

    const style = useStyle();

    const [isCreating, setIsCreating] = useState(false);

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const {
      control,
      handleSubmit,
      setFocus,
      getValues,
      formState: { errors },
    } = useForm<FormData>();

    const submit = handleSubmit(async () => {
      setIsCreating(true);

      try {
        await registerExportedKeyRingDatas(
          keyRingStore,
          route.params.registerConfig,
          route.params.exportKeyRingDatas,
          getValues("password")
        );

        await registerExportedAddressBooks(
          addressBookConfigMap,
          route.params.addressBooks
        );

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
        smartNavigation.goBack();
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
                  setFocus("confirmPassword");
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
        <View style={style.get("flex-1")} />
        <Button
          text="Confirm"
          size="large"
          loading={isCreating}
          onPress={submit}
          containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
        />
        {/* Mock element for bottom padding */}
        <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      </PageWithScrollView>
    );
  }
);
