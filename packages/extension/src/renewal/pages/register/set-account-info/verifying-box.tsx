import React, { FunctionComponent, useState } from "react";
import { Box } from "../../../components/box";
import { TextInput } from "../../../components/input";
import { XAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import styled from "styled-components";
import { Gutter } from "../../../components/gutter";

const Styles = {
  IndexText: styled.div`
    font-weight: 700;
    font-size: 1rem;
    line-height: 1rem;
    text-align: right;
    color: ${ColorPalette["platinum-300"]};

    min-width: 1.5rem;
    margin-right: 4px;
  `,
};

export const VerifyingMnemonicBox: FunctionComponent<{
  words: {
    index: number;
    word: string;
  }[];
}> = ({ words }) => {
  const [inputs, setInputs] = useState<Record<number, string | undefined>>({});

  return (
    <Box
      paddingX="3.875rem"
      paddingY="1.5rem"
      backgroundColor={ColorPalette["gray-10"]}
      borderRadius="0.5rem"
    >
      <XAxis alignY="center">
        {words.map((word, i) => {
          return (
            <XAxis key={word.index} alignY="center">
              <Styles.IndexText>{word.index + 1}.</Styles.IndexText>
              <TextInput
                value={inputs[word.index] ?? ""}
                onChange={(e) => {
                  e.preventDefault();

                  setInputs({
                    ...inputs,
                    [word.index]: e.target.value,
                  });
                }}
                errorBorder={true}
                removeBottomMargin={true}
              />
              {i !== words.length - 1 ? (
                <Gutter size="1.125rem" direction="horizontal" />
              ) : null}
            </XAxis>
          );
        })}
      </XAxis>
    </Box>
  );
};
