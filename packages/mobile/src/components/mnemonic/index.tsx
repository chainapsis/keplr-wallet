import React, { FunctionComponent } from "react";
import { Card, Text } from "react-native-elements";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import {
  NewMnemonicConfig,
  NumWords,
} from "../../screens/register/mnemonic/hook";
import { RectButton } from "react-native-gesture-handler";
import {
  alignItemsCenter,
  flexDirectionRow,
  justifyContentCenter,
  sf,
  bgcPrimary,
  fcWhite,
  fcPrimary,
  bcPrimary,
  py1,
  justifyContentAround,
  bw1,
  body3,
  br2,
  m1,
  subtitle2,
  bgcDarkGrey,
  flex1,
  flexWrap,
  bDashed,
  bcWhiteGrey,
} from "../../styles";

export interface RandomizedWord {
  value: string;
  isSelected: boolean;
}

export const SuggestedWordsView: FunctionComponent<{
  newMnemonicConfig: NewMnemonicConfig;
  suggestedWords: string[];
  currentCursor?: number;
  onSelect?: (index: number) => void;
  onUnselect?: (index: number) => void;
}> = observer(
  ({
    newMnemonicConfig,
    suggestedWords,
    currentCursor,
    onSelect,
    onUnselect,
  }) => {
    const rowNum = newMnemonicConfig.numWords === NumWords.WORDS24 ? 8 : 6;

    const SuggestedItem: FunctionComponent<{ i: number; word: string }> = ({
      i,
      word,
    }) => {
      return (
        <View
          style={sf([flexDirectionRow, alignItemsCenter, justifyContentCenter])}
        >
          <View style={sf([{ width: 25 }])}>
            <Text style={sf([fcPrimary, subtitle2])}>{i + 1}.</Text>
          </View>
          {word !== "" ? (
            <RectButton
              onPress={() => {
                onUnselect ? onUnselect(i) : null;
              }}
              style={sf([bgcPrimary, m1, br2, { width: 80 }])}
            >
              <View
                accessible
                style={sf([justifyContentCenter, alignItemsCenter, py1])}
              >
                <Text style={sf([fcWhite, body3])}>{word}</Text>
              </View>
            </RectButton>
          ) : (
            <View
              style={sf([
                m1,
                br2,
                bDashed,
                bw1,
                i === currentCursor ? bcPrimary : bcWhiteGrey,
                { width: 80 },
              ])}
            >
              <RectButton
                onPress={() => {
                  onSelect ? onSelect(i) : null;
                }}
                style={sf([flex1, br2])}
              >
                <View
                  accessible
                  style={sf([justifyContentCenter, alignItemsCenter, py1])}
                >
                  <Text style={sf([fcWhite, body3])}> </Text>
                </View>
              </RectButton>
            </View>
          )}
        </View>
      );
    };
    return (
      <Card>
        <View style={sf([flexDirectionRow])}>
          <View style={flex1}>
            {suggestedWords
              .filter((_, index) => index < rowNum)
              .map((word, i) => {
                return (
                  <SuggestedItem key={word + i.toString()} word={word} i={i} />
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
    );
  }
);

export const RandomizedWordsView: FunctionComponent<{
  randomizedWords: RandomizedWord[];
  onSelect: (index: number) => void;
  onUnselect: (index: number) => void;
}> = observer(({ randomizedWords, onSelect, onUnselect }) => {
  const RandomizedItem: FunctionComponent<{
    i: number;
    isSelected: boolean;
    value: string;
  }> = ({ isSelected, value, i }) => {
    return isSelected ? (
      <RectButton
        onPress={() => {
          onUnselect(i);
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
          onSelect(i);
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
    <View style={sf([flexDirectionRow, justifyContentAround, flexWrap])}>
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
  );
});
