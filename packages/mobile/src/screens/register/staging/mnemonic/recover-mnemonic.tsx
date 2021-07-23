import React, { FunctionComponent, useState } from "react";
import { PageWithScrollView } from "../../../../components/staging/page";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useStyle } from "../../../../styles";
import { useSmartNavigation } from "../../../../navigation";
import { Controller, useForm } from "react-hook-form";
import { TextInput } from "../../../../components/staging/input";
import { StyleSheet, View } from "react-native";
import { Button } from "../../../../components/staging/button";
import Clipboard from "expo-clipboard";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map((word) => word.trim())
    .filter((word) => word.trim().length > 0);
  return words.join(" ");
}

interface FormData {
  mnemonic: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export const RecoverMnemonicScreen: FunctionComponent = observer(() => {
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

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const [mode] = useState(registerConfig.mode);

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);

  const submit = handleSubmit(async () => {
    setIsCreating(true);
    await registerConfig.createMnemonic(
      getValues("name"),
      getValues("mnemonic"),
      getValues("password"),
      {
        account: 0,
        change: 0,
        addressIndex: 0,
      }
    );

    smartNavigation.reset({
      index: 0,
      routes: [
        {
          name: "Register.End",
        },
      ],
    });
  });

  return (
    <PageWithScrollView contentContainerStyle={style.get("flex-grow-1")}>
      <Controller
        control={control}
        rules={{
          required: "Mnemonic is required",
          validate: (value: string) => {
            value = trimWordsStr(value);
            if (value.split(" ").length < 8) {
              return "Too short mnemonic";
            }

            if (!bip39.validateMnemonic(value)) {
              return "Invalid mnemonic";
            }
          },
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Mnemonic"
              returnKeyType="next"
              multiline={true}
              numberOfLines={4}
              inputContainerStyle={style.flatten([
                "padding-x-20",
                "padding-y-16",
              ])}
              bottomInInputContainer={
                <View style={style.flatten(["flex-row"])}>
                  <View style={style.flatten(["flex-1"])} />
                  <Button
                    containerStyle={style.flatten(["height-36"])}
                    style={style.flatten(["padding-x-12"])}
                    mode="text"
                    text="Paste"
                    onPress={async () => {
                      const text = await Clipboard.getStringAsync();
                      if (text) {
                        setValue("mnemonic", text, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                </View>
              }
              style={StyleSheet.flatten([
                style.flatten(["h6", "color-text-black-medium"]),
                {
                  minHeight: 20 * 4,
                  textAlignVertical: "top",
                },
              ])}
              onSubmitEditing={() => {
                setFocus("name");
              }}
              error={errors.mnemonic?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="mnemonic"
        defaultValue=""
      />
      <Controller
        control={control}
        rules={{
          required: "Name is required",
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Account Name"
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
              required: "Confirm Password is required",
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
                  label="Confirm Password"
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
      <Button text="Next" size="large" loading={isCreating} onPress={submit} />
    </PageWithScrollView>
  );
});
