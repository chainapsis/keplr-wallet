import React, { FunctionComponent, useMemo, useEffect, useState } from "react";
import { Button as RNButton, Card, Text } from "react-native-elements";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../../common";
import { useNavigation } from "@react-navigation/native";
import { FullPage, SafeAreaPage } from "../../../components/page";
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
  m2,
  br3,
  py1,
  justifyContentAround,
  mr2,
  bw1,
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

export const VerifyMnemonicScreen: FunctionComponent<{
  route: {
    params: {
      newMnemonicConfig: NewMnemonicConfig;
    };
  };
}> = observer(
  ({
    route: {
      params: { newMnemonicConfig },
    },
  }) => {
    const navigation = useNavigation();

    const { keyRingStore } = useStore();

    const registerConfig = useRegisterConfig(
      keyRingStore,
      [],
      getRandomBytesAsync
    );

    const wordsSlice = useMemo(() => {
      const words = newMnemonicConfig.mnemonic.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
      }
      return words;
    }, [newMnemonicConfig.mnemonic]);

    const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
    const [suggestedWords, setSuggestedWords] = useState<string[]>([]);

    const addWord = (i: number) => {
      const word = suggestedWords[i];
      setSuggestedWords(
        suggestedWords.slice(0, i).concat(suggestedWords.slice(i + 1))
      );
      randomizedWords.push(word);
      setRandomizedWords(randomizedWords.slice());
    };

    const removeWord = (i: number) => {
      const word = randomizedWords[i];
      setRandomizedWords(
        randomizedWords.slice(0, i).concat(randomizedWords.slice(i + 1))
      );
      suggestedWords.push(word);
      setSuggestedWords(suggestedWords.slice());
    };

    useEffect(() => {
      // Set randomized words.
      const words = newMnemonicConfig.mnemonic.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
      }
      words.sort((word1, word2) => {
        // Sort alpahbetically.
        return word1 > word2 ? 1 : -1;
      });
      setRandomizedWords(words);
      // Clear suggested words.
      setSuggestedWords([]);
    }, [newMnemonicConfig.mnemonic]);

    return (
      <SafeAreaPage>
        <Text style={h2}>Mnemonic</Text>
        <Card>
          <View
            style={sf([
              flexDirectionRow,
              justifyContentAround,
              { flexWrap: "wrap" },
            ])}
          >
            {suggestedWords.map((word, i) => {
              return (
                <View
                  key={word + i.toString()}
                  style={sf([flexDirectionRow, alignItemsCenter])}
                >
                  <Text style={sf([mr2, fcPrimary])}>{i + 1}.</Text>
                  <RNButton
                    containerStyle={sf([m2, br3, { width: 110 }])}
                    buttonStyle={py1}
                    onPress={() => {
                      addWord(i);
                    }}
                    title={word}
                  />
                </View>
              );
            })}
            {randomizedWords.map((word, i) => {
              return (
                <View
                  key={word + i.toString()}
                  style={sf([flexDirectionRow, alignItemsCenter])}
                >
                  <Text style={sf([mr2, fcPrimary])}>
                    {suggestedWords.length + i + 1}.
                  </Text>
                  <View
                    style={sf([
                      m2,
                      br3,
                      py1,
                      { width: 110, borderStyle: "dashed" },
                      bw1,
                      bcPrimary,
                    ])}
                  >
                    <Text> </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
        <View
          style={sf([
            flexDirectionRow,
            justifyContentAround,
            { flexWrap: "wrap" },
          ])}
        >
          {randomizedWords.map((word, i) => {
            return (
              <RNButton
                key={word + i.toString()}
                containerStyle={sf([m2, br3, { width: 110 }])}
                buttonStyle={py1}
                onPress={() => {
                  removeWord(i);
                }}
                title={word}
              />
            );
          })}
        </View>
        <Button
          title="Generate"
          disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
          onPress={async () => {
            try {
              await registerConfig.createMnemonic(
                newMnemonicConfig.name,
                newMnemonicConfig.mnemonic,
                newMnemonicConfig.password,
                {
                  account: 0,
                  change: 0,
                  addressIndex: 0,
                }
              );

              navigation.navigate("Main");
            } catch {
              registerConfig.clear();
            }
          }}
          loading={registerConfig.isLoading}
        />
      </SafeAreaPage>
    );
  }
);
