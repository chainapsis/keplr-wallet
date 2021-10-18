import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView } from "../../../components/page";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { WordChip } from "../../../components/mnemonic";
import { Button } from "../../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../navigation";
import { NewMnemonicConfig } from "./hook";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { RectButton } from "../../../components/rect-button";
import { useStore } from "../../../stores";
import { BIP44HDPath } from "@keplr-wallet/background";

export const VerifyMnemonicScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          newMnemonicConfig: NewMnemonicConfig;
          bip44HDPath: BIP44HDPath;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const { analyticsStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const registerConfig = route.params.registerConfig;
  const newMnemonicConfig = route.params.newMnemonicConfig;

  const [candidateWords, setCandidateWords] = useState<
    {
      word: string;
      usedIndex: number;
    }[]
  >([]);
  const [wordSet, setWordSet] = useState<(string | undefined)[]>([]);

  useEffect(() => {
    const words = newMnemonicConfig.mnemonic.split(" ");
    const randomSortedWords = words.slice().sort(() => {
      return Math.random() > 0.5 ? 1 : -1;
    });

    const candidateWords = randomSortedWords.slice(0, 5);
    setCandidateWords(
      candidateWords.map((word) => {
        return {
          word,
          usedIndex: -1,
        };
      })
    );

    setWordSet(
      newMnemonicConfig.mnemonic.split(" ").map((word) => {
        return candidateWords.includes(word) ? undefined : word;
      })
    );
  }, [newMnemonicConfig.mnemonic]);

  const firstEmptyWordSetIndex = wordSet.findIndex(
    (word) => word === undefined
  );

  const [isCreating, setIsCreating] = useState(false);

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
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
      <WordsCard
        wordSet={wordSet.map((word, i) => {
          return {
            word: word ?? "",
            empty: word === undefined,
            dashed: i === firstEmptyWordSetIndex,
          };
        })}
      />
      <View style={style.flatten(["flex-row", "flex-wrap"])}>
        {candidateWords.map(({ word, usedIndex }, i) => {
          return (
            <WordButton
              key={i.toString()}
              word={word}
              used={usedIndex >= 0}
              onPress={() => {
                const newWordSet = wordSet.slice();
                const newCandiateWords = candidateWords.slice();
                if (usedIndex < 0) {
                  if (firstEmptyWordSetIndex < 0) {
                    return;
                  }

                  newWordSet[firstEmptyWordSetIndex] = word;
                  setWordSet(newWordSet);

                  newCandiateWords[i].usedIndex = firstEmptyWordSetIndex;
                  setCandidateWords(newCandiateWords);
                } else {
                  newWordSet[usedIndex] = undefined;
                  setWordSet(newWordSet);

                  newCandiateWords[i].usedIndex = -1;
                  setCandidateWords(newCandiateWords);
                }
              }}
            />
          );
        })}
      </View>
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Next"
        size="large"
        loading={isCreating}
        disabled={wordSet.join(" ") !== newMnemonicConfig.mnemonic}
        onPress={async () => {
          setIsCreating(true);
          await registerConfig.createMnemonic(
            newMnemonicConfig.name,
            newMnemonicConfig.mnemonic,
            newMnemonicConfig.password,
            route.params.bip44HDPath
          );
          analyticsStore.setUserId();
          analyticsStore.setUserProperties({
            registerType: "seed",
          });
          analyticsStore.logEvent("Create account finished", {
            accountType: "mnemonic",
          });

          smartNavigation.reset({
            index: 0,
            routes: [
              {
                name: "Register.End",
                params: {
                  password: newMnemonicConfig.password,
                },
              },
            ],
          });
        }}
      />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"])} />
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
      style={style.flatten(
        [
          "background-color-primary",
          "padding-x-12",
          "padding-y-4",
          "margin-right-12",
          "margin-bottom-12",
          "border-radius-8",
        ],
        [used && "background-color-primary-100"]
      )}
      onPress={onPress}
    >
      <Text style={style.flatten(["subtitle2", "color-white"])}>{word}</Text>
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
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "margin-top-14",
        "margin-bottom-20",
        "padding-y-24",
        "padding-x-28",
        "background-color-white",
        "border-radius-8",
        "flex-row",
        "flex-wrap",
      ])}
    >
      {wordSet.map((word, i) => {
        return (
          <WordChip
            key={i.toString()}
            index={i + 1}
            word={word.word}
            empty={word.empty}
            dashedBorder={word.dashed}
          />
        );
      })}
    </View>
  );
};
