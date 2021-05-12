import React, {
  FunctionComponent,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Text } from "react-native-elements";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../../common";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaPage } from "../../../components/page";
import { FlexButton } from "../../../components/buttons";
import { NewMnemonicConfig, NumWords } from "./hook";
import { h2 } from "../../../styles";
import {
  RandomizedWord,
  RandomizedWordsView,
  SuggestedWordsView,
} from "../../../components/mnemonic";

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

    const wordsSlice = useMemo(() => {
      const words = newMnemonicConfig.mnemonic.split(" ");
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim();
      }
      return words;
    }, [newMnemonicConfig.mnemonic]);

    const [randomizedWords, setRandomizedWords] = useState<RandomizedWord[]>(
      []
    );
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

    return (
      <SafeAreaPage>
        <Text style={h2}>Mnemonic</Text>
        <SuggestedWordsView
          newMnemonicConfig={newMnemonicConfig}
          currentCursor={currentCursor}
          suggestedWords={suggestedWords}
          onSelect={setCursor}
          onUnselect={unselectSuggestedWords}
        />
        <RandomizedWordsView
          randomizedWords={randomizedWords}
          onSelect={selectRandomizedWord}
          onUnselect={unselectRandomizedWord}
        />
        <FlexButton
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
