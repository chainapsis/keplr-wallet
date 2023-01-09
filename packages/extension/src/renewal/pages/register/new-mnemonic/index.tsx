import React, { FunctionComponent, useMemo } from "react";
import {
  RegisterSceneBox,
  RegisterSceneBoxHeader,
} from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import { useSceneTransition } from "../../../components/transition";
import { Column, Columns } from "../../../components/column";
import { TextInput } from "../../../components/input";
import { XAxis } from "../../../components/axis";
import { Styles } from "./styles";
import { Gutter } from "../../../components/gutter";

export const NewMnemonicScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const threeWords: string[][] = useMemo(() => {
    const words = "bag edit veteran phrase catch seat injury fade pact tomorrow pact charge".split(
      " "
    );

    let temp: string[] = [];
    const r: string[][] = [];
    for (const word of words) {
      temp.push(word);
      if (temp.length === 3) {
        r.push(temp);
        temp = [];
      }
    }

    if (temp.length !== 0) {
      r.push(temp);
    }

    return r;
  }, []);

  return (
    <RegisterSceneBox>
      <RegisterSceneBoxHeader>New mnemonic</RegisterSceneBoxHeader>
      <Stack>
        <Stack gutter="0.75rem">
          {threeWords.map((words, i) => {
            return (
              <Columns key={i} sum={3}>
                {words.map((word, j) => {
                  return (
                    <Column key={j} weight={1}>
                      <XAxis alignY="center">
                        <Styles.IndexText>{i * 3 + j + 1}.</Styles.IndexText>
                        <TextInput
                          value={word}
                          readOnly={true}
                          removeBottomMargin={true}
                        />
                      </XAxis>
                    </Column>
                  );
                })}
              </Columns>
            );
          })}
        </Stack>
        <Gutter size="1rem" />
        <Button
          mode="light"
          size="small"
          text="Set BIP Path"
          onClick={() => {
            alert("TODO");
          }}
        />
        <Gutter size="1rem" />
        <Button
          text="Next"
          onClick={() => {
            sceneTransition.pop();
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};
