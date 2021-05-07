import React, {
  FunctionComponent,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Card, Text } from "react-native-elements";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../../common";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaPage } from "../../../components/page";
import { Button } from "../../../components/buttons";
import { NewMnemonicConfig, NumWords } from "./hook";
import { RectButton } from "react-native-gesture-handler";
import {
  alignItemsCenter,
  flexDirectionRow,
  h2,
  justifyContentCenter,
  sf,
  bgcPrimary,
  fcWhite,
  fcPrimary,
  bcPrimary,
  m2,
  py1,
  justifyContentAround,
  mr2,
  bw1,
  body3,
  br2,
  m1,
  subtitle2,
  bgcDarkGrey,
  flex1,
  bcGray,
} from "../../../styles";

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

    const totalWords =
      newMnemonicConfig.numWords === NumWords.WORDS24 ? 24 : 12;

    const rowNum = newMnemonicConfig.numWords === NumWords.WORDS24 ? 8 : 6;

    const wordsSlice = useMemo(() => {
      const words = newMnemonicConfig.mnemonic.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
      }
      return words;
    }, [newMnemonicConfig.mnemonic]);

    const [randomizedWords, setRandomizedWords] = useState<
      { value: string; isSelected: boolean }[]
    >([]);
    const [suggestedWords, setSuggestedWords] = useState<string[]>([]);

    const [currentCursor, setCurrentCursor] = useState<number>(0);

    const setFirstCursor = useCallback(() => {
      setCurrentCursor(suggestedWords.findIndex((value) => value === ""));
    }, [suggestedWords]);

    const setCursor = (i: number) => {
      setCurrentCursor(i);
    };

    const unselectSuggestedWords = (i: number) => {
      const word = suggestedWords[i];
      const unselectIndex = randomizedWords.findIndex(
        (value) => value.value === word
      );

      randomizedWords[unselectIndex].isSelected = false;
      setRandomizedWords(randomizedWords.slice());

      suggestedWords[i] = "";
      setSuggestedWords(suggestedWords.slice());

      setCurrentCursor(i);
    };

    const selectRandomizedWord = (i: number) => {
      const word = randomizedWords[i].value;
      randomizedWords[i].isSelected = true;
      setRandomizedWords(randomizedWords.slice());

      suggestedWords[currentCursor] = word;
      setSuggestedWords(suggestedWords.slice());

      setFirstCursor();
    };

    const unselectRandomizedWord = (i: number) => {
      const word = randomizedWords[i].value;
      randomizedWords[i].isSelected = false;
      setRandomizedWords(randomizedWords.slice());

      const unselectIndex = suggestedWords.findIndex((value) => value === word);
      suggestedWords[unselectIndex] = "";
      setSuggestedWords(suggestedWords.slice());

      setCurrentCursor(unselectIndex);
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

      setRandomizedWords(
        words.map((value) => {
          return { value, isSelected: false };
        })
      );
      // Clear suggested words.
      setSuggestedWords(Array.from({ length: totalWords }, () => ""));
    }, [newMnemonicConfig.mnemonic, totalWords]);

    useEffect(() => {
      if (suggestedWords[currentCursor] !== "") {
        setFirstCursor();
      }
    }, [currentCursor, setFirstCursor, suggestedWords]);

    const SuggestedItem: FunctionComponent<{ i: number; word: string }> = ({
      i,
      word,
    }) => {
      return (
        <View style={sf([flexDirectionRow, alignItemsCenter])}>
          <Text style={sf([mr2, fcPrimary, subtitle2])}>{i + 1}.</Text>
          {word !== "" ? (
            <RectButton
              onPress={() => {
                unselectSuggestedWords(i);
              }}
              style={sf([bgcPrimary, m1, br2, py1, { width: 80 }])}
            >
              <View
                accessible
                style={sf([justifyContentCenter, alignItemsCenter])}
              >
                <Text style={sf([fcWhite, body3])}>{word}</Text>
              </View>
            </RectButton>
          ) : (
            <RectButton
              onPress={() => {
                setCursor(i);
              }}
              style={sf([
                m2,
                br2,
                py1,
                { width: 80, borderStyle: "dashed" },
                bw1,
                i === currentCursor ? bcPrimary : bcGray,
              ])}
            >
              <View
                accessible
                style={sf([justifyContentCenter, alignItemsCenter])}
              >
                <Text style={sf([fcWhite, body3])}> </Text>
              </View>
            </RectButton>
          )}
        </View>
      );
    };

    const RandomizedItem: FunctionComponent<{
      i: number;
      isSelected: boolean;
      value: string;
    }> = ({ isSelected, value, i }) => {
      return isSelected ? (
        <RectButton
          onPress={() => {
            unselectRandomizedWord(i);
          }}
          style={sf([bgcDarkGrey, m1, br2, py1, { width: 80 }])}
        >
          <View accessible style={sf([justifyContentCenter, alignItemsCenter])}>
            <Text style={sf([fcWhite, body3])}>{value}</Text>
          </View>
        </RectButton>
      ) : (
        <RectButton
          onPress={() => {
            selectRandomizedWord(i);
          }}
          style={sf([bgcPrimary, m1, br2, py1, { width: 80 }])}
        >
          <View accessible style={sf([justifyContentCenter, alignItemsCenter])}>
            <Text style={sf([fcWhite, body3])}>{value}</Text>
          </View>
        </RectButton>
      );
    };

    return (
      <SafeAreaPage>
        <Text style={h2}>Mnemonic</Text>
        <Card>
          <View style={sf([flexDirectionRow])}>
            <View style={flex1}>
              {suggestedWords
                .filter((_, index) => index < rowNum)
                .map((word, i) => {
                  return (
                    <SuggestedItem
                      key={word + i.toString()}
                      word={word}
                      i={i}
                    />
                  );
                })}
            </View>
            <View style={flex1}>
              {suggestedWords
                .filter((_, index) => index >= rowNum && index < rowNum * 2)
                .map((word, i) => {
                  return (
                    <SuggestedItem
                      key={word + i.toString()}
                      word={word}
                      i={i + rowNum}
                    />
                  );
                })}
            </View>
            {newMnemonicConfig.numWords === NumWords.WORDS24 ? (
              <View style={flex1}>
                {suggestedWords
                  .filter((_, index) => index >= rowNum * 2)
                  .map((word, i) => {
                    return (
                      <SuggestedItem
                        key={word + i.toString()}
                        word={word}
                        i={i + rowNum * 2}
                      />
                    );
                  })}
              </View>
            ) : null}
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
              <RandomizedItem
                key={word.value + i.toString()}
                i={i}
                isSelected={word.isSelected}
                value={word.value}
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
