import React, { forwardRef, useImperativeHandle, useState } from "react";
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

export interface VerifyingMnemonicBoxRef {
  validate: () => boolean;
}

// eslint-disable-next-line react/display-name
export const VerifyingMnemonicBox = forwardRef<
  VerifyingMnemonicBoxRef,
  {
    words: {
      index: number;
      word: string;
    }[];
  }
>(({ words }, ref) => {
  const [inputs, setInputs] = useState<Record<number, string | undefined>>({});

  const [validatingStarted, setValidatingStarted] = useState<boolean>(false);

  const validate = () => {
    setValidatingStarted(true);

    for (const word of words) {
      if (inputs[word.index]?.trim() !== word.word) {
        return false;
      }
    }

    return true;
  };

  useImperativeHandle(ref, () => {
    return { validate };
  });

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
            <React.Fragment key={word.index}>
              <XAxis alignY="center">
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
                  errorBorder={(() => {
                    if (validatingStarted) {
                      return inputs[word.index]?.trim() !== word.word;
                    }
                    return false;
                  })()}
                  removeBottomMargin={true}
                />
              </XAxis>
              {i !== words.length - 1 ? (
                <Gutter size="1.125rem" direction="horizontal" />
              ) : null}
            </React.Fragment>
          );
        })}
      </XAxis>
    </Box>
  );
});
