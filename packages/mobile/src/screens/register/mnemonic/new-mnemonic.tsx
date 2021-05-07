import React, { FunctionComponent, useMemo, useEffect, useState } from "react";
import { Text } from "react-native-elements";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../../common";
import { useNavigation } from "@react-navigation/native";
import { FullPage } from "../../../components/page";
import { Button } from "../../../components/buttons";
import { NewMnemonicConfig, useNewMnemonicConfig, NumWords } from "./hook";
import { useForm, Controller } from "react-hook-form";
import {
  alignItemsCenter,
  cardStyle,
  flexDirectionRow,
  h2,
  justifyContentCenter,
  sf,
  bgcPrimary,
  fcWhite,
  bgcWhite,
  mx0,
  mb0,
  shadow,
  alignItemsEnd,
  fcPrimary,
  bcPrimary,
  fAlignCenter,
  p2,
  mt2,
  justifyContentBetween,
  mb2,
  body2,
  h7,
} from "../../../styles";
import { ButtonGroup } from "react-native-elements";
import { Input } from "../../../components/input";

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}

const MnemonicCard: FunctionComponent<{
  newMnemonicConfig: NewMnemonicConfig;
}> = observer(({ newMnemonicConfig }) => {
  const selectedIndex = (() => {
    switch (newMnemonicConfig.numWords) {
      case NumWords.WORDS12:
        return 0;
      case NumWords.WORDS24:
        return 1;
      default:
        return undefined;
    }
  })();

  const renderWordButton = (
    index: number,
    selectedIndex: 0 | 1 | undefined,
    label: string
  ) => {
    const [backgroundColor, textColor] =
      index === selectedIndex ? [bgcPrimary, fcWhite] : [bgcWhite, fcPrimary];

    return (
      <View
        style={sf([alignItemsCenter, justifyContentCenter, backgroundColor])}
      >
        <Text style={sf([mt2, textColor, h7])}>{label}</Text>
      </View>
    );
  };

  return (
    <View>
      <View
        style={sf([
          flexDirectionRow,
          justifyContentBetween,
          alignItemsEnd,
          mb2,
        ])}
      >
        <Text style={h2}>Mnemonic</Text>
        <ButtonGroup
          containerStyle={sf([{ width: 170 }, mx0, mb0, shadow, bcPrimary])}
          selectedIndex={selectedIndex}
          onPress={(i) => {
            switch (i) {
              case 0:
                newMnemonicConfig.setNumWords(NumWords.WORDS12);
                break;
              case 1:
                newMnemonicConfig.setNumWords(NumWords.WORDS24);
                break;
            }
          }}
          buttons={[
            renderWordButton(0, selectedIndex, "12 Words"),
            renderWordButton(1, selectedIndex, "24 Words"),
          ]}
        />
      </View>
      <View
        style={sf([
          cardStyle,
          justifyContentCenter,
          alignItemsCenter,
          p2,
          { height: 100 },
        ])}
      >
        <Text style={sf([fAlignCenter, body2])} numberOfLines={5}>
          {newMnemonicConfig.mnemonic}
        </Text>
      </View>
    </View>
  );
});

export const GenerateMnemonicScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  const { keyRingStore } = useStore();

  const registerConfig = useRegisterConfig(
    keyRingStore,
    [],
    getRandomBytesAsync
  );
  const newMnemonicConfig: NewMnemonicConfig = useNewMnemonicConfig(
    registerConfig
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      name: newMnemonicConfig.name,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = ({ name, password }: FormData) => {
    newMnemonicConfig.setName(name);
    newMnemonicConfig.setPassword(password);

    newMnemonicConfig.setMode("verify");
    navigation.navigate("Verify account", {
      newMnemonicConfig,
    });
  };

  return (
    <FullPage>
      <MnemonicCard newMnemonicConfig={newMnemonicConfig} />
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Name"
            value={value}
            onChangeText={onChange}
            errorMessage={
              errors.name && errors.name.message
                ? errors.name.message
                : undefined
            }
          />
        )}
        name="name"
        rules={{
          required: { value: true, message: "Name is required" },
        }}
      />
      {registerConfig.mode === "create" ? (
        <React.Fragment>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                autoCompleteType="password"
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
                errorMessage={
                  errors.password && errors.password.message
                    ? errors.password.message
                    : undefined
                }
              />
            )}
            name="password"
            rules={{
              required: { value: true, message: "Password is required" },
              minLength: { value: 8, message: "At least 8" },
            }}
          />
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm password"
                autoCompleteType="password"
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
                errorMessage={
                  errors.confirmPassword && errors.confirmPassword.message
                    ? errors.confirmPassword.message
                    : undefined
                }
              />
            )}
            name="confirmPassword"
            rules={{
              required: {
                value: true,
                message: "Confirm Password is required",
              },
              minLength: { value: 8, message: "At least 8" },
              validate: (confirmPassword: string): string | undefined => {
                if (confirmPassword !== getValues()["password"]) {
                  return "password is not matched";
                }
              },
            }}
          />
        </React.Fragment>
      ) : null}
      <Button title="Next" onPress={handleSubmit(onSubmit)} />
    </FullPage>
  );
});
