import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Box } from "../../../components/box";
import {
  TextInput,
  Styles as TextInputStyles,
} from "../../../components/input";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import styled, { useTheme } from "styled-components";
import { Gutter } from "../../../components/gutter";
import { useSceneEvents } from "../../../components/transition";
import { FormattedMessage } from "react-intl";

const Styles = {
  IndexText: styled.div`
    font-weight: 500;
    font-size: 0.875rem;
    text-align: right;
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-500"]
        : ColorPalette["gray-100"]};

    margin-right: 0.25rem;
  `,
};

const VerifyingWordInput = styled(TextInput)`
  ${TextInputStyles.TextInputContainer} {
    width: 6.625rem;
  }
  ${TextInputStyles.TextInput} {
    height: 3rem;
  }
`;

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
  const theme = useTheme();
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  useSceneEvents({
    onDidVisible: () => {
      firstInputRef.current?.focus();
    },
  });

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
      paddingY="1.5rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-500"]
      }
      borderRadius="0.5rem"
    >
      <YAxis alignX="center">
        <XAxis alignY="center">
          {words.map((word, i) => {
            return (
              <React.Fragment key={word.index}>
                <XAxis alignY="center">
                  <Styles.IndexText>
                    <FormattedMessage
                      id="pages.register.verify-mnemonic.verifying-box.word"
                      values={{ index: word.index + 1 }}
                    />
                  </Styles.IndexText>
                  <VerifyingWordInput
                    ref={i === 0 ? firstInputRef : undefined}
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
                  />
                </XAxis>
                {i !== words.length - 1 ? (
                  <Gutter size="1rem" direction="horizontal" />
                ) : null}
              </React.Fragment>
            );
          })}
        </XAxis>
      </YAxis>
    </Box>
  );
});
