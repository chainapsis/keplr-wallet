import React, { forwardRef } from "react";
import { TextInputProps } from "./types";
import { Styles } from "./styles";
import { Column, Columns } from "../../column";
import { Box } from "../../box";
import { VerticalResizeTransition } from "../../transition";
import { LoadingIcon } from "../../icon";
import { ColorPalette } from "../../../styles";

// eslint-disable-next-line react/display-name
export const TextInput = forwardRef<
  HTMLInputElement,
  TextInputProps & React.InputHTMLAttributes<HTMLInputElement>
>(
  (
    {
      className,
      style,
      label,
      paragraph,
      error,
      rightLabel,
      left,
      right,
      bottom,
      isLoading,
      ...props
    },
    ref
  ) => {
    return (
      <Styles.Container className={className} style={style}>
        <Columns sum={1} alignY="center">
          {label ? (
            <Columns sum={1} gutter="0.25rem">
              <Styles.Label>{label}</Styles.Label>
              {isLoading ? (
                <LoadingIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["gray-300"]}
                />
              ) : null}
            </Columns>
          ) : null}
          <Column weight={1} />
          {rightLabel ? <Box>{rightLabel}</Box> : null}
        </Columns>

        <Styles.TextInputContainer
          paragraph={paragraph}
          error={error}
          {...props}
        >
          <Columns sum={1}>
            {left ? (
              <Box alignY="center" marginLeft="1rem">
                <Styles.Icon>
                  <Box>{left}</Box>
                </Styles.Icon>
              </Box>
            ) : null}

            <Column weight={1}>
              <Styles.TextInput
                {...props}
                paragraph={paragraph}
                error={error}
                ref={ref}
              />
            </Column>
            {right ? (
              <Box alignY="center" marginRight="1rem">
                <Styles.Icon>
                  <Box>{right}</Box>
                </Styles.Icon>
              </Box>
            ) : null}
          </Columns>
        </Styles.TextInputContainer>

        {bottom}

        <VerticalResizeTransition transitionAlign="top">
          {error || paragraph ? (
            <Styles.SubText error={error} paragraph={paragraph}>
              {error || paragraph}
            </Styles.SubText>
          ) : null}
        </VerticalResizeTransition>
      </Styles.Container>
    );
  }
);
