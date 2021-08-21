import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView } from "../../../../components/staging/page";
import { Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import { WordChip } from "./components";
import { Button } from "../../../../components/staging/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../../navigation";
import { NewMnemonicConfig } from "./hook";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { RectButton } from "../../../../components/staging/rect-button";

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

  const [candidateWords, setCandidateWords] = useState<string[]>([]);

  useEffect(() => {
    const words = newMnemonicConfig.mnemonic.split(" ");
    const randomSortedWords = words.slice().sort(() => {
      return Math.random() > 0.5 ? 1 : -1;
    });

    const candidateWords = randomSortedWords.slice(0, 5);
    setCandidateWords(candidateWords);
  }, [newMnemonicConfig.mnemonic]);

  const words = newMnemonicConfig.mnemonic.split(" ");

  const wordSet = words.map((word) => {
    return {
      word,
      dashed: false,
      empty: candidateWords.includes(word),
    };
  });

  const firstEmptyWordSet = wordSet.find((set) => set.empty);
  if (firstEmptyWordSet) {
    firstEmptyWordSet.dashed = true;
  }

  const [isCreating, setIsCreating] = useState(false);

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
      <WordsCard wordSet={wordSet} />
      <View style={style.flatten(["flex-row", "flex-wrap"])}>
        {candidateWords.map((word, i) => {
          return (
            <WordButton
              key={i.toString()}
              word={word}
              onPress={() => {
                if (!firstEmptyWordSet || firstEmptyWordSet.word !== word) {
                  return;
                }

                const newCadidateWords = candidateWords.filter(
                  (_word) => _word !== word
                );
                setCandidateWords(newCadidateWords);
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
        disabled={wordSet.find((set) => set.empty) != null}
        onPress={async () => {
          setIsCreating(true);
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

          smartNavigation.reset({
            index: 0,
            routes: [
              {
                name: "Register.End",
              },
            ],
          });
        }}
      />
    </PageWithScrollView>
  );
});

const WordButton: FunctionComponent<{
  word: string;
  onPress: () => void;
}> = ({ word, onPress }) => {
  const style = useStyle();

  return (
    <RectButton
      style={style.flatten([
        "background-color-primary",
        "padding-x-12",
        "padding-y-4",
        "margin-right-12",
        "margin-bottom-12",
        "border-radius-8",
      ])}
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
