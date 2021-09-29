import React, { FunctionComponent, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { observer } from "mobx-react-lite";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useNewMnemonicConfig } from "./hook";
import { PageWithScrollView } from "../../../components/page";
import { CheckIcon } from "../../../components/icon";
import { useStyle } from "../../../styles";
import { WordChip } from "../../../components/mnemonic";
import { Button } from "../../../components/button";
import Clipboard from "expo-clipboard";
import { TextInput } from "../../../components/input";
import { Controller, useForm } from "react-hook-form";
import { useSmartNavigation } from "../../../navigation";
import { useSimpleTimer } from "../../../hooks";
import { BIP44AdvancedButton, useBIP44Option } from "../bip44";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewMnemonicScreen: FunctionComponent = observer(() => {
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
  const bip44Option = useBIP44Option();

  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);
  const [mode] = useState(registerConfig.mode);

  const words = newMnemonicConfig.mnemonic.split(" ");

  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const submit = handleSubmit(() => {
    newMnemonicConfig.setName(getValues("name"));
    newMnemonicConfig.setPassword(getValues("password"));
    smartNavigation.navigateSmart("Register.VerifyMnemonic", {
      registerConfig,
      newMnemonicConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  });

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      {/* Mock for flexible margin top */}
      <View style={style.flatten(["max-height-32", "flex-1"])} />
      <Text
        style={style.flatten([
          "h5",
          "color-text-black-medium",
          "margin-bottom-4",
          "text-center",
        ])}
      >
        Backup your mnemonic securely
      </Text>
      <WordsCard words={words} />
      <Controller
        control={control}
        rules={{
          required: "Name is required",
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Wallet nickname"
              containerStyle={style.flatten(["padding-bottom-6"])}
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
      <BIP44AdvancedButton bip44Option={bip44Option} />
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
      <Button text="Next" size="large" onPress={submit} />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
  const style = useStyle();
  const { isTimedOut, setTimer } = useSimpleTimer();

  /*
    On IOS, user can peek the words by right side gesture from the verifying mnemonic screen.
    To prevent this, hide the words if the screen lost the focus.
   */
  const [hideWord, setHideWord] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setHideWord(false);
    } else {
      const timeout = setTimeout(() => {
        setHideWord(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isFocused]);

  return (
    <View
      style={style.flatten([
        "margin-top-14",
        "margin-bottom-16",
        "padding-24",
        "padding-x-28",
        "padding-bottom-12",
        "background-color-white",
        "border-radius-8",
        "flex-row",
        "flex-wrap",
      ])}
    >
      {words.map((word, i) => {
        return (
          <WordChip
            key={i.toString()}
            index={i + 1}
            word={word}
            hideWord={hideWord}
          />
        );
      })}
      <View style={style.flatten(["width-full"])}>
        <Button
          textStyle={style.flatten([
            "text-button1",
            isTimedOut ? "color-success" : "color-primary",
          ])}
          mode="text"
          {...(isTimedOut && {
            rightIcon: (
              <View style={style.flatten(["margin-left-8"])}>
                <CheckIcon />
              </View>
            ),
          })}
          text="Copy to clipboard"
          onPress={() => {
            Clipboard.setString(words.join(" "));
            setTimer(3000);
          }}
        />
      </View>
    </View>
  );
};
