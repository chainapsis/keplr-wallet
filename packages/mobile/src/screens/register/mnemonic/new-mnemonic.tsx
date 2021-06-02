import React, { FunctionComponent } from "react";
import { Text } from "react-native-elements";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../../common";
import { useNavigation } from "@react-navigation/native";
import { FullPage } from "../../../components/page";
import { FlexButton } from "../../../components/buttons";
import { NewMnemonicConfig, useNewMnemonicConfig, NumWords } from "./hook";
import { useForm, Controller } from "react-hook-form";
import {
  alignItemsCenter,
  flexDirectionRow,
  h2,
  justifyContentCenter,
  sf,
  fcWhite,
  bgcWhite,
  alignItemsEnd,
  justifyContentBetween,
  mb2,
  h7,
  bw1,
  bcPrimary300,
  py1,
  px2,
  bgcPrimary300,
  fcPrimary300,
} from "../../../styles";
import { Input } from "../../../components/form";
import { RectButton } from "react-native-gesture-handler";
import { SuggestedWordsView } from "../../../components/mnemonic";

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
    label: string,
    onPress: () => void
  ) => {
    const [backgroundColor, textColor] =
      index === selectedIndex
        ? [bgcPrimary300, fcWhite]
        : [bgcWhite, fcPrimary300];

    return (
      <RectButton style={backgroundColor} onPress={onPress}>
        <View
          accessible
          style={sf([alignItemsCenter, justifyContentCenter, py1, px2])}
        >
          <Text style={sf([textColor, h7])}>{label}</Text>
        </View>
      </RectButton>
    );
  };

  const wordButtons = [
    renderWordButton(0, selectedIndex, "12 Words", () => {
      newMnemonicConfig.setNumWords(NumWords.WORDS12);
    }),
    renderWordButton(1, selectedIndex, "24 Words", () => {
      newMnemonicConfig.setNumWords(NumWords.WORDS24);
    }),
  ];

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
        <View style={sf([flexDirectionRow, bw1, bcPrimary300])}>
          {wordButtons.map((button) => {
            return button;
          })}
        </View>
      </View>
      <SuggestedWordsView
        newMnemonicConfig={newMnemonicConfig}
        suggestedWords={newMnemonicConfig.mnemonic.split(" ")}
      />
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
      <FlexButton
        title="Next"
        onPress={() => {
          handleSubmit(onSubmit)();
        }}
      />
    </FullPage>
  );
});
