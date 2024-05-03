import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView } from "components/page";
import { FlatList, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { WordChip } from "components/mnemonic";
import { Button } from "components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "navigation/smart-navigation";
import { NewMnemonicConfig } from "../hook";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { RectButton } from "components/rect-button";
import { BIP44AdvancedButton, useBIP44Option } from "screens/register/bip44";
import { BipButtons } from "screens/register/bip-button";

export const VerifyMnemonicScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          newMnemonicConfig: NewMnemonicConfig;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = route.params.registerConfig;
  const newMnemonicConfig = route.params.newMnemonicConfig;

  const bip44Option = useBIP44Option();

  const [candidateWords, setCandidateWords] = useState<
    {
      word: string;
      usedIndex: number;
    }[]
  >([]);
  const [wordSet, setWordSet] = useState<(string | undefined)[]>([]);
  const [selectedDerivationPath, setIsSelectedDerivationPath] = useState(false);

  useEffect(() => {
    const words = newMnemonicConfig.mnemonic.split(" ");
    const randomSortedWords = words.slice().sort(() => {
      return Math.random() > 0.5 ? 1 : -1;
    });

    const candidateWords = randomSortedWords.slice();
    setCandidateWords(
      candidateWords.map((word) => {
        return {
          word,
          usedIndex: -1,
        };
      })
    );

    setWordSet(
      newMnemonicConfig.mnemonic.split(" ").map((_) => {
        return undefined;
      })
    );
  }, [newMnemonicConfig.mnemonic]);

  const firstEmptyWordSetIndex = wordSet.findIndex(
    (word) => word === undefined
  );

  const [isCreating, setIsCreating] = useState(false);

  const renderButtonItem = ({ item, index }: any) => {
    return (
      <WordButton
        key={index}
        word={item.word}
        used={item.usedIndex >= 0}
        onPress={() => {
          const newWordSet = wordSet.slice();
          const newCandiateWords = candidateWords.slice();
          if (item.usedIndex < 0) {
            if (firstEmptyWordSetIndex < 0) {
              return;
            }

            newWordSet[firstEmptyWordSetIndex] = item.word;
            setWordSet(newWordSet);

            newCandiateWords[index].usedIndex = firstEmptyWordSetIndex;
            setCandidateWords(newCandiateWords);
          } else {
            newWordSet[item.usedIndex] = undefined;
            setWordSet(newWordSet);

            newCandiateWords[index].usedIndex = -1;
            setCandidateWords(newCandiateWords);
          }
        }}
      />
    );
  };

  const undefinedFilterList = wordSet.filter((v) => v !== undefined);

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
            "margin-y-18",
            "font-normal",
          ]) as ViewStyle
        }
      >
        Verify your recovery phrase
      </Text>
      <View>
        <WordsCard
          wordSet={wordSet.map((word, i) => {
            return {
              word: word ?? "",
              empty: word === undefined,
              dashed: i === firstEmptyWordSetIndex,
            };
          })}
        />
        <BipButtons
          selected={selectedDerivationPath}
          setIsSelected={setIsSelectedDerivationPath}
          clearButtonDisable={undefinedFilterList.length === 0}
          onPressClearButton={() => {
            const words = newMnemonicConfig.mnemonic.split(" ");
            const randomSortedWords = words.slice().sort(() => {
              return Math.random() > 0.5 ? 1 : -1;
            });

            const candidateWords = randomSortedWords.slice();
            setCandidateWords(
              candidateWords.map((word) => {
                return {
                  word,
                  usedIndex: -1,
                };
              })
            );
            setWordSet(
              words.map((_) => {
                return undefined;
              })
            );
          }}
        />
        <BIP44AdvancedButton
          bip44Option={bip44Option}
          selected={selectedDerivationPath}
        />
      </View>
      <View style={style.flatten(["flex-1"])} />
      <View>
        <FlatList
          data={candidateWords}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderButtonItem}
          numColumns={4}
          scrollEnabled={false}
        />
        <Button
          containerStyle={
            style.flatten(["border-radius-32", "margin-top-24"]) as ViewStyle
          }
          text="Continue"
          size="large"
          loading={isCreating}
          disabled={wordSet.join(" ") !== newMnemonicConfig.mnemonic}
          textStyle={style.flatten(["body2"])}
          onPress={async () => {
            setIsCreating(true);
            smartNavigation.navigateSmart("Register.CreateAccount", {
              registerConfig: registerConfig,
              mnemonic: encodeURIComponent(
                JSON.stringify(newMnemonicConfig.mnemonic.trim())
              ),
              bip44HDPath: bip44Option.bip44HDPath,
            });
          }}
        />
        <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      </View>
      {/* Mock element for bottom padding */}
    </PageWithScrollView>
  );
});

const WordButton: FunctionComponent<{
  word: string;
  used: boolean;
  onPress: () => void;
}> = ({ word, used, onPress }) => {
  const style = useStyle();

  return (
    <RectButton
      style={
        style.flatten(
          [
            "padding-y-6",
            "margin-4",
            "flex-1",
            "border-radius-32",
            "border-width-1",
            "border-color-white@40%",
          ],
          [used && "border-color-white@20%"]
        ) as ViewStyle
      }
      onPress={onPress}
      rippleColor={"black@50%"}
    >
      <Text
        style={style.flatten(
          ["text-caption2", "color-white", "text-center"],
          [used && "color-white@20%"]
        )}
      >
        {word}
      </Text>
    </RectButton>
  );
};

const WordsCard: FunctionComponent<{
  wordSet: {
    word: string;
    empty: boolean;
    dashed: boolean;
  }[];
}> = ({ wordSet }) => {
  const renderItem = ({ item, index }: any) => {
    return (
      <WordChip
        key={index.toString()}
        word={item.word}
        empty={item.empty}
        dashedBorder={item.dashed}
      />
    );
  };

  return (
    <FlatList
      data={wordSet}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      numColumns={3}
      scrollEnabled={false}
    />
  );
};
