import React, { FunctionComponent, useState } from "react";
import { View, Text } from "react-native";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useNewMnemonicConfig } from "./hook";
import { PageWithScrollView } from "../../../../components/staging/page";
import { useStyle } from "../../../../styles";
import { WordChip } from "../../../../components/staging/mnemonic";
import { Button } from "../../../../components/staging/button";
import Clipboard from "expo-clipboard";
import { TextInput } from "../../../../components/staging/input";
import { Controller, useForm } from "react-hook-form";
import { useSmartNavigation } from "../../../../navigation";

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
    });
  });

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page", "padding-bottom-12"])}
    >
      <Text
        style={style.flatten([
          "h5",
          "color-text-black-medium",
          "margin-top-32",
          "margin-bottom-4",
          "text-center",
        ])}
      >
        Backup your mnemonic seed securely.
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
      <Button text="Next" size="large" onPress={submit} />
    </PageWithScrollView>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
  const style = useStyle();

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
        return <WordChip key={i.toString()} index={i + 1} word={word} />;
      })}
      <View style={style.flatten(["width-full"])}>
        <Button
          textStyle={style.flatten(["text-button1"])}
          mode="text"
          text="Copy to Clipboard"
          onPress={() => {
            Clipboard.setString(words.join(" "));
          }}
        />
      </View>
    </View>
  );
};
